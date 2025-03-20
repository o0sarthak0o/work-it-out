
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-workout-background min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <Dumbbell className="h-12 w-12 text-workout-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-workout-text mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Work It Out
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-10">
            The ultimate workout tracker app to help you build and maintain your fitness routine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button 
                className="bg-workout-primary hover:bg-blue-600 text-white font-semibold px-8 py-6 text-lg"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                className="bg-workout-primary hover:bg-blue-600 text-white font-semibold px-8 py-6 text-lg"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <footer className="text-center py-4 text-gray-600 text-sm">
        <p>© 2023 Work It Out. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
