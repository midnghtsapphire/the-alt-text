import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Coins, TrendingUp, Gift, DollarSign, Award, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RewardsDashboard() {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');

  // Fetch user profile with credits balance
  const { data: user, isLoading: profileLoading } = trpc.auth.me.useQuery();
  const profile = user;

  // Fetch credits transactions
  const { data: transactions, isLoading: transactionsLoading } = trpc.rewards.getTransactionsHistory.useQuery({ limit: 50, offset: 0 });

  // Fetch available reward actions
  const { data: rewardActions, isLoading: actionsLoading } = trpc.rewards.getRewardActions.useQuery();

  const creditsBalance = parseFloat(profile?.creditsBalance || "0");
  const lifetimeEarned = parseFloat(profile?.lifetimeCreditsEarned || "0");
  const lifetimeSpent = parseFloat(profile?.lifetimeCreditsSpent || "0");

  // Redeem promo code mutation
  const redeemPromo = trpc.rewards.redeemPromoCode.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Promo Code Redeemed!",
        description: `You earned ${data.creditsAwarded} credits!`,
      });
      setPromoCode("");
    },
    onError: (error) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Request cashout mutation
  const requestCashout = trpc.rewards.requestCashout.useMutation({
    onSuccess: () => {
      toast({
        title: "Cashout Requested",
        description: "Your cashout request has been submitted. We'll process it within 3-5 business days.",
      });
    },
    onError: (error) => {
      toast({
        title: "Cashout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  const handleRedeemPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }
    redeemPromo.mutate({ code: promoCode });
  };

  const handleCashout = () => {
    if (creditsBalance < 50) {
      toast({
        title: "Insufficient Balance",
        description: "You need at least 50 credits to request a cashout",
        variant: "destructive",
      });
      return;
    }
    // For now, just show a message that cashout is coming soon
    toast({
      title: "Coming Soon",
      description: "Cashout functionality will be available soon. We're setting up payment processing.",
    });
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Rewards Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Earn credits for testing, contributions, and referrals - use them to offset API costs or cash out
        </p>
      </div>

      {/* Inline Documentation (ADHD-friendly) */}
      <Card className="p-6 mb-8 bg-accent/50">
        <h2 className="text-xl font-semibold mb-3">How Credits Work</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Earn:</strong> Get credits for testing new features, reporting bugs, referring friends</p>
          <p><strong>Spend:</strong> Credits automatically offset your API usage costs</p>
          <p><strong>Cash Out:</strong> Request payout when balance reaches $50 (500 credits = $5)</p>
          <p><strong>Promo Codes:</strong> Redeem codes below for instant credit bonuses</p>
        </div>
      </Card>

      {/* Credits Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
          </div>
          <p className="text-3xl font-bold">{creditsBalance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">credits</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Lifetime Earned</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">{lifetimeEarned.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">credits</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <DollarSign className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Lifetime Spent</h3>
          </div>
          <p className="text-3xl font-bold text-red-500">{lifetimeSpent.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">credits</p>
        </Card>
      </div>

      {/* Promo Code Redemption */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Redeem Promo Code</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleRedeemPromo}>
            <Gift className="mr-2 h-4 w-4" />
            Redeem
          </Button>
        </div>
      </Card>

      {/* Available Reward Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Earn More Credits</h2>
        {actionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        ) : rewardActions && rewardActions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewardActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">{action.name}</p>
                  <p className="text-sm text-muted-foreground">+{parseFloat(action.creditsAmount).toFixed(0)} credits</p>
                </div>
                <Button size="sm">Start</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reward actions available</p>
        )}
      </Card>

      {/* Transaction History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {transactionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className={`text-lg font-semibold ${parseFloat(tx.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(tx.amount) >= 0 ? '+' : ''}{parseFloat(tx.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        )}
      </Card>

      {/* Cash Out Section */}
      <Card className="p-6 mt-8 bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Ready to Cash Out?</h3>
            <p className="text-sm text-muted-foreground">
              Minimum balance: 50 credits ($5) - You have {creditsBalance.toFixed(2)} credits (${(creditsBalance * 0.1).toFixed(2)})
            </p>
          </div>
          <Button 
            size="lg" 
            disabled={creditsBalance < 50 || requestCashout.isPending}
            onClick={handleCashout}
          >
            <DollarSign className="mr-2 h-5 w-5" />
            {requestCashout.isPending ? "Processing..." : "Request Payout"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
