
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, Clock, Dumbbell } from 'lucide-react';
import { useWorkout, Workout } from '@/context/WorkoutContext';
import Navbar from '@/components/Navbar';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Dashboard = () => {
  const { workouts, addWorkout } = useWorkout();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutDescription, setNewWorkoutDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter workouts by search term
  const filteredWorkouts = workouts.filter(workout => 
    workout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateWorkout = async () => {
    if (!newWorkoutName.trim()) return;
    
    await addWorkout({
      name: newWorkoutName,
      description: newWorkoutDescription,
      exercises: []
    });
    
    setNewWorkoutName('');
    setNewWorkoutDescription('');
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-workout-background">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-workout-text">Your Workouts</h1>
            <p className="text-workout-subtext">
              {workouts.length === 0 
                ? 'Get started by creating your first workout' 
                : `You have ${workouts.length} workout${workouts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              placeholder="Search workouts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-workout-primary hover:bg-blue-600">
                  <Plus className="mr-2 h-4 w-4" /> New Workout
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Workout</DialogTitle>
                  <DialogDescription>
                    Give your workout a name and optional description.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Full Body Workout"
                      value={newWorkoutName}
                      onChange={(e) => setNewWorkoutName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description..."
                      value={newWorkoutDescription}
                      onChange={(e) => setNewWorkoutDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateWorkout} className="bg-workout-primary hover:bg-blue-600">
                    Create Workout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {workouts.length === 0 ? (
          <Card className="mt-8 p-8 text-center">
            <CardContent className="pt-6 flex flex-col items-center">
              <Dumbbell className="h-16 w-16 text-workout-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Workouts Yet</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first workout routine</p>
              <Dialog onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-workout-primary hover:bg-blue-600">
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Workout
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard 
                key={workout.id} 
                workout={workout} 
                onClick={() => navigate(`/workout/${workout.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkoutCard = ({ workout, onClick }: { workout: Workout; onClick: () => void }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="p-6 bg-white border-b">
        <CardTitle className="text-xl font-semibold">{workout.name}</CardTitle>
        {workout.description && (
          <CardDescription>{workout.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-workout-subtext">
            <Dumbbell className="h-4 w-4 mr-2" />
            <span>{workout.exercises.length} exercises</span>
          </div>
          {workout.lastPerformed && (
            <div className="flex items-center text-workout-subtext">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Last performed: {formatDistanceToNow(new Date(workout.lastPerformed), { addSuffix: true })}</span>
            </div>
          )}
          <div className="flex items-center text-workout-subtext">
            <Clock className="h-4 w-4 mr-2" />
            <span>Created: {formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 bg-gray-50 border-t">
        <Button variant="outline" className="w-full">View Workout</Button>
      </CardFooter>
    </Card>
  );
};

export default Dashboard;
