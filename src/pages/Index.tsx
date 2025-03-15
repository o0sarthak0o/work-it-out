
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-workout-background">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8 text-center">
          <div>
            <Dumbbell className="mx-auto h-24 w-24 text-workout-primary animate-pulse-light" />
            <h1 className="mt-6 text-4xl font-extrabold text-workout-text sm:text-5xl md:text-6xl">
              Work It Out
            </h1>
            <p className="mt-3 text-xl text-workout-subtext">
              Track your workouts, monitor your progress, achieve your fitness goals.
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <Button 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="px-8 py-6 text-lg bg-workout-primary hover:bg-blue-600 transition-all duration-200 transform hover:-translate-y-1"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'} 
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-16 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-workout-text">Track Workouts</h3>
              <p className="mt-2 text-workout-subtext">Log exercises, sets, and reps to keep track of your entire fitness journey.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-workout-text">Monitor Progress</h3>
              <p className="mt-2 text-workout-subtext">See your improvement over time with detailed workout history.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-workout-text">Stay Consistent</h3>
              <p className="mt-2 text-workout-subtext">Build routines and stay motivated with your personal workout plans.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
