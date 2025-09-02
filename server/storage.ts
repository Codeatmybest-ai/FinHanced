import {
  users,
  expenses,
  budgets,
  goals,
  categories,
  notifications,
  type User,
  type UpsertUser,
  type Expense,
  type InsertExpense,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
  type Category,
  type InsertCategory,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, like, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPreferences(id: string, preferences: Partial<User>): Promise<User>;
  
  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(userId: string, filters?: ExpenseFilters): Promise<Expense[]>;
  getExpenseById(id: string, userId: string): Promise<Expense | undefined>;
  updateExpense(id: string, userId: string, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string, userId: string): Promise<void>;
  getExpensesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]>;
  
  // Budget operations
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgets(userId: string): Promise<Budget[]>;
  updateBudget(id: string, userId: string, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: string, userId: string): Promise<void>;
  
  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoals(userId: string): Promise<Goal[]>;
  updateGoal(id: string, userId: string, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: string, userId: string): Promise<void>;
  
  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(userId: string): Promise<Category[]>;
  updateCategory(id: string, userId: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string, userId: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string, userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<void>;
  
  // Analytics operations
  getDashboardStats(userId: string): Promise<DashboardStats>;
  getCategoryBreakdown(userId: string, startDate: Date, endDate: Date): Promise<CategoryBreakdown[]>;
  getSpendingTrends(userId: string, months: number): Promise<SpendingTrend[]>;
  
  // Data management operations
  deleteAllUserData(userId: string): Promise<void>;
  exportUserData(userId: string): Promise<UserDataExport>;
}

export interface ExpenseFilters {
  category?: string;
  type?: 'expense' | 'income';
  startDate?: Date;
  endDate?: Date;
  search?: string;
  tags?: string[];
  location?: string;
}

export interface DashboardStats {
  totalBalance: number;
  thisMonthExpenses: number;
  thisMonthIncome: number;
  savingsRate: number;
  expenseChange: number;
  incomeChange: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface SpendingTrend {
  month: string;
  amount: number;
  income: number;
  expenses: number;
}

export interface UserDataExport {
  user: User;
  expenses: Expense[];
  budgets: Budget[];
  goals: Goal[];
  categories: Category[];
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPreferences(id: string, preferences: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...preferences, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Expense operations
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getExpenses(userId: string, filters?: ExpenseFilters): Promise<Expense[]> {
    let query = db.select().from(expenses).where(eq(expenses.userId, userId));
    
    if (filters) {
      const conditions = [eq(expenses.userId, userId)];
      
      if (filters.category) {
        conditions.push(eq(expenses.category, filters.category));
      }
      if (filters.type) {
        conditions.push(eq(expenses.type, filters.type));
      }
      if (filters.startDate) {
        conditions.push(gte(expenses.date, filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(lte(expenses.date, filters.endDate));
      }
      if (filters.search) {
        conditions.push(
          or(
            like(expenses.description, `%${filters.search}%`),
            like(expenses.location, `%${filters.search}%`)
          )
        );
      }
      
      query = db.select().from(expenses).where(and(...conditions));
    }
    
    return await query.orderBy(desc(expenses.date));
  }

  async getExpenseById(id: string, userId: string): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return expense;
  }

  async updateExpense(id: string, userId: string, expense: Partial<InsertExpense>): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }

  async getExpensesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .orderBy(desc(expenses.date));
  }

  // Budget operations
  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.createdAt));
  }

  async updateBudget(id: string, userId: string, budget: Partial<InsertBudget>): Promise<Budget> {
    const [updatedBudget] = await db
      .update(budgets)
      .set({ ...budget, updatedAt: new Date() })
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();
    return updatedBudget;
  }

  async deleteBudget(id: string, userId: string): Promise<void> {
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }

  // Goal operations
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async updateGoal(id: string, userId: string, goal: Partial<InsertGoal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set({ ...goal, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
  }

  // Category operations
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  }

  async updateCategory(id: string, userId: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // Analytics operations
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month data
    const currentMonthExpenses = await db
      .select({ total: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startOfMonth)
        )
      );

    const currentMonthIncome = await db
      .select({ total: sql<number>`COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startOfMonth)
        )
      );

    // Get last month data for comparison
    const lastMonthExpenses = await db
      .select({ total: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startOfLastMonth),
          lte(expenses.date, endOfLastMonth)
        )
      );

    const lastMonthIncome = await db
      .select({ total: sql<number>`COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startOfLastMonth),
          lte(expenses.date, endOfLastMonth)
        )
      );

    const thisMonthExpenses = Number(currentMonthExpenses[0]?.total || 0);
    const thisMonthIncome = Number(currentMonthIncome[0]?.total || 0);
    const lastMonthExpensesNum = Number(lastMonthExpenses[0]?.total || 0);
    const lastMonthIncomeNum = Number(lastMonthIncome[0]?.total || 0);

    const totalBalance = thisMonthIncome - thisMonthExpenses;
    const expenseChange = lastMonthExpensesNum > 0 ? ((thisMonthExpenses - lastMonthExpensesNum) / lastMonthExpensesNum) * 100 : 0;
    const incomeChange = lastMonthIncomeNum > 0 ? ((thisMonthIncome - lastMonthIncomeNum) / lastMonthIncomeNum) * 100 : 0;
    const savingsRate = thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100 : 0;

    return {
      totalBalance,
      thisMonthExpenses,
      thisMonthIncome,
      savingsRate,
      expenseChange,
      incomeChange,
    };
  }

  async getCategoryBreakdown(userId: string, startDate: Date, endDate: Date): Promise<CategoryBreakdown[]> {
    const breakdown = await db
      .select({
        category: expenses.category,
        amount: sql<number>`SUM(amount)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          eq(expenses.type, 'expense'),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .groupBy(expenses.category);

    const total = breakdown.reduce((sum, item) => sum + Number(item.amount), 0);
    
    const colors = ['hsl(221 83% 53%)', 'hsl(142 71% 45%)', 'hsl(0 84% 60%)', 'hsl(47 96% 53%)', 'hsl(271 81% 56%)'];
    
    return breakdown.map((item, index) => ({
      category: item.category,
      amount: Number(item.amount),
      percentage: total > 0 ? (Number(item.amount) / total) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }

  async getSpendingTrends(userId: string, months: number): Promise<SpendingTrend[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await db
      .select({
        month: sql<string>`TO_CHAR(date, 'Mon')`,
        totalAmount: sql<number>`SUM(amount)`,
        expenseAmount: sql<number>`SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)`,
        incomeAmount: sql<number>`SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate)
        )
      )
      .groupBy(sql`TO_CHAR(date, 'Mon'), EXTRACT(MONTH FROM date)`)
      .orderBy(sql`EXTRACT(MONTH FROM date)`);

    return trends.map(trend => ({
      month: trend.month,
      amount: Number(trend.totalAmount),
      income: Number(trend.incomeAmount),
      expenses: Number(trend.expenseAmount),
    }));
  }

  async deleteAllUserData(userId: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.userId, userId));
    await db.delete(categories).where(eq(categories.userId, userId));
    await db.delete(goals).where(eq(goals.userId, userId));
    await db.delete(budgets).where(eq(budgets.userId, userId));
    await db.delete(expenses).where(eq(expenses.userId, userId));
  }

  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await this.getUser(userId);
    const userExpenses = await this.getExpenses(userId);
    const userBudgets = await this.getBudgets(userId);
    const userGoals = await this.getGoals(userId);
    const userCategories = await this.getCategories(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      user,
      expenses: userExpenses,
      budgets: userBudgets,
      goals: userGoals,
      categories: userCategories,
    };
  }
}

export const storage = new DatabaseStorage();
