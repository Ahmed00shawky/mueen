import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UserRole, UserStatus } from "@/lib/types";
import { storage } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  hasPermission: () => false,
  setUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

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
        const storedUser = storage.getUserById(userData.id);
        
        if (storedUser) {
          const updatedUser = {
            ...storedUser,
            status: UserStatus.Online,
            lastLogin: new Date().toISOString()
          };
          storage.updateUser(updatedUser);
          setUser(updatedUser);
        }
      } catch (error) {
        console.error("Error restoring user session:", error);
        localStorage.removeItem("mueen_currentUser");
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = storage.getUserByUsername(username);
    
    if (foundUser && foundUser.password === password) {
      // In a real application, we would never compare passwords directly
      // We would hash the input password and compare with the stored hash
      
      const updatedUser = {
        ...foundUser,
        status: UserStatus.Online,
        lastLogin: new Date().toISOString()
      };
      
      storage.updateUser(updatedUser);
      setUser(updatedUser);
      localStorage.setItem("mueen_currentUser", JSON.stringify({ id: updatedUser.id }));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
      });
      
      return true;
    }
    
    toast({
      title: "Login failed",
      description: "Invalid username or password",
      variant: "destructive"
    });
    
    return false;
  };

  const logout = (): void => {
    if (user) {
      const updatedUser = {
        ...user,
        status: UserStatus.Offline
      };
      
      storage.updateUser(updatedUser);
      localStorage.removeItem("mueen_currentUser");
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }
  };

  const isAdmin = user?.role === UserRole.Admin;
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === UserRole.Admin) return true;
    return user.permissions.includes(permission as any);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin,
      hasPermission,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
