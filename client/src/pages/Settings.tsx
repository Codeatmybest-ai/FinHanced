import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  HelpCircle,
  GraduationCap,
  Camera,
  Download,
  Trash2,
  AlertTriangle
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("profile");

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/auth/user", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t("common.success"),
        description: "Settings updated successfully",
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

  const deleteDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/user/data");
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "All data deleted successfully",
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

  const handleUpdateProfile = (field: string, value: any) => {
    updateUserMutation.mutate({ [field]: value });
  };

  const handleExportData = () => {
    window.open('/api/user/export', '_blank');
  };

  const handleDeleteAllData = () => {
    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      deleteDataMutation.mutate();
    }
  };

  const navigationItems = [
    { id: "profile", label: t("settings.profile"), icon: User },
    { id: "preferences", label: t("settings.preferences"), icon: SettingsIcon },
    { id: "security", label: t("settings.security"), icon: Shield },
    { id: "notifications", label: t("settings.notifications"), icon: Bell },
    { id: "data", label: t("settings.data"), icon: Database },
    { id: "help", label: t("settings.help"), icon: HelpCircle },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "JPY", label: "JPY (¥)" },
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/Rome", label: "Central European Time (CET)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-settings-title">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground" data-testid="text-settings-subtitle">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    data-testid={`button-nav-${item.id}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Profile Settings */}
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.profile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center space-x-6">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                    alt="Profile picture" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    data-testid="img-profile-picture"
                  />
                  <div>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>{t("settings.changePhoto")}</span>
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                    <Input
                      id="firstName"
                      defaultValue={user?.firstName || ""}
                      onBlur={(e) => handleUpdateProfile("firstName", e.target.value)}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                    <Input
                      id="lastName"
                      defaultValue={user?.lastName || ""}
                      onBlur={(e) => handleUpdateProfile("lastName", e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                    className="bg-muted"
                    data-testid="input-email"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          {activeSection === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.preferences")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t("settings.language")}</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger data-testid="select-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("settings.currency")}</Label>
                    <Select 
                      defaultValue={user?.currency || "USD"}
                      onValueChange={(value) => handleUpdateProfile("currency", value)}
                    >
                      <SelectTrigger data-testid="select-currency">
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
                </div>

                <div>
                  <Label>{t("settings.timezone")}</Label>
                  <Select 
                    defaultValue={user?.timezone || "UTC"}
                    onValueChange={(value) => handleUpdateProfile("timezone", value)}
                  >
                    <SelectTrigger data-testid="select-timezone">
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

                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.darkMode")}</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch 
                    checked={theme === "dark"} 
                    onCheckedChange={toggleTheme}
                    data-testid="switch-dark-mode"
                  />
                </div>

                <Separator />

                {/* AI Features */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">AI Features</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Smart Categorization</Label>
                      <p className="text-sm text-muted-foreground">Auto-categorize expenses using AI</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-smart-categorization" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Smart Suggestions</Label>
                      <p className="text-sm text-muted-foreground">Get AI-powered financial advice</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-smart-suggestions" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeSection === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.security")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div>
                  <h4 className="font-medium text-foreground mb-4">Change Password</h4>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Current password" data-testid="input-current-password" />
                    <Input type="password" placeholder="New password" data-testid="input-new-password" />
                    <Input type="password" placeholder="Confirm new password" data-testid="input-confirm-password" />
                    <Button data-testid="button-update-password">Update Password</Button>
                  </div>
                </div>

                <Separator />

                {/* Biometric Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Biometric Authentication</Label>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face ID to unlock</p>
                  </div>
                  <Switch data-testid="switch-biometric-auth" />
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" data-testid="button-setup-2fa">Setup 2FA</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Management */}
          {activeSection === "data" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.data")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Export Data */}
                <div>
                  <h4 className="font-medium text-foreground mb-4">{t("settings.exportData")}</h4>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      className="flex items-center space-x-2"
                      data-testid="button-export-json"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Dangerous Actions */}
                <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                  <h4 className="font-medium text-destructive mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{t("settings.dangerZone")}</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t("settings.clearAllData")}</p>
                        <p className="text-xs text-muted-foreground">Remove all expenses, income, and settings</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAllData}
                        disabled={deleteDataMutation.isPending}
                        className="flex items-center space-x-2"
                        data-testid="button-clear-data"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear Data</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help & Tutorial */}
          {activeSection === "help" && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{t("settings.needHelp")}</h4>
                    <p className="text-sm text-muted-foreground">{t("settings.tutorialDescription")}</p>
                  </div>
                  <Button data-testid="button-start-tutorial">
                    {t("settings.startTutorial")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
