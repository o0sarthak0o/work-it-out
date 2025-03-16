
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  loginWithOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map Supabase user to our User type
const mapSupabaseUser = (user: SupabaseUser): User => {
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    photoURL: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}&background=random`
  };
};

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // First, check for an existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log("Checking for existing session...");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          return;
        }
        
        if (data?.session) {
          console.log("Found existing session:", data.session.user.email);
          setSession(data.session);
          setUser(mapSupabaseUser(data.session.user));
        } else {
          console.log("No existing session found");
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed event:", event);
        console.log("Session state:", newSession ? "Session exists" : "No session");
        
        setLoading(true);
        
        if (newSession) {
          console.log("User authenticated:", newSession.user.email);
          setSession(newSession);
          setUser(mapSupabaseUser(newSession.user));
        } else {
          console.log("No authenticated user");
          setSession(null);
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Email OTP login
  const loginWithOTP = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("Starting email OTP authentication flow");
      console.log("Email:", email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      console.log("OTP auth response:", data);
      
      if (error) {
        console.error("OTP auth error details:", error);
        throw error;
      }
      
      toast.success("Check your email for a login link or OTP code");
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (email: string, token: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("Verifying OTP");
      console.log("Email:", email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'magiclink'
      });
      
      console.log("OTP verification response:", data);
      
      if (error) {
        console.error("OTP verification error details:", error);
        throw error;
      }
      
      if (data.user) {
        toast.success("Successfully logged in");
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log("Attempting to log out user");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      console.log("User successfully logged out");
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
        loginWithOTP,
        verifyOTP,
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
