import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useWorkout, WorkoutExercise, ExerciseSet } from '@/context/WorkoutContext';
import Navbar from '@/components/Navbar';
import { ArrowLeft, CheckCircle2, Check, X, Timer, TimerReset } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const WorkoutSession = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { isAuthenticated } = useAuth();
  const { getWorkout, activeWorkout, startWorkout, endWorkout, updateCurrentWorkoutExercise } = useWorkout();
  const navigate = useNavigate();
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [exercisesCompleted, setExercisesCompleted] = useState<Record<string, boolean>>({});
  const [sessionDuration, setSessionDuration] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const workout = workoutId ? getWorkout(workoutId) : undefined;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Redirect to workout detail if no active workout and workout id exists
  useEffect(() => {
    if (!activeWorkout && workoutId && isAuthenticated) {
      if (workout) {
        startWorkout(workoutId);
      } else {
        toast.error("Workout not found");
        navigate('/dashboard');
      }
    }
  }, [activeWorkout, workoutId, isAuthenticated, navigate, workout, startWorkout]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  // Start timer when page loads
  useEffect(() => {
    setTimerRunning(true);
    return () => setTimerRunning(false);
  }, []);

  // Initialize exercise completion state
  useEffect(() => {
    if (activeWorkout) {
      const initial: Record<string, boolean> = {};
      activeWorkout.exercises.forEach(exercise => {
        const isCompleted = exercise.sets.every(set => set.completed);
        initial[exercise.id] = isCompleted;
      });
      setExercisesCompleted(initial);
    }
  }, [activeWorkout]);

  const handleSetChange = (
    exercise: WorkoutExercise, 
    setIndex: number, 
    field: keyof ExerciseSet, 
    value: any
  ) => {
    const updatedSets = [...exercise.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: field === 'completed' ? value : parseFloat(value) || 0
    };

    const updatedExercise = {
      ...exercise,
      sets: updatedSets
    };

    updateCurrentWorkoutExercise(updatedExercise);

    // Update exercise completion state
    const isCompleted = updatedSets.every(set => set.completed);
    setExercisesCompleted(prev => ({
      ...prev,
      [exercise.id]: isCompleted
    }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEndWorkout = async () => {
    if (activeWorkout) {
      await endWorkout();
      navigate(`/workout/${workoutId}`);
      toast.success("Workout completed!");
    }
  };

  if (!activeWorkout) return null;

  return (
    <div className="min-h-screen flex flex-col bg-workout-background">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => setIsEndDialogOpen(true)} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> End Workout
            </Button>
            <h1 className="text-3xl font-bold text-workout-text">
              {workout?.name || 'Workout Session'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
              <Timer className="h-5 w-5 text-workout-primary mr-2" />
              <span className="text-lg font-semibold">{formatTime(sessionDuration)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2" 
                onClick={() => setTimerRunning(!timerRunning)}
              >
                {timerRunning ? <X className="h-4 w-4" /> : <TimerReset className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              className="bg-workout-secondary hover:bg-green-600"
              onClick={() => setIsEndDialogOpen(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
            </Button>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {activeWorkout.exercises.map((exercise) => (
            <Card 
              key={exercise.id}
              className={cn(
                "border-l-4",
                exercisesCompleted[exercise.id] 
                  ? "border-l-workout-secondary" 
                  : "border-l-transparent"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    {exercise.exerciseName}
                    {exercisesCompleted[exercise.id] && (
                      <Check className="h-5 w-5 text-workout-secondary ml-2" />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-3 md:col-span-4">Weight (lbs)</div>
                    <div className="col-span-3 md:col-span-4">Reps</div>
                    <div className="col-span-5 md:col-span-3">Done</div>
                  </div>
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 text-sm font-medium">{setIndex + 1}</div>
                      <div className="col-span-3 md:col-span-4">
                        <Input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleSetChange(exercise, setIndex, 'weight', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-4">
                        <Input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleSetChange(exercise, setIndex, 'reps', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3 flex items-center">
                        <Checkbox
                          checked={set.completed}
                          onCheckedChange={(checked) => 
                            handleSetChange(exercise, setIndex, 'completed', checked)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Workout</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to end this workout session?</p>
          <DialogFooter className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEndDialogOpen(false)}>
              Continue Workout
            </Button>
            <Button onClick={handleEndWorkout}>
              End Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Utility function for conditional classes
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default WorkoutSession;
