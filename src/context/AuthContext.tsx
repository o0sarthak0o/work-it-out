
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

// Define the User type
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

// Define the AuthContextType
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('workoutUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('workoutUser');
      }
    }
    setLoading(false);
  }, []);

  // Mock Google login
  const login = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulate a login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user
      const mockUser: User = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        photoURL: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
      };
      
      // Store user in localStorage
      localStorage.setItem('workoutUser', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Successfully logged in");
    } catch (error) {
      console.error('Login failed:', error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      // Clear local storage
      localStorage.removeItem('workoutUser');
      localStorage.removeItem('workouts');
      setUser(null);
      toast.success("Successfully logged out");
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
