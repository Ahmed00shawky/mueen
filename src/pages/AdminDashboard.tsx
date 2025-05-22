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
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-6">
        {isArabic ? "لوحة تحكم المسؤول" : "Admin Dashboard"}
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="users">
            {isArabic ? "إدارة المستخدمين" : "User Management"}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            {isArabic ? "إرسال الإشعارات" : "Send Notifications"}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {isArabic ? "نشاط المستخدمين" : "User Activity"}
          </TabsTrigger>
          <TabsTrigger value="stats">
            {isArabic ? "إحصائيات التطبيق" : "App Statistics"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "إدارة المستخدمين" : "User Management"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "إرسال الإشعارات" : "Send Notifications"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "نشاط المستخدمين" : "User Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserActivityView />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "إحصائيات التطبيق" : "App Statistics"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppStats />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
