import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, Filter, Download, Receipt, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReceiptUpload from "@/components/ReceiptUpload";

export default function TaxExpenses() {

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    category: "",
    search: "",
  });

  // Queries
  const { data: expenses = [], refetch } = trpc.tax.listExpenses.useQuery(filters);
  const { data: stats } = trpc.tax.getExpenseStats.useQuery({ year: new Date().getFullYear() });
  const { data: categoryBreakdown = [] } = trpc.tax.getExpensesByCategory.useQuery({ year: new Date().getFullYear() });

  // Add expense form state
  const [newExpense, setNewExpense] = useState({
    date: new Date(),
    amount: "",
    vendor: "",
    description: "",
    category: "",
    paymentMethod: "",
  });

  // Mutations
  const createExpense = trpc.tax.createExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense added", {
        description: "Your expense has been recorded successfully",
      });
      refetch();
      setIsAddDialogOpen(false);
      setNewExpense({
        date: new Date(),
        amount: "",
        vendor: "",
        description: "",
        category: "",
        paymentMethod: "",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error("Missing information", {
        description: "Please fill in amount and description",
      });
      return;
    }

    createExpense.mutate({
      date: newExpense.date,
      amount: parseFloat(newExpense.amount),
      vendor: newExpense.vendor || undefined,
      description: newExpense.description,
      category: newExpense.category || undefined,
      paymentMethod: newExpense.paymentMethod || undefined,
      isRecurring: false,
      taxDeductible: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
            <p className="text-slate-600 mt-1">Track and categorize your business expenses</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Upload a receipt or enter expense details manually. AI will suggest the best tax category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label>Upload Receipt (Optional)</Label>
                  <ReceiptUpload
                    onDataExtracted={(data) => {
                      setNewExpense({
                        ...newExpense,
                        date: data.date ? new Date(data.date) : new Date(),
                        amount: data.amount.toString(),
                        vendor: data.vendor,
                        description: data.items.map(i => i.description).join(", ") || "Receipt expense",
                        category: data.category,
                      });
                    }}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newExpense.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newExpense.date ? format(newExpense.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newExpense.date}
                          onSelect={(date) => setNewExpense({ ...newExpense, date: date || new Date() })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Vendor/Merchant</Label>
                  <Input
                    placeholder="e.g., Amazon, Starbucks, Office Depot"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What was this expense for?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="AI will suggest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Advertising">Advertising</SelectItem>
                        <SelectItem value="Office Expense">Office Expense</SelectItem>
                        <SelectItem value="Supplies">Supplies</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Legal and Professional Services">Legal & Professional</SelectItem>
                        <SelectItem value="Other Expenses">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense} disabled={createExpense.isPending}>
                  {createExpense.isPending ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalExpenses?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-slate-500 mt-1">{stats?.expenseCount || 0} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tax Deductible</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats?.totalDeductible?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-slate-500 mt-1">Potential tax savings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Top Category</CardTitle>
              <Receipt className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryBreakdown[0]?.category || "None"}</div>
              <p className="text-xs text-slate-500 mt-1">${categoryBreakdown[0]?.totalAmount?.toFixed(2) || "0.00"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Vendor or description"
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "PP") : "Any"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => setFilters({ ...filters, startDate: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "PP") : "Any"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => setFilters({ ...filters, endDate: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="Advertising">Advertising</SelectItem>
                    <SelectItem value="Office Expense">Office Expense</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Meals">Meals</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>{expenses.length} expenses found</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No expenses found</p>
                  <p className="text-sm">Add your first expense to get started</p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.vendor || "Unknown vendor"}</p>
                          <p className="text-sm text-slate-600">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {expense.category}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(expense.date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${Number(expense.amount).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{expense.paymentMethod || "Unknown"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
