import React, { createContext, useState, useEffect, useContext } from "react";

interface LanguageContextType {
  language: "en" | "it";
  setLanguage: (language: "en" | "it") => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.expenses": "Expenses",
    "nav.budgets": "Budgets",
    "nav.analytics": "Analytics",
    "nav.goals": "Goals",
    "nav.settings": "Settings",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.totalBalance": "Total Balance",
    "dashboard.thisMonthExpenses": "This Month Expenses",
    "dashboard.thisMonthIncome": "This Month Income",
    "dashboard.savingsGoal": "Savings Goal",
    "dashboard.spendingTrends": "Spending Trends",
    "dashboard.categoryBreakdown": "Category Breakdown",
    "dashboard.recentTransactions": "Recent Transactions",
    "dashboard.activeGoals": "Active Goals",
    
    // Expenses
    "expenses.addExpense": "Add Expense",
    "expenses.amount": "Amount",
    "expenses.description": "Description",
    "expenses.category": "Category",
    "expenses.date": "Date",
    "expenses.location": "Location",
    "expenses.mood": "Mood",
    "expenses.rating": "Rating",
    "expenses.tags": "Tags",
    
    // Settings
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.preferences": "Preferences",
    "settings.security": "Security",
    "settings.notifications": "Notifications",
    "settings.data": "Data",
    "settings.language": "Language",
    "settings.currency": "Currency",
    "settings.timezone": "Timezone",
    "settings.theme": "Theme",
    
    // Auth
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
  },
  it: {
    // Common
    "common.save": "Salva",
    "common.cancel": "Annulla",
    "common.delete": "Elimina",
    "common.edit": "Modifica",
    "common.loading": "Caricamento...",
    "common.error": "Errore",
    "common.success": "Successo",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.expenses": "Spese",
    "nav.budgets": "Budget",
    "nav.analytics": "Analisi",
    "nav.goals": "Obiettivi",
    "nav.settings": "Impostazioni",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.totalBalance": "Saldo Totale",
    "dashboard.thisMonthExpenses": "Spese di Questo Mese",
    "dashboard.thisMonthIncome": "Entrate di Questo Mese",
    "dashboard.savingsGoal": "Obiettivo di Risparmio",
    "dashboard.spendingTrends": "Tendenze di Spesa",
    "dashboard.categoryBreakdown": "Ripartizione per Categoria",
    "dashboard.recentTransactions": "Transazioni Recenti",
    "dashboard.activeGoals": "Obiettivi Attivi",
    
    // Expenses
    "expenses.addExpense": "Aggiungi Spesa",
    "expenses.amount": "Importo",
    "expenses.description": "Descrizione",
    "expenses.category": "Categoria",
    "expenses.date": "Data",
    "expenses.location": "Posizione",
    "expenses.mood": "Umore",
    "expenses.rating": "Valutazione",
    "expenses.tags": "Tag",
    
    // Settings
    "settings.title": "Impostazioni",
    "settings.profile": "Profilo",
    "settings.preferences": "Preferenze",
    "settings.security": "Sicurezza",
    "settings.notifications": "Notifiche",
    "settings.data": "Dati",
    "settings.language": "Lingua",
    "settings.currency": "Valuta",
    "settings.timezone": "Fuso Orario",
    "settings.theme": "Tema",
    
    // Auth
    "auth.signIn": "Accedi",
    "auth.signUp": "Registrati",
    "auth.logout": "Disconnetti",
    "auth.email": "Email",
    "auth.password": "Password",
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<"en" | "it">("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "it" | null;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: "en" | "it") => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations["en"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
