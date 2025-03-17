
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-workout-primary" />
              <span className="font-bold text-xl text-workout-text">Work It Out</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="default" 
              onClick={() => navigate('/dashboard')} 
              className="bg-workout-primary hover:bg-blue-600"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
