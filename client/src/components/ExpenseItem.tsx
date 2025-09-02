import { Expense } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Trash2, MapPin, Star, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onDuplicate: (expense: Expense) => void;
  onClick?: (expense: Expense) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete, onDuplicate, onClick }: ExpenseItemProps) {
  const { t } = useLanguage();

  const formatAmount = (amount: string | number, type: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const sign = type === 'expense' ? '-' : '+';
    return `${sign}$${numAmount.toFixed(2)}`;
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: "🍽️",
      transport: "🚗",
      entertainment: "🎬",
      shopping: "🛒",
      utilities: "⚡",
      healthcare: "🏥",
      education: "📚",
      other: "📝"
    };
    return icons[category] || "📝";
  };

  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      satisfied: "😊",
      neutral: "😐", 
      regret: "😔",
      excited: "🎉"
    };
    return moods[mood] || "😐";
  };

  const handleReceiptView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expense.receiptUrl) {
      window.open(expense.receiptUrl, '_blank');
    }
  };

  const isReceiptPDF = expense.receiptUrl?.toLowerCase().includes('.pdf');

  return (
    <div 
      className="expense-item flex items-center justify-between p-6 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-b-0"
      onClick={() => onClick?.(expense)}
      data-testid={`expense-item-${expense.id}`}
    >
      <div className="flex items-center space-x-4">
        {/* Receipt/Icon */}
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden relative group">
          {expense.receiptUrl ? (
            <>
              {isReceiptPDF ? (
                <div className="w-full h-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
              ) : (
                <img 
                  src={expense.receiptUrl} 
                  alt="Receipt" 
                  className="w-full h-full object-cover"
                  data-testid={`img-receipt-${expense.id}`}
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-foreground" data-testid={`text-expense-description-${expense.id}`}>
            {expense.description}
          </h4>
          <p className="text-sm text-muted-foreground">
            <span data-testid={`text-expense-category-${expense.id}`}>
              {t(`categories.${expense.category}`)}
            </span> • 
            <span data-testid={`text-expense-date-${expense.id}`}>
              {formatDate(expense.date)}
            </span>
          </p>

          <div className="flex items-center space-x-4 mt-2">
            {expense.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground" data-testid={`text-expense-location-${expense.id}`}>
                  {expense.location}
                </span>
              </div>
            )}

            {expense.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-muted-foreground" data-testid={`text-expense-rating-${expense.id}`}>
                  {expense.rating}/5
                </span>
              </div>
            )}

            {expense.mood && (
              <div className="flex items-center space-x-1">
                <span className="text-sm" data-testid={`text-expense-mood-${expense.id}`}>
                  {getMoodEmoji(expense.mood)}
                </span>
              </div>
            )}

            {expense.receiptUrl && (
              <div className="flex items-center space-x-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {isReceiptPDF ? 'PDF Receipt' : 'Receipt'}
                </span>
              </div>
            )}

            {expense.tags && expense.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground">
                  #{expense.tags.slice(0, 2).join(' #')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p 
          className={cn(
            "font-bold text-lg",
            expense.type === "expense" ? "text-destructive" : "text-success"
          )}
          data-testid={`text-expense-amount-${expense.id}`}
        >
          {formatAmount(expense.amount, expense.type)}
        </p>

        <div className="flex items-center space-x-2 mt-2">
          {expense.receiptUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReceiptView}
              data-testid={`button-view-receipt-${expense.id}`}
              title="View receipt"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(expense);
            }}
            data-testid={`button-edit-expense-${expense.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(expense);
            }}
            data-testid={`button-duplicate-expense-${expense.id}`}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(expense.id);
            }}
            data-testid={`button-delete-expense-${expense.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}