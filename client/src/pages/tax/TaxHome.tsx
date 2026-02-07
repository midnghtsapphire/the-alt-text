import { TaxModuleNav } from "@/components/TaxModuleNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Plus,
  Upload,
  FileText,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

export default function TaxHome() {
  return (
    <div className="flex h-screen bg-background">
      <TaxModuleNav />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tax Dashboard</h1>
            <p className="text-muted-foreground">
              Track expenses, manage deductions, and stay compliant with automated tax management.
            </p>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+20.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* Total Deductions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$32,450.00</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+15.3%</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* Estimated Tax Owed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Tax Owed</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,780.89</div>
                <p className="text-xs text-muted-foreground">
                  Q1 2026 estimate
                </p>
              </CardContent>
            </Card>

            {/* Potential Refund */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Potential Refund</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,240.00</div>
                <p className="text-xs text-muted-foreground">
                  Based on current deductions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to manage your tax workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-auto flex-col items-start p-4 text-left">
                  <Plus className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Add Expense</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Manually log a new business expense
                  </div>
                </Button>

                <Button variant="outline" className="h-auto flex-col items-start p-4 text-left">
                  <Upload className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Upload Receipt</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Scan and categorize with AI
                  </div>
                </Button>

                <Button variant="outline" className="h-auto flex-col items-start p-4 text-left">
                  <FileText className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Generate 1099</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Create tax forms for contractors
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest expenses and deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { vendor: "Amazon Web Services", amount: "$1,234.56", category: "Software", date: "Jan 25, 2026" },
                    { vendor: "Office Depot", amount: "$456.78", category: "Supplies", date: "Jan 24, 2026" },
                    { vendor: "Starbucks", amount: "$12.50", category: "Meals", date: "Jan 24, 2026" },
                    { vendor: "Shell Gas Station", amount: "$65.00", category: "Mileage", date: "Jan 23, 2026" },
                    { vendor: "Adobe Creative Cloud", amount: "$54.99", category: "Software", date: "Jan 22, 2026" },
                  ].map((transaction, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{transaction.vendor}</div>
                        <div className="text-xs text-muted-foreground">{transaction.category} • {transaction.date}</div>
                      </div>
                      <div className="font-semibold text-sm">{transaction.amount}</div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Transactions
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tax Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tax Deadlines</CardTitle>
                <CardDescription>Important dates to remember</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Q1 2026 Estimated Tax Payment", date: "April 15, 2026", days: 78, status: "upcoming" },
                    { title: "1099 Forms Filing Deadline", date: "March 31, 2026", days: 63, status: "upcoming" },
                    { title: "State Tax Return", date: "April 15, 2026", days: 78, status: "upcoming" },
                    { title: "Federal Tax Return", date: "April 15, 2026", days: 78, status: "upcoming" },
                  ].map((deadline, i) => (
                    <div key={i} className="flex items-start gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="mt-1">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{deadline.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{deadline.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-orange-600">{deadline.days} days</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Deadlines
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Educational Content - Inline Wizard */}
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Tax Tip: Maximize Your Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Did you know? The average self-employed person misses $3,000-$5,000 in deductions annually. 
                Our AI-powered categorization helps you capture every eligible expense.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <strong>Home Office:</strong> Deduct $5 per square foot (up to 300 sq ft)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <strong>Mileage:</strong> Track business miles at $0.67/mile (2026 rate)
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <strong>Equipment:</strong> Section 179 allows up to $1.22M in immediate deductions
                  </div>
                </div>
              </div>
              <Button variant="link" className="mt-4 p-0 h-auto">
                Learn more about tax deductions →
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
