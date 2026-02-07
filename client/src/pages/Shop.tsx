/**
 * Module 05: Stripe Commerce Engine - Product Catalog
 * 
 * Browse and purchase training programs, certifications, tools, and subscriptions.
 */

import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CheckCircle2, ShoppingCart, Sparkles } from "lucide-react";

export default function Shop() {
  const { data: products, isLoading } = trpc.commerce.products.useQuery();
  const createCheckoutMutation = trpc.commerce.createCheckoutSession.useMutation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handlePurchase = async (productId: string) => {
    try {
      const result = await createCheckoutMutation.mutateAsync({
        items: [{ productId, quantity: 1 }],
      });

      if (result.url) {
        // Open Stripe checkout in new tab
        window.open(result.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to create checkout session. Please try again.");
    }
  };

  const formatPrice = (price: number, currency: string, interval?: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);

    if (interval) {
      return `${formatted}/${interval}`;
    }
    return formatted;
  };

  const filteredProducts = products?.filter(p => 
    selectedCategory === "all" || p.category === selectedCategory
  );

  const categories = [
    { value: "all", label: "All Products" },
    { value: "training", label: "Training Programs" },
    { value: "certification", label: "Certifications" },
    { value: "subscription", label: "Subscriptions" },
    { value: "tool", label: "Tools & Resources" },
  ];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop</h1>
        <p className="text-muted-foreground">
          Invest in your career with training programs, certifications, and tools
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList>
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Product Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts?.map(product => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant={product.type === "subscription" ? "default" : "secondary"}>
                  {product.type === "subscription" ? "Subscription" : "One-time"}
                </Badge>
                {product.popular && (
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </Badge>
                )}
              </div>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              {/* Features */}
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              {/* Price */}
              <div className="w-full text-center">
                <div className="text-3xl font-bold">
                  {product.price === 0 ? (
                    "Free"
                  ) : (
                    formatPrice(product.price, product.currency, product.interval)
                  )}
                </div>
                {product.type === "subscription" && product.interval === "year" && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Save 20% vs monthly
                  </div>
                )}
              </div>

              {/* Purchase Button */}
              <Button
                className="w-full"
                onClick={() => handlePurchase(product.id)}
                disabled={createCheckoutMutation.isPending}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.price === 0 ? "Apply Now" : "Purchase"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found in this category.</p>
        </div>
      )}

      {/* Test Mode Banner */}
      <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="font-semibold mb-2">🧪 Test Mode</h3>
        <p className="text-sm text-muted-foreground">
          Payments are in test mode. Use card number <code className="bg-white dark:bg-black px-2 py-1 rounded">4242 4242 4242 4242</code> with any future expiry date and any CVC to test checkout.
        </p>
      </div>
    </div>
  );
}
