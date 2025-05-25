import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UserRole, UserStatus, Permission } from "@/lib/types";
import { auth } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasPermission: (permission: Permission) => boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const loggedInUser = localStorage.getItem("mueen_currentUser");
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
      } catch (error) {
        console.error("Error restoring user session:", error);
        localStorage.removeItem("mueen_currentUser");
        localStorage.removeItem("mueen_token");
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await auth.login(username, password);
      const { user: userData, token } = response;
      
      setUser(userData);
      localStorage.setItem("mueen_currentUser", JSON.stringify(userData));
      localStorage.setItem("mueen_token", token);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      localStorage.removeItem("mueen_currentUser");
      localStorage.removeItem("mueen_token");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server logout fails
      setUser(null);
      localStorage.removeItem("mueen_currentUser");
      localStorage.removeItem("mueen_token");
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.Admin;

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      hasPermission,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
