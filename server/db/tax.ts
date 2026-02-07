import { getDb } from "../db";
import {
  expenses,
  receipts,
  taxNotifications,
  expenseCategories,
  spendingPatterns,
  form1099s,
  taxEntities,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, asc, sql, like, or } from "drizzle-orm";

// ============================================================================
// EXPENSES
// ============================================================================

export async function createExpense(data: typeof expenses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(expenses).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getExpenseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
  return expense;
}

export async function getExpensesByUser(
  userId: number,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
  }
) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(expenses).where(eq(expenses.userId, userId));

  const conditions = [eq(expenses.userId, userId)];
  
  if (filters?.startDate) {
    conditions.push(gte(expenses.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(expenses.date, filters.endDate));
  }
  if (filters?.category) {
    conditions.push(eq(expenses.category, filters.category));
  }
  if (filters?.minAmount) {
    conditions.push(gte(expenses.amount, filters.minAmount.toString()));
  }
  if (filters?.maxAmount) {
    conditions.push(lte(expenses.amount, filters.maxAmount.toString()));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(expenses.vendor, `%${filters.search}%`),
        like(expenses.description, `%${filters.search}%`)
      )!
    );
  }

  return db.select().from(expenses).where(and(...conditions)).orderBy(desc(expenses.date));
}

export async function updateExpense(id: number, data: Partial<typeof expenses.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expenses).set(data).where(eq(expenses.id, id));
  return getExpenseById(id);
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expenses).where(eq(expenses.id, id));
}

export async function getExpenseStats(userId: number, year?: number) {
  const db = await getDb();
  if (!db) return { totalExpenses: 0, totalDeductible: 0, expenseCount: 0 };
  
  const currentYear = year || new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

  const result = await db
    .select({
      totalExpenses: sql<number>`SUM(\${expenses.amount})`,
      totalDeductible: sql<number>`SUM(\${expenses.amount} * \${expenses.deductiblePercentage} / 100)`,
      expenseCount: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    );

  return result[0] || { totalExpenses: 0, totalDeductible: 0, expenseCount: 0 };
}

export async function getExpensesByCategory(userId: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const currentYear = year || new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

  return db
    .select({
      category: expenses.category,
      totalAmount: sql<number>`SUM(\${expenses.amount})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    )
    .groupBy(expenses.category)
    .orderBy(desc(sql`SUM(\${expenses.amount})`));
}

// ============================================================================
// RECEIPTS
// ============================================================================

export async function createReceipt(data: typeof receipts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(receipts).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getReceiptById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
  return receipt;
}

export async function getReceiptsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(receipts)
    .where(eq(receipts.userId, userId))
    .orderBy(desc(receipts.uploadedAt));
}

export async function updateReceipt(id: number, data: Partial<typeof receipts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(receipts).set(data).where(eq(receipts.id, id));
  return getReceiptById(id);
}

export async function linkReceiptToExpense(receiptId: number, expenseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(receipts).set({ linkedToExpenseId: expenseId }).where(eq(receipts.id, receiptId));
  await db.update(expenses).set({ receiptId }).where(eq(expenses.id, expenseId));
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(data: typeof taxNotifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(taxNotifications).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getNotificationsByUser(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(taxNotifications.userId, userId)];
  
  if (unreadOnly) {
    conditions.push(eq(taxNotifications.isRead, false));
  }

  return db.select().from(taxNotifications).where(and(...conditions)).orderBy(desc(taxNotifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(taxNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(taxNotifications.id, id));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(taxNotifications)
    .where(and(eq(taxNotifications.userId, userId), eq(taxNotifications.isRead, false)));

  return result[0]?.count || 0;
}

// ============================================================================
// EXPENSE CATEGORIES
// ============================================================================

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.isActive, true))
    .orderBy(asc(expenseCategories.sortOrder));
}

export async function getCategoryByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [category] = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.name, name));
  return category;
}

// ============================================================================
// SPENDING PATTERNS
// ============================================================================

export async function getSpendingPattern(userId: number, category: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [pattern] = await db
    .select()
    .from(spendingPatterns)
    .where(and(eq(spendingPatterns.userId, userId), eq(spendingPatterns.category, category)));
  return pattern;
}

export async function updateSpendingPattern(
  userId: number,
  category: string,
  data: Partial<typeof spendingPatterns.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSpendingPattern(userId, category);

  if (existing) {
    await db
      .update(spendingPatterns)
      .set({ ...data, lastCalculated: new Date() })
      .where(and(eq(spendingPatterns.userId, userId), eq(spendingPatterns.category, category)));
  } else {
    await db.insert(spendingPatterns).values({
      userId,
      category,
      ...data,
      lastCalculated: new Date(),
    } as any);
  }
}

// ============================================================================
// 1099 FORMS
// ============================================================================

export async function create1099(data: typeof form1099s.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(form1099s).values(data);
  return { id: Number(result[0].insertId) };
}

export async function get1099sByUser(userId: number, taxYear?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(form1099s.userId, userId)];

  if (taxYear) {
    conditions.push(eq(form1099s.taxYear, taxYear));
  }

  return db.select().from(form1099s).where(and(...conditions)).orderBy(desc(form1099s.taxYear), desc(form1099s.createdAt));
}

export async function update1099(id: number, data: Partial<typeof form1099s.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(form1099s).set(data).where(eq(form1099s.id, id));
  const [form] = await db.select().from(form1099s).where(eq(form1099s.id, id));
  return form;
}

// ============================================================================
// TAX ENTITIES
// ============================================================================

export async function createTaxEntity(data: typeof taxEntities.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(taxEntities).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getTaxEntitiesByUser(userId: number, entityType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(taxEntities.userId, userId)];

  if (entityType) {
    conditions.push(eq(taxEntities.entityType, entityType as any));
  }

  return db.select().from(taxEntities).where(and(...conditions)).orderBy(asc(taxEntities.name));
}

export async function getTaxEntityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [entity] = await db.select().from(taxEntities).where(eq(taxEntities.id, id));
  return entity;
}

export async function updateTaxEntity(id: number, data: Partial<typeof taxEntities.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(taxEntities).set(data).where(eq(taxEntities.id, id));
  return getTaxEntityById(id);
}
