/**
 * Module 05: Stripe Commerce Engine - Checkout Success Page
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  
  // Get session_id from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // TODO: Verify payment with backend using sessionId
    console.log("Checkout session ID:", sessionId);
  }, [sessionId]);

  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your order has been confirmed.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• Access your purchase in your account dashboard</li>
                <li>• For training programs, you'll be contacted within 24 hours</li>
                <li>• For certifications, check your email for exam voucher codes</li>
              </ul>
            </div>

            {sessionId && (
              <div className="text-xs text-muted-foreground">
                Order reference: {sessionId.slice(0, 20)}...
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button onClick={() => setLocation("/orders")} variant="outline" className="flex-1">
              View Orders
            </Button>
            <Button onClick={() => setLocation("/shop")} className="flex-1">
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
