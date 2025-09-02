import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Camera, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
}

const formSchema = insertExpenseSchema.extend({
  amount: insertExpenseSchema.shape.amount.transform(val => val.toString()),
  date: insertExpenseSchema.shape.date.transform(val => val.toISOString().split('T')[0]),
});

export function ExpenseModal({ isOpen, onClose, expense }: ExpenseModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expense?.amount || "",
      type: expense?.type || "expense",
      description: expense?.description || "",
      category: expense?.category || "",
      date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      location: expense?.location || "",
      mood: expense?.mood || "",
      tags: expense?.tags?.join(", ") || "",
      rating: expense?.rating || 0,
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()) : [],
        rating,
        receiptUrl: uploadedFile,
      };
      
      return await apiRequest("POST", "/api/expenses", expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: t("common.success"),
        description: "Expense saved successfully",
      });
      form.reset();
      setRating(0);
      setUploadedFile(null);
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFile(data.url);
      toast({
        title: t("common.success"),
        description: `Receipt uploaded: ${data.originalName}`,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

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

  const moods = [
    { value: "satisfied", label: "😊 Satisfied" },
    { value: "neutral", label: "😐 Neutral" },
    { value: "regret", label: "😔 Buyer's Remorse" },
    { value: "excited", label: "🎉 Excited" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            {t("expenses.addNew")}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expenses.amount")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="pl-8"
                          data-testid="input-expense-amount"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expenses.type")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expense-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expenses.description")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What was this for?" 
                        data-testid="input-expense-description"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expenses.category")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expense-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expenses.date")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        data-testid="input-expense-date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expenses.location")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Where was this?" 
                          data-testid="input-expense-location"
                          {...field} 
                        />
                        <button 
                          type="button" 
                          className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                          data-testid="button-get-location"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mood and Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("expenses.satisfaction")}
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="w-8 h-8 rounded-full border border-border hover:bg-muted transition-colors flex items-center justify-center"
                      data-testid={`button-rating-${star}`}
                    >
                      <Star 
                        className={cn(
                          "w-4 h-4",
                          star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expenses.mood")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expense-mood">
                          <SelectValue placeholder="How do you feel?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {moods.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value}>
                            {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("expenses.receipt")}
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  data-testid="input-file-upload"
                  disabled={uploadMutation.isPending}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploadMutation.isPending ? (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-muted-foreground">Uploading...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center">
                      {uploadedFile.toLowerCase().includes('.pdf') ? (
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-2">
                          <span className="text-red-600 font-bold text-xs">PDF</span>
                        </div>
                      ) : (
                        <img 
                          src={uploadedFile} 
                          alt="Receipt preview" 
                          className="w-16 h-16 object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="text-sm text-success">Receipt uploaded successfully!</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">{t("expenses.uploadReceipt")}</p>
                      <p className="text-xs text-muted-foreground mt-1">Images and PDFs up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("expenses.tags")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Add tags (e.g., business, urgent, recurring)" 
                      data-testid="input-expense-tags"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createExpenseMutation.isPending}
                data-testid="button-save-expense"
              >
                {createExpenseMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  onSubmit(form.getValues());
                  form.reset();
                  setRating(0);
                }}
                data-testid="button-save-and-add-another"
              >
                {t("expenses.saveAndAddAnother")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
