import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { storage } from "@/lib/storage";
import UserManagement from "@/components/admin/UserManagement";
import NotificationManager from "@/components/admin/NotificationManager";
import AppStats from "@/components/admin/AppStats";
import UserActivityView from "@/components/admin/UserActivityView";
import { Users, Bell, Activity, BarChart3 } from "lucide-react";

const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("users");
  
  if (!isAuthenticated || !isAdmin) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <Card className="border shadow-sm">
        <CardContent className="p-4 md:p-6 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right">
            {isArabic ? "لوحة تحكم المسؤول" : "Admin Dashboard"}
          </h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 p-1 md:p-2 bg-muted/50 rounded-lg">
              <TabsTrigger 
                value="users" 
                className="flex flex-col items-center justify-center gap-2 py-3 px-2 md:flex-row md:py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs md:text-sm">
                  {isArabic ? "إدارة المستخدمين" : "User Management"}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex flex-col items-center justify-center gap-2 py-3 px-2 md:flex-row md:py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Bell className="h-5 w-5" />
                <span className="text-xs md:text-sm">
                  {isArabic ? "إرسال الإشعارات" : "Send Notifications"}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex flex-col items-center justify-center gap-2 py-3 px-2 md:flex-row md:py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Activity className="h-5 w-5" />
                <span className="text-xs md:text-sm">
                  {isArabic ? "نشاط المستخدمين" : "User Activity"}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="flex flex-col items-center justify-center gap-2 py-3 px-2 md:flex-row md:py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs md:text-sm">
                  {isArabic ? "إحصائيات التطبيق" : "App Statistics"}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6 space-y-4 md:space-y-0">
              <TabsContent value="users">
                <Card className="border shadow-sm">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-xl md:text-2xl">
                      {isArabic ? "إدارة المستخدمين" : "User Management"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <UserManagement />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="border shadow-sm">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-xl md:text-2xl">
                      {isArabic ? "إرسال الإشعارات" : "Send Notifications"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <NotificationManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="border shadow-sm">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-xl md:text-2xl">
                      {isArabic ? "نشاط المستخدمين" : "User Activity"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <UserActivityView />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="stats">
                <Card className="border shadow-sm">
                  <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-xl md:text-2xl">
                      {isArabic ? "إحصائيات التطبيق" : "App Statistics"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 md:px-6">
                    <AppStats />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
