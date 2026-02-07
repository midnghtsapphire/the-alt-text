import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as taxDb from "../db/tax";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { extractReceiptData } from "../_core/vision";

// IRS Schedule C expense categories
const IRS_CATEGORIES = [
  "Advertising",
  "Car and Truck Expenses",
  "Commissions and Fees",
  "Contract Labor",
  "Depletion",
  "Depreciation",
  "Employee Benefit Programs",
  "Insurance",
  "Interest (Mortgage)",
  "Interest (Other)",
  "Legal and Professional Services",
  "Office Expense",
  "Pension and Profit-Sharing Plans",
  "Rent or Lease (Vehicles)",
  "Rent or Lease (Other)",
  "Repairs and Maintenance",
  "Supplies",
  "Taxes and Licenses",
  "Travel",
  "Meals",
  "Utilities",
  "Wages",
  "Other Expenses",
];

// AI-powered expense categorization
async function categorizeExpenseWithAI(description: string, vendor?: string, amount?: number) {
  const prompt = `You are a tax expert. Categorize this business expense into one of the IRS Schedule C categories.

Expense details:
- Vendor: ${vendor || "Unknown"}
- Description: ${description}
- Amount: $${amount || 0}

Available categories: ${IRS_CATEGORIES.join(", ")}

Respond with ONLY a JSON object in this exact format:
{
  "category": "exact category name from the list",
  "subcategory": "specific subcategory if applicable",
  "confidence": 0-100,
  "reasoning": "brief explanation",
  "deductiblePercentage": 100 or 50 for meals
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a tax categorization expert. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const message = response.choices[0]?.message;
    const content = typeof message?.content === 'string' ? message.content : "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const result = parsed as { category?: string; subcategory?: string; confidence?: number; reasoning?: string; deductiblePercentage?: number };
      return {
        category: result.category || "Other Expenses",
        subcategory: result.subcategory || null,
        confidence: result.confidence || 50,
        reasoning: result.reasoning || "AI categorization",
        deductiblePercentage: result.deductiblePercentage || 100,
      };
    }
  } catch (error) {
    console.error("[Tax] AI categorization failed:", error);
  }

  return {
    category: "Other Expenses",
    subcategory: null,
    confidence: 0,
    reasoning: "Failed to categorize",
    deductiblePercentage: 100,
  };
}

// Anomaly detection for spending patterns
async function detectAnomalies(userId: number, expense: { category: string; amount: number }) {
  const pattern = await taxDb.getSpendingPattern(userId, expense.category);
  
  if (!pattern || pattern.transactionCount < 5) {
    return null; // Not enough data for anomaly detection
  }

  const amount = Number(expense.amount);
  const avgAmount = Number(pattern.avgMonthlyAmount);
  const stdDev = Number(pattern.stdDeviation);

  // Check if expense is more than 2 standard deviations from average
  if (Math.abs(amount - avgAmount) > 2 * stdDev) {
    return {
      type: "anomaly" as const,
      severity: "warning" as const,
      title: "Unusual spending detected",
      message: `This ${expense.category} expense ($${amount}) is significantly different from your average ($${avgAmount.toFixed(2)})`,
    };
  }

  return null;
}

// Check for duplicate expenses
async function checkDuplicates(userId: number, expense: { date: Date; amount: number; vendor?: string }) {
  const startDate = new Date(expense.date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(expense.date);
  endDate.setHours(23, 59, 59, 999);

  const existingExpenses = await taxDb.getExpensesByUser(userId, {
    startDate,
    endDate,
    minAmount: Number(expense.amount) - 0.01,
    maxAmount: Number(expense.amount) + 0.01,
  });

  const duplicates = existingExpenses.filter(
    (e) => e.vendor?.toLowerCase() === expense.vendor?.toLowerCase()
  );

  if (duplicates.length > 0) {
    return {
      type: "duplicate" as const,
      severity: "warning" as const,
      title: "Possible duplicate expense",
      message: `You already have ${duplicates.length} expense(s) from ${expense.vendor} on this date for the same amount`,
      relatedExpenseId: duplicates[0].id,
    };
  }

  return null;
}

export const taxRouter = router({
  // ============================================================================
  // EXPENSES
  // ============================================================================

  createExpense: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        amount: z.number().positive(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        vendor: z.string().optional(),
        description: z.string(),
        paymentMethod: z.string().optional(),
        isRecurring: z.boolean().default(false),
        taxDeductible: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // AI categorization if category not provided
      let category = input.category;
      let subcategory = input.subcategory;
      let deductiblePercentage = 100;

      if (!category) {
        const aiResult = await categorizeExpenseWithAI(
          input.description,
          input.vendor,
          input.amount
        );
        category = aiResult.category;
        subcategory = aiResult.subcategory || undefined;
        deductiblePercentage = aiResult.deductiblePercentage;
      }

      // Create expense
      const expense = await taxDb.createExpense({
        userId: ctx.user.id,
        date: input.date,
        amount: input.amount.toString(),
        category: category || "Other Expenses",
        subcategory,
        vendor: input.vendor,
        description: input.description,
        paymentMethod: input.paymentMethod,
        isRecurring: input.isRecurring,
        taxDeductible: input.taxDeductible,
        deductiblePercentage,
        approvalStatus: "approved",
      });

      // Check for anomalies
      const anomaly = await detectAnomalies(ctx.user.id, {
        category: category || "Other Expenses",
        amount: input.amount,
      });

      if (anomaly) {
        await taxDb.createNotification({
          userId: ctx.user.id,
          ...anomaly,
          relatedExpenseId: expense.id,
        });
      }

      // Check for duplicates
      const duplicate = await checkDuplicates(ctx.user.id, {
        date: input.date,
        amount: input.amount,
        vendor: input.vendor,
      });

      if (duplicate) {
        await taxDb.createNotification({
          userId: ctx.user.id,
          ...duplicate,
        });
      }

      // Check for large purchase
      if (input.amount >= 500) {
        await taxDb.createNotification({
          userId: ctx.user.id,
          type: "large_purchase",
          severity: "info",
          title: "Large purchase recorded",
          message: `Expense of $${input.amount} from ${input.vendor || "unknown vendor"} has been recorded`,
          relatedExpenseId: expense.id,
        });
      }

      return expense;
    }),

  listExpenses: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        category: z.string().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return taxDb.getExpensesByUser(ctx.user.id, input);
    }),

  getExpense: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return taxDb.getExpenseById(input.id);
    }),

  updateExpense: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        date: z.date().optional(),
        amount: z.number().positive().optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        vendor: z.string().optional(),
        description: z.string().optional(),
        paymentMethod: z.string().optional(),
        taxDeductible: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return taxDb.updateExpense(id, {
        ...updates,
        amount: updates.amount?.toString(),
      } as any);
    }),

  deleteExpense: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await taxDb.deleteExpense(input.id);
      return { success: true };
    }),

  getExpenseStats: protectedProcedure
    .input(z.object({ year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return taxDb.getExpenseStats(ctx.user.id, input.year);
    }),

  getExpensesByCategory: protectedProcedure
    .input(z.object({ year: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return taxDb.getExpensesByCategory(ctx.user.id, input.year);
    }),

  // ============================================================================
  // RECEIPTS
  // ============================================================================

  uploadReceipt: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 encoded image
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Upload to S3
      const buffer = Buffer.from(input.imageData, "base64");
      const fileKey = `receipts/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Create receipt record
      const receiptResult = await taxDb.createReceipt({
        userId: ctx.user.id,
        imageUrl: url,
      });

      return {
        id: receiptResult.id,
        imageUrl: url,
      };
    }),

  listReceipts: protectedProcedure.query(async ({ ctx }) => {
    return taxDb.getReceiptsByUser(ctx.user.id);
  }),

  linkReceiptToExpense: protectedProcedure
    .input(
      z.object({
        receiptId: z.number(),
        expenseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await taxDb.linkReceiptToExpense(input.receiptId, input.expenseId);
      return { success: true };
    }),

  extractReceiptData: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(), // S3 URL or base64 data URL
      })
    )
    .mutation(async ({ input }) => {
      try {
        const receiptData = await extractReceiptData(input.imageUrl);
        return receiptData;
      } catch (error) {
        throw new Error(`Failed to extract receipt data: ${error}`);
      }
    }),

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  listNotifications: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      return taxDb.getNotificationsByUser(ctx.user.id, input.unreadOnly);
    }),

  markNotificationAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await taxDb.markNotificationAsRead(input.id);
      return { success: true };
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return taxDb.getUnreadNotificationCount(ctx.user.id);
  }),

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  listCategories: publicProcedure.query(async () => {
    return taxDb.getAllCategories();
  }),

  // ============================================================================
  // 1099 FORMS
  // ============================================================================

  create1099: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        taxYear: z.number(),
        formType: z.enum(["1099-NEC", "1099-MISC", "1099-K", "1099-INT", "1099-DIV"]),
        totalAmount: z.number(),
        box1Amount: z.number().optional(),
        box2Amount: z.number().optional(),
        box3Amount: z.number().optional(),
        box4Amount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return taxDb.create1099({
        userId: ctx.user.id,
        recipientId: input.recipientId,
        taxYear: input.taxYear,
        formType: input.formType,
        totalAmount: input.totalAmount.toString(),
        box1Amount: input.box1Amount?.toString(),
        box2Amount: input.box2Amount?.toString(),
        box3Amount: input.box3Amount?.toString(),
        box4Amount: input.box4Amount?.toString(),
        filingStatus: "draft",
      });
    }),

  list1099s: protectedProcedure
    .input(z.object({ taxYear: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return taxDb.get1099sByUser(ctx.user.id, input.taxYear);
    }),

  update1099: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        filingStatus: z.enum(["draft", "ready", "filed", "corrected"]).optional(),
        filedDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return taxDb.update1099(id, updates as any);
    }),

  // ============================================================================
  // TAX ENTITIES (Contractors, Clients)
  // ============================================================================

  createTaxEntity: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["contractor", "client", "business", "self"]),
        name: z.string(),
        tin: z.string().optional(),
        tinType: z.enum(["ssn", "ein"]).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return taxDb.createTaxEntity({
        userId: ctx.user.id,
        ...input,
      });
    }),

  listTaxEntities: protectedProcedure
    .input(z.object({ entityType: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return taxDb.getTaxEntitiesByUser(ctx.user.id, input.entityType);
    }),

  updateTaxEntity: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        tin: z.string().optional(),
        address: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return taxDb.updateTaxEntity(id, updates as any);
    }),
});
