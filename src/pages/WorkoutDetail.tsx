
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useWorkout, Exercise } from '@/context/WorkoutContext';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Plus, Play, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckboxGroup, Checkbox } from '@/components/Checkbox';
import { toast } from 'sonner';

const WorkoutDetail = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { isAuthenticated } = useAuth();
  const { getWorkout, exercises, updateWorkout, startWorkout, deleteWorkout } = useWorkout();
  const navigate = useNavigate();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Get the workout
  const workout = workoutId ? getWorkout(workoutId) : undefined;

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Redirect to dashboard if workout not found
  React.useEffect(() => {
    if (!workout && !isSelectionDialogOpen && isAuthenticated) {
      toast.error("Workout not found");
      navigate('/dashboard');
    }
  }, [workout, navigate, isAuthenticated, isSelectionDialogOpen]);

  const handleAddExercises = () => {
    if (!workout || selectedExercises.length === 0) return;

    // Map selected exercise IDs to workout exercises
    const newExercises = selectedExercises.map(exerciseId => {
      const exercise = exercises.find(e => e.id === exerciseId);
      return {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        exerciseId,
        exerciseName: exercise?.name || 'Unknown Exercise',
        sets: [
          { 
            id: Date.now().toString(36) + Math.random().toString(36).substring(2), 
            weight: 0, 
            reps: 8, 
            completed: false 
          },
          { 
            id: Date.now().toString(36) + Math.random().toString(36).substring(2), 
            weight: 0, 
            reps: 8, 
            completed: false 
          },
          { 
            id: Date.now().toString(36) + Math.random().toString(36).substring(2), 
            weight: 0, 
            reps: 8, 
            completed: false 
          },
        ]
      };
    });

    // Update the workout with the new exercises
    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, ...newExercises]
    };

    updateWorkout(updatedWorkout);
    setSelectedExercises([]);
    setIsSelectionDialogOpen(false);
  };

  const handleStartWorkout = async () => {
    if (!workoutId) return;
    await startWorkout(workoutId);
    navigate(`/workout/${workoutId}/session`);
  };

  const handleDeleteWorkout = async () => {
    if (!workoutId) return;
    await deleteWorkout(workoutId);
    navigate('/dashboard');
  };

  const handleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // Group exercises by category
  const exercisesByCategory: Record<string, Exercise[]> = {};
  exercises.forEach(exercise => {
    if (!exercisesByCategory[exercise.category]) {
      exercisesByCategory[exercise.category] = [];
    }
    exercisesByCategory[exercise.category].push(exercise);
  });

  if (!workout) return null;

  return (
    <div className="min-h-screen flex flex-col bg-workout-background">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-bold text-workout-text">{workout.name}</h1>
          </div>
          {workout.description && (
            <p className="text-workout-subtext">{workout.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button className="bg-workout-primary hover:bg-blue-600" onClick={handleStartWorkout}>
              <Play className="mr-2 h-4 w-4" /> Start Workout
            </Button>
            <Dialog open={isSelectionDialogOpen} onOpenChange={setIsSelectionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Exercises
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Exercises to Workout</DialogTitle>
                  <DialogDescription>
                    Select exercises to add to your workout.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <CheckboxGroup value={selectedExercises} onChange={setSelectedExercises}>
                    {Object.entries(exercisesByCategory).map(([category, categoryExercises]) => (
                      <div key={category} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryExercises.map(exercise => (
                            <div key={exercise.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={exercise.id} 
                                value={exercise.id}
                                checked={selectedExercises.includes(exercise.id)}
                                onCheckedChange={() => handleExerciseSelection(exercise.id)}
                              />
                              <label 
                                htmlFor={exercise.id} 
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {exercise.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CheckboxGroup>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddExercises} disabled={selectedExercises.length === 0}>
                    Add Selected Exercises
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Workout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Workout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this workout? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteWorkout}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6">Exercises</h2>
          {workout.exercises.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">No exercises yet</p>
                <Button onClick={() => setIsSelectionDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Exercises
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {workout.exercises.map((exercise, index) => (
                <Card key={exercise.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{index + 1}. {exercise.exerciseName}</CardTitle>
                        <CardDescription>{exercise.sets.length} sets</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <div>Set</div>
                      <div>Weight</div>
                      <div>Reps</div>
                      <div></div>
                    </div>
                    {exercise.sets.map((set, setIndex) => (
                      <div key={set.id} className="grid grid-cols-4 gap-2 py-1 border-t text-sm">
                        <div className="flex items-center">{setIndex + 1}</div>
                        <div>{set.weight} lbs</div>
                        <div>{set.reps}</div>
                        <div></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;
