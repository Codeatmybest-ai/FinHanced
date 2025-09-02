import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardWidget } from "@/components/DashboardWidget";
import { ExpenseItem } from "@/components/ExpenseItem";
import { AIAssistant } from "@/components/AIAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Target,
  Brain,
  Eye,
  EyeOff
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Expense } from "@shared/schema";

export default function Dashboard() {
  const { t } = useLanguage();
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useState({
    balance: true,
    expenses: true,
    income: true,
    savings: true,
  });

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const { data: categoryBreakdown } = useQuery({
    queryKey: ["/api/dashboard/category-breakdown"],
  });

  const { data: goals } = useQuery({
    queryKey: ["/api/goals"],
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/spending-insights"],
  });

  const recentExpenses = expenses?.slice(0, 5) || [];
  const activeGoals = goals?.slice(0, 3) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const toggleWidgetVisibility = (widget: keyof typeof widgetVisibility) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  if (statsLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Widget Visibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(widgetVisibility).map(([key, visible]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => toggleWidgetVisibility(key as keyof typeof widgetVisibility)}
                className="flex items-center space-x-2"
                data-testid={`button-toggle-${key}-widget`}
              >
                {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="capitalize">{key}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgetVisibility.balance && (
          <DashboardWidget
            title={t("dashboard.totalBalance")}
            value={formatCurrency(stats?.totalBalance || 0)}
            icon={DollarSign}
            trend="positive"
            change={{
              value: 12.5,
              label: "vs last month"
            }}
          />
        )}

        {widgetVisibility.expenses && (
          <DashboardWidget
            title={t("dashboard.thisMonthExpenses")}
            value={formatCurrency(stats?.thisMonthExpenses || 0)}
            icon={TrendingDown}
            trend="negative"
            change={{
              value: stats?.expenseChange || 0,
              label: "vs last month"
            }}
          />
        )}

        {widgetVisibility.income && (
          <DashboardWidget
            title={t("dashboard.thisMonthIncome")}
            value={formatCurrency(stats?.thisMonthIncome || 0)}
            icon={TrendingUp}
            trend="positive"
            change={{
              value: stats?.incomeChange || 0,
              label: "vs last month"
            }}
          />
        )}

        {widgetVisibility.savings && (
          <DashboardWidget
            title={t("dashboard.savingsGoal")}
            value={`${Math.round(stats?.savingsRate || 0)}%`}
            icon={Target}
            trend="positive"
            change={{
              value: 5.1,
              label: t("dashboard.onTrack")
            }}
          />
        )}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends Chart */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{t("dashboard.spendingTrends")}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Month</Button>
              <Button variant="ghost" size="sm">Year</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart visualization would be rendered here
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.categoryBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown?.map((category: any, index: number) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-foreground capitalize">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(category.percentage)}%
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-8">
                  No expense data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Goals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{t("dashboard.recentTransactions")}</CardTitle>
              <Link href="/expenses">
                <Button variant="ghost" size="sm" data-testid="button-view-all-expenses">
                  {t("dashboard.viewAll")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentExpenses.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentExpenses.map((expense: Expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onDuplicate={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent transactions
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.activeGoals")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGoals.length > 0 ? (
                activeGoals.map((goal: any) => {
                  const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                  return (
                    <div key={goal.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(Number(goal.currentAmount))} of {formatCurrency(Number(goal.targetAmount))}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No active goals
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && (
        <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("dashboard.aiInsights")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Based on your spending patterns, here are some personalized recommendations:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.suggestions?.slice(0, 2).map((suggestion: string, index: number) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm text-foreground">{suggestion}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setAiAssistantOpen(true)}
                  data-testid="button-open-ai-assistant"
                >
                  Ask AI Advisor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={aiAssistantOpen} 
        onClose={() => setAiAssistantOpen(false)} 
      />
    </div>
  );
}
