/**
 * Module 05: Stripe Commerce Engine - Order History
 */

import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Package, Calendar, DollarSign } from "lucide-react";

export default function Orders() {
  const { data: orders, isLoading } = trpc.commerce.orders.useQuery();

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          View your purchase history and order details
        </p>
      </div>

      {/* Orders List */}
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => {
            const items = JSON.parse(order.items as string);
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order #{order.id}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatPrice(parseFloat(order.amount), order.currency)}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Items:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {items.map((item: any, idx: number) => (
                        <li key={idx}>
                          {item.name} {item.quantity > 1 && `(×${item.quantity})`}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.stripePaymentIntentId && (
                    <div className="mt-4 text-xs text-muted-foreground">
                      Payment ID: {order.stripePaymentIntentId}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              Start shopping to see your orders here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
