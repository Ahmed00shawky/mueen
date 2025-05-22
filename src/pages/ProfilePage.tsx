import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { storage } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username,
        email: user.email || "",
      }));
      setProfileImage(user.profilePic || null);
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: isArabic ? "خطأ في نوع الملف" : "Invalid File Type",
        description: isArabic 
          ? "يرجى اختيار ملف صورة صالح"
          : "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: isArabic ? "حجم الملف كبير جداً" : "File Too Large",
        description: isArabic 
          ? "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت"
          : "Image size should not exceed 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      if (user) {
        // Update local state first for immediate feedback
        setProfileImage(base64String);
        
        const updatedUser = {
          ...user,
          profilePic: base64String,
        };
        
        // Update in storage
        storage.updateUser(updatedUser);
        
        // Update in context
        setUser(updatedUser);
        
        toast({
          title: isArabic ? "تم تحديث الصورة" : "Image Updated",
          description: isArabic 
            ? "تم تحديث صورة الملف الشخصي بنجاح"
            : "Profile picture has been updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "حدث خطأ أثناء تحديث الصورة"
          : "An error occurred while updating the image",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (formData.newPassword && formData.currentPassword !== user.password) {
      toast({
        title: isArabic ? "خطأ في كلمة المرور" : "Password Error",
        description: isArabic 
          ? "كلمة المرور الحالية غير صحيحة"
          : "Current password is incorrect",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: isArabic ? "خطأ في كلمة المرور" : "Password Error",
        description: isArabic 
          ? "كلمة المرور الجديدة وتأكيدها غير متطابقين"
          : "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }
    
    const updatedUser = {
      ...user,
      username: formData.username,
      email: formData.email || undefined,
      password: formData.newPassword ? formData.newPassword : user.password,
    };
    
    storage.updateUser(updatedUser);
    
    toast({
      title: isArabic ? "تم التحديث" : "Profile Updated",
      description: isArabic 
        ? "تم تحديث معلومات حسابك بنجاح"
        : "Your profile information has been updated successfully",
    });
    
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isArabic ? "الملف الشخصي" : "Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage 
                src={profileImage || "/placeholder.svg"} 
                alt={user.username}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-input"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('profile-image-input')?.click()}
              >
                {isArabic ? "تغيير الصورة" : "Change Picture"}
              </Button>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">{isArabic ? "اسم المستخدم" : "Username"}</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h3 className="font-medium mb-4">
                {isArabic ? "تغيير كلمة المرور" : "Change Password"}
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    {isArabic ? "كلمة المرور الحالية" : "Current Password"}
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    {isArabic ? "كلمة المرور الجديدة" : "New Password"}
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {isArabic ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">
                {isArabic ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
