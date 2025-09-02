import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Settings from "@/pages/Settings";
import OnboardingWizard from "@/pages/OnboardingWizard";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <OnboardingWizard 
        onComplete={() => setShowOnboarding(false)} 
      />
    );
  }

  return (
    <Layout>
      <Switch>
        {isAuthenticated ? (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/budgets">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">Budgets</h2>
                <p className="text-muted-foreground">Budget management coming soon!</p>
              </div>
            </Route>
            <Route path="/analytics">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">Analytics</h2>
                <p className="text-muted-foreground">Advanced analytics coming soon!</p>
              </div>
            </Route>
            <Route path="/goals">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">Goals</h2>
                <p className="text-muted-foreground">Goal tracking coming soon!</p>
              </div>
            </Route>
            <Route path="/settings" component={Settings} />
          </>
        ) : (
          <Route path="/" component={Landing} />
        )}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
