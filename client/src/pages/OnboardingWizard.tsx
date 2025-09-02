import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Wallet, Globe, DollarSign, Moon, Sun } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    language: language,
    currency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: theme,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/auth/user", {
        ...data,
        onboardingCompleted: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t("common.success"),
        description: "Welcome to ExpenseJournal!",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const steps = [
    {
      title: t("onboarding.welcome"),
      description: "Let's get you set up with ExpenseJournal",
      icon: Wallet,
    },
    {
      title: t("onboarding.selectLanguage"),
      description: "Choose your preferred language",
      icon: Globe,
    },
    {
      title: t("onboarding.selectCurrency"),
      description: "Set your default currency for expenses",
      icon: DollarSign,
    },
    {
      title: t("onboarding.selectTimezone"),
      description: "Configure your timezone for accurate tracking",
      icon: Globe,
    },
    {
      title: t("onboarding.selectTheme"),
      description: "Choose your preferred appearance",
      icon: theme === "dark" ? Moon : Sun,
    },
    {
      title: t("onboarding.complete"),
      description: "You're all set! Start tracking your expenses",
      icon: CheckCircle,
    },
  ];

  const currencies = [
    { value: "USD", label: "USD ($) - US Dollar" },
    { value: "EUR", label: "EUR (€) - Euro" },
    { value: "GBP", label: "GBP (£) - British Pound" },
    { value: "JPY", label: "JPY (¥) - Japanese Yen" },
    { value: "CAD", label: "CAD (C$) - Canadian Dollar" },
    { value: "AUD", label: "AUD (A$) - Australian Dollar" },
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (New York)" },
    { value: "America/Chicago", label: "Central Time (Chicago)" },
    { value: "America/Denver", label: "Mountain Time (Denver)" },
    { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
    { value: "Europe/London", label: "Greenwich Mean Time (London)" },
    { value: "Europe/Paris", label: "Central European Time (Paris)" },
    { value: "Europe/Rome", label: "Central European Time (Rome)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)" },
    { value: "Asia/Shanghai", label: "China Standard Time (Shanghai)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Apply preferences
    setLanguage(preferences.language as "en" | "it");
    setTheme(preferences.theme as "light" | "dark");
    
    // Save to backend
    updateUserMutation.mutate(preferences);
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-onboarding-title">
            {currentStepData.title}
          </CardTitle>
          <p className="text-muted-foreground" data-testid="text-onboarding-description">
            {currentStepData.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-48 flex items-center justify-center">
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Wallet className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Welcome to ExpenseJournal!</h3>
                <p className="text-muted-foreground max-w-md">
                  We'll help you set up your account in just a few steps. This will only take a minute.
                </p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="w-full max-w-md space-y-4">
                <div className="text-center mb-6">
                  <Globe className="w-12 h-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Choose Your Language</h3>
                </div>
                <Select 
                  value={preferences.language} 
                  onValueChange={(value) => handlePreferenceChange("language", value)}
                >
                  <SelectTrigger data-testid="select-onboarding-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentStep === 2 && (
              <div className="w-full max-w-md space-y-4">
                <div className="text-center mb-6">
                  <DollarSign className="w-12 h-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Default Currency</h3>
                  <p className="text-sm text-muted-foreground">
                    You can always change this later or use multiple currencies
                  </p>
                </div>
                <Select 
                  value={preferences.currency} 
                  onValueChange={(value) => handlePreferenceChange("currency", value)}
                >
                  <SelectTrigger data-testid="select-onboarding-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentStep === 3 && (
              <div className="w-full max-w-md space-y-4">
                <div className="text-center mb-6">
                  <Globe className="w-12 h-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Your Timezone</h3>
                  <p className="text-sm text-muted-foreground">
                    This helps us show the correct dates and times
                  </p>
                </div>
                <Select 
                  value={preferences.timezone} 
                  onValueChange={(value) => handlePreferenceChange("timezone", value)}
                >
                  <SelectTrigger data-testid="select-onboarding-timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentStep === 4 && (
              <div className="w-full max-w-md space-y-6">
                <div className="text-center mb-6">
                  {preferences.theme === "dark" ? (
                    <Moon className="w-12 h-12 text-primary mx-auto mb-2" />
                  ) : (
                    <Sun className="w-12 h-12 text-primary mx-auto mb-2" />
                  )}
                  <h3 className="text-lg font-semibold">Choose Your Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the appearance that works best for you
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePreferenceChange("theme", "light")}
                    className={`p-6 rounded-lg border-2 transition-colors ${
                      preferences.theme === "light" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid="button-theme-light"
                  >
                    <Sun className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Light</div>
                  </button>
                  <button
                    onClick={() => handlePreferenceChange("theme", "dark")}
                    className={`p-6 rounded-lg border-2 transition-colors ${
                      preferences.theme === "dark" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid="button-theme-dark"
                  >
                    <Moon className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Dark</div>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-success" />
                </div>
                <h3 className="text-xl font-semibold">{t("onboarding.complete")}</h3>
                <p className="text-muted-foreground max-w-md">
                  Your account is now set up and ready to use. Start tracking your expenses and take control of your finances!
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              data-testid="button-onboarding-previous"
            >
              {t("common.previous")}
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                data-testid="button-onboarding-next"
              >
                {t("common.next")}
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={updateUserMutation.isPending}
                data-testid="button-onboarding-finish"
              >
                {updateUserMutation.isPending ? t("common.loading") : t("onboarding.getStarted")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
