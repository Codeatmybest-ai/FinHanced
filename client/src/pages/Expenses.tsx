import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ExpenseItem } from "@/components/ExpenseItem";
import { ExpenseModal } from "@/components/ExpenseModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Plus } from "lucide-react";
import type { Expense } from "@shared/schema";

export default function Expenses() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("thisMonth");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Fetch expenses with filters
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["/api/expenses", { category: categoryFilter, period: periodFilter, search: searchTerm }],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: t("common.success"),
        description: "Expense deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const handleDuplicateExpense = (expense: Expense) => {
    const duplicatedExpense = {
      ...expense,
      id: undefined,
      description: `${expense.description} (copy)`,
      date: new Date(),
    };
    setEditingExpense(duplicatedExpense as any);
    setExpenseModalOpen(true);
  };

  const handleExportData = () => {
    window.open('/api/user/export', '_blank');
  };

  const filteredExpenses = expenses?.filter((expense: Expense) => {
    const matchesSearch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [
    { value: "food", label: t("categories.food") },
    { value: "transport", label: t("categories.transport") },
    { value: "entertainment", label: t("categories.entertainment") },
    { value: "shopping", label: t("categories.shopping") },
    { value: "utilities", label: t("categories.utilities") },
    { value: "healthcare", label: t("categories.healthcare") },
    { value: "education", label: t("categories.education") },
    { value: "other", label: t("categories.other") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-expenses-title">
            {t("expenses.title")}
          </h1>
          <p className="text-muted-foreground" data-testid="text-expenses-subtitle">
            {t("expenses.subtitle")}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center space-x-2"
            data-testid="button-add-expense"
          >
            <Plus className="w-4 h-4" />
            <span>{t("expenses.addExpense")}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-expenses"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Period Filter */}
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-48" data-testid="select-period-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Export Button */}
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="flex items-center space-x-2"
              data-testid="button-export-expenses"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t("expenses.transactionHistory")}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">{t("common.loading")}</div>
            </div>
          ) : filteredExpenses.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredExpenses.map((expense: Expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                  onDuplicate={handleDuplicateExpense}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter 
                  ? "No expenses match your filters" 
                  : "No expenses recorded yet"
                }
              </div>
              <Button
                onClick={() => setExpenseModalOpen(true)}
                data-testid="button-add-first-expense"
              >
                Add Your First Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
      />
    </div>
  );
}
