/**
 * Module 05: Stripe Commerce Engine - tRPC Router
 * 
 * Handles product catalog, shopping cart, checkout, and order management.
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { allProducts, getProductById } from "../products";
import Stripe from "stripe";
import { getDb } from "../db";
import { commerceOrders, commerceSubscriptions, commercePendingOrders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const commerceRouter = router({
  /**
   * Get all products
   */
  products: publicProcedure.query(() => {
    return allProducts;
  }),

  /**
   * Get single product by ID
   */
  product: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const product = getProductById(input.id);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    }),

  /**
   * Create Stripe checkout session
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1).default(1),
      })),
      successUrl: z.string().optional(),
      cancelUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get product details
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let totalAmount = 0;

      for (const item of input.items) {
        const product = getProductById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        lineItems.push({
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.image ? [product.image] : undefined,
            },
            unit_amount: product.price,
            ...(product.type === "subscription" && product.interval
              ? { recurring: { interval: product.interval } }
              : {}),
          },
          quantity: item.quantity,
        });

        totalAmount += product.price * item.quantity;
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: input.items.some(item => {
          const product = getProductById(item.productId);
          return product?.type === "subscription";
        }) ? "subscription" : "payment",
        line_items: lineItems,
        success_url: input.successUrl || `${ctx.req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: input.cancelUrl || `${ctx.req.headers.origin}/checkout/cancel`,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          userId: ctx.user.id.toString(),
          customerEmail: ctx.user.email,
          customerName: ctx.user.name || "",
        },
        allow_promotion_codes: true,
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Get user's order history
   */
  orders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const orders = await db
      .select()
      .from(commerceOrders)
      .where(eq(commerceOrders.userId, ctx.user.id))
      .orderBy(commerceOrders.createdAt);

    return orders;
  }),

  /**
   * Get single order by ID
   */
  order: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [order] = await db
        .select()
        .from(commerceOrders)
        .where(eq(commerceOrders.id, input.id))
        .limit(1);

      if (!order || order.userId !== ctx.user.id) {
        throw new Error("Order not found");
      }

      return order;
    }),

  /**
   * Get user's active subscriptions
   */
  subscriptions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const subscriptions = await db
      .select()
      .from(commerceSubscriptions)
      .where(eq(commerceSubscriptions.userId, ctx.user.id))
      .orderBy(commerceSubscriptions.createdAt);

    return subscriptions;
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [subscription] = await db
        .select()
        .from(commerceSubscriptions)
        .where(eq(commerceSubscriptions.id, input.id))
        .limit(1);

      if (!subscription || subscription.userId !== ctx.user.id) {
        throw new Error("Subscription not found");
      }

      // Cancel subscription in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update local database
      await db
        .update(commerceSubscriptions)
        .set({ cancelAtPeriodEnd: true })
        .where(eq(commerceSubscriptions.id, input.id));

      return { success: true };
    }),

  /**
   * Pause checkout (save for later)
   * Module 05 feature: Public place payment protection
   */
  pauseCheckout: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
      })),
      amount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save pending order
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const resumeToken = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
      
      await db.insert(commercePendingOrders).values({
        userId: ctx.user.id,
        checkoutSessionId: input.sessionId,
        stripeSessionId: input.sessionId,
        productId: input.items[0]?.productId ? parseInt(input.items[0].productId) : 0,
        items: JSON.stringify(input.items),
        amount: input.amount.toString(),
        resumeToken,
        expiresAt,
      });

      return { success: true, expiresAt };
    }),

  /**
   * Resume paused checkout
   */
  resumeCheckout: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [pendingOrder] = await db
        .select()
        .from(commercePendingOrders)
        .where(eq(commercePendingOrders.checkoutSessionId, input.sessionId))
        .limit(1);

      if (!pendingOrder || pendingOrder.userId !== ctx.user.id) {
        throw new Error("Pending order not found");
      }

      // Check if expired
      if (new Date() > new Date(pendingOrder.expiresAt)) {
        throw new Error("Checkout session expired");
      }

      return {
        items: JSON.parse(pendingOrder.items as string),
        amount: pendingOrder.amount,
      };
    }),
});
