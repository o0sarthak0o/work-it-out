
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
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
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
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setLoading(true);
          
          if (newSession) {
            console.log("User authenticated:", newSession.user.email);
            setSession(newSession);
            setUser(mapSupabaseUser(newSession.user));
          }
          
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
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
      
      // Get the current URL and use it for the redirect
      // Make sure we're using the actual origin, not just the current path
      const origin = window.location.origin;
      const redirectTo = `${origin}/dashboard`;
      console.log("Redirect URL:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        }
      });
      
      console.log("OTP auth response:", data);
      
      if (error) {
        console.error("OTP auth error details:", error);
        throw error;
      }
      
      toast.success("Check your email for a login link");
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Email and password login
  const loginWithEmailAndPassword = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("Starting email/password authentication");
      
      // Hard-coded restriction to only allow sarthakagarwal32@gmail.com
      if (email !== 'sarthakagarwal32@gmail.com') {
        throw new Error("Access denied. Only specific users are allowed.");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error details:", error);
        throw error;
      }
      
      toast.success("Successfully logged in");
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Signup with email and password
  const signup = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("Starting signup process");
      
      // Hard-coded restriction to only allow sarthakagarwal32@gmail.com
      if (email !== 'sarthakagarwal32@gmail.com') {
        throw new Error("Access denied. Only specific users are allowed to register.");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        console.error("Signup error details:", error);
        throw error;
      }
      
      toast.success("Account created successfully. You can now log in.");
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error.message || "Signup failed. Please try again.");
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
        loginWithEmailAndPassword,
        signup,
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
