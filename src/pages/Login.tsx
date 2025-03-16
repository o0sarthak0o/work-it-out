
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Email form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const Login = () => {
  const { loginWithOTP, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Email form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle email submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await loginWithOTP(values.email);
    setUserEmail(values.email);
    setEmailSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-workout-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              {emailSent 
                ? "Check your email for a login link"
                : "Sign in to access your workout dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!emailSent ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          We'll send you a login link to your email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-workout-primary hover:bg-blue-600" 
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Login Link"}
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">Login link sent!</h3>
                  <p className="text-muted-foreground">
                    We've sent a login link to <span className="font-medium">{userEmail}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Please check your email and click on the login link to access your account.
                    The link will expire in 24 hours.
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                    disabled={loading}
                  >
                    Use a different email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => onSubmit(form.getValues())}
                    disabled={loading}
                  >
                    Resend login link
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
