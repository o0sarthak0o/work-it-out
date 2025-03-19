
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define Exercise type
export interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
}

// Define Set type
export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  order?: number; // Added for Supabase compatibility
}

// Define WorkoutExercise type (an exercise in a specific workout)
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes?: string;
  order?: number; // Added for Supabase compatibility
}

// Define Workout type
export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  lastPerformed?: string;
}

// Define WorkoutSession type
export interface WorkoutSession {
  id: string;
  workoutId: string;
  startTime: string;
  endTime?: string;
  exercises: WorkoutExercise[];
}

// Define Context Type
interface WorkoutContextType {
  workouts: Workout[];
  exercises: Exercise[];
  activeWorkout: WorkoutSession | null;
  getWorkout: (workoutId: string) => Workout | undefined;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => Promise<Workout>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  startWorkout: (workoutId: string) => Promise<void>;
  endWorkout: () => Promise<void>;
  updateCurrentWorkoutExercise: (exercise: WorkoutExercise) => Promise<void>;
}

// Sample exercises data
const sampleExercises: Exercise[] = [
  { id: 'e1', name: 'Bench Press', category: 'Chest' },
  { id: 'e2', name: 'Squat', category: 'Legs' },
  { id: 'e3', name: 'Deadlift', category: 'Back' },
  { id: 'e4', name: 'Pull-up', category: 'Back' },
  { id: 'e5', name: 'Push-up', category: 'Chest' },
  { id: 'e6', name: 'Shoulder Press', category: 'Shoulders' },
  { id: 'e7', name: 'Bicep Curl', category: 'Arms' },
  { id: 'e8', name: 'Tricep Extension', category: 'Arms' },
  { id: 'e9', name: 'Leg Press', category: 'Legs' },
  { id: 'e10', name: 'Lat Pulldown', category: 'Back' },
  { id: 'e11', name: 'Leg Curl', category: 'Legs' },
  { id: 'e12', name: 'Leg Extension', category: 'Legs' },
  { id: 'e13', name: 'Plank', category: 'Core' },
  { id: 'e14', name: 'Crunches', category: 'Core' },
  { id: 'e15', name: 'Russian Twist', category: 'Core' },
];

// Create the context
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Generate a unique ID (used as fallback)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [exercises] = useState<Exercise[]>(sampleExercises);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch workouts from Supabase
  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      try {
        // Fetch workouts from Supabase
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .order('created_at', { ascending: false });

        if (workoutsError) {
          console.error('Error fetching workouts:', workoutsError);
          toast.error('Failed to fetch workouts');
          return;
        }

        // If no workouts exist yet, create a sample workout
        if (workoutsData.length === 0) {
          await createSampleWorkout();
          return;
        }

        // Fetch details for each workout
        const fullWorkouts = await Promise.all(
          workoutsData.map(async (workout) => {
            return await fetchWorkoutWithDetails(workout.id);
          })
        );

        // Filter out null values and set workouts
        setWorkouts(fullWorkouts.filter(Boolean) as Workout[]);
      } catch (error) {
        console.error('Error in fetchWorkouts:', error);
        toast.error('Failed to load workouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  // Create a sample workout for first-time users
  const createSampleWorkout = async () => {
    try {
      // Create sample workout
      const workoutName = 'Full Body Workout';
      const workoutDesc = 'A complete full body workout for beginners';
      
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          name: workoutName,
          description: workoutDesc,
        })
        .select()
        .single();
      
      if (workoutError) throw workoutError;

      // Add exercises to the workout
      const exercisesToAdd = [
        {
          workout_id: workout.id,
          exercise_id: 'e1',
          exercise_name: 'Bench Press',
          order: 0,
        },
        {
          workout_id: workout.id,
          exercise_id: 'e2',
          exercise_name: 'Squat',
          order: 1,
        },
        {
          workout_id: workout.id,
          exercise_id: 'e3',
          exercise_name: 'Deadlift',
          order: 2,
        },
      ];

      const { data: workoutExercises, error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToAdd)
        .select();

      if (exercisesError) throw exercisesError;

      // Add sets to each exercise
      const sets = [];
      for (const exercise of workoutExercises) {
        const exerciseSets = [
          {
            workout_exercise_id: exercise.id,
            weight: exercise.exercise_id === 'e1' ? 45 : exercise.exercise_id === 'e2' ? 85 : 95,
            reps: exercise.exercise_id === 'e1' ? 10 : exercise.exercise_id === 'e2' ? 8 : 6,
            completed: false,
            order: 0,
          },
          {
            workout_exercise_id: exercise.id,
            weight: exercise.exercise_id === 'e1' ? 45 : exercise.exercise_id === 'e2' ? 85 : 95,
            reps: exercise.exercise_id === 'e1' ? 10 : exercise.exercise_id === 'e2' ? 8 : 6,
            completed: false,
            order: 1,
          },
          {
            workout_exercise_id: exercise.id,
            weight: exercise.exercise_id === 'e1' ? 45 : exercise.exercise_id === 'e2' ? 85 : 95,
            reps: exercise.exercise_id === 'e1' ? 10 : exercise.exercise_id === 'e2' ? 8 : 6,
            completed: false,
            order: 2,
          },
        ];
        sets.push(...exerciseSets);
      }

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(sets);

      if (setsError) throw setsError;

      // Fetch the created workout with all details to display
      const fullWorkout = await fetchWorkoutWithDetails(workout.id);
      if (fullWorkout) {
        setWorkouts([fullWorkout]);
      }
    } catch (error) {
      console.error('Error creating sample workout:', error);
      toast.error('Failed to create sample workout');
    }
  };

  // Fetch a workout with all its details (exercises and sets)
  const fetchWorkoutWithDetails = async (workoutId: string): Promise<Workout | null> => {
    try {
      // Fetch the workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) throw workoutError;

      // Fetch the workout exercises
      const { data: workoutExercises, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('order', { ascending: true });

      if (exercisesError) throw exercisesError;

      // Prepare the workout exercises with sets
      const exercises: WorkoutExercise[] = await Promise.all(
        workoutExercises.map(async (exercise) => {
          // Fetch sets for this exercise
          const { data: exerciseSets, error: setsError } = await supabase
            .from('exercise_sets')
            .select('*')
            .eq('workout_exercise_id', exercise.id)
            .order('order', { ascending: true });

          if (setsError) throw setsError;

          // Format sets to match our interface
          const sets: ExerciseSet[] = exerciseSets.map(set => ({
            id: set.id,
            weight: Number(set.weight),
            reps: set.reps,
            completed: set.completed,
            order: set.order
          }));

          // Return the formatted exercise with its sets
          return {
            id: exercise.id,
            exerciseId: exercise.exercise_id,
            exerciseName: exercise.exercise_name,
            notes: exercise.notes || undefined,
            sets,
            order: exercise.order
          };
        })
      );

      // Return the workout with all its details
      return {
        id: workout.id,
        name: workout.name,
        description: workout.description || undefined,
        exercises,
        createdAt: workout.created_at,
        lastPerformed: workout.last_performed || undefined
      };
    } catch (error) {
      console.error('Error fetching workout details:', error);
      return null;
    }
  };

  // Get a specific workout
  const getWorkout = (workoutId: string) => {
    return workouts.find(workout => workout.id === workoutId);
  };

  // Add a new workout
  const addWorkout = async (newWorkout: Omit<Workout, 'id' | 'createdAt'>): Promise<Workout> => {
    try {
      // Insert the workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          name: newWorkout.name,
          description: newWorkout.description,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create the workout in the local state (we'll fetch the full details after)
      const workoutWithDefaults: Workout = {
        id: workout.id,
        name: workout.name,
        description: workout.description || undefined,
        exercises: [],
        createdAt: workout.created_at,
      };

      // Update local state
      setWorkouts(prev => [workoutWithDefaults, ...prev]);
      toast.success(`Workout "${newWorkout.name}" created`);
      
      return workoutWithDefaults;
    } catch (error) {
      console.error('Error adding workout:', error);
      toast.error('Failed to create workout');
      // Fallback to return something
      return {
        id: generateId(),
        name: newWorkout.name,
        description: newWorkout.description,
        exercises: [],
        createdAt: new Date().toISOString(),
      };
    }
  };

  // Update an existing workout
  const updateWorkout = async (updatedWorkout: Workout): Promise<void> => {
    try {
      // Update the workout record
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          name: updatedWorkout.name,
          description: updatedWorkout.description,
          last_performed: updatedWorkout.lastPerformed,
        })
        .eq('id', updatedWorkout.id);

      if (workoutError) throw workoutError;

      // Get existing workout exercises to compare with updated ones
      const { data: existingExercises, error: getExError } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', updatedWorkout.id);

      if (getExError) throw getExError;

      // Handle exercises - first identify which ones to add, update, or delete
      const existingExerciseIds = existingExercises.map(ex => ex.id);
      const updatedExerciseIds = updatedWorkout.exercises.map(ex => ex.id);

      // Exercises to delete (in existing but not in updated)
      const exercisesToDelete = existingExercises.filter(ex => !updatedExerciseIds.includes(ex.id));
      
      if (exercisesToDelete.length > 0) {
        const { error: deleteExError } = await supabase
          .from('workout_exercises')
          .delete()
          .in('id', exercisesToDelete.map(ex => ex.id));
        
        if (deleteExError) throw deleteExError;
      }

      // Process each updated exercise
      for (let i = 0; i < updatedWorkout.exercises.length; i++) {
        const exercise = updatedWorkout.exercises[i];
        
        if (existingExerciseIds.includes(exercise.id)) {
          // Update existing exercise
          const { error: updateExError } = await supabase
            .from('workout_exercises')
            .update({
              exercise_id: exercise.exerciseId,
              exercise_name: exercise.exerciseName,
              notes: exercise.notes,
              order: i
            })
            .eq('id', exercise.id);
          
          if (updateExError) throw updateExError;
        } else {
          // Insert new exercise
          const { data: newExercise, error: insertExError } = await supabase
            .from('workout_exercises')
            .insert({
              id: exercise.id, // Use the provided ID
              workout_id: updatedWorkout.id,
              exercise_id: exercise.exerciseId,
              exercise_name: exercise.exerciseName,
              notes: exercise.notes,
              order: i
            })
            .select()
            .single();
          
          if (insertExError) throw insertExError;
        }

        // Process sets for this exercise
        const { data: existingSets, error: getSetsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .eq('workout_exercise_id', exercise.id);
        
        if (getSetsError && !getSetsError.message.includes('not found')) throw getSetsError;
        
        const existingSetIds = existingSets ? existingSets.map(set => set.id) : [];
        const updatedSetIds = exercise.sets.map(set => set.id);

        // Sets to delete (in existing but not in updated)
        const setsToDelete = existingSets ? existingSets.filter(set => !updatedSetIds.includes(set.id)) : [];
        
        if (setsToDelete.length > 0) {
          const { error: deleteSetsError } = await supabase
            .from('exercise_sets')
            .delete()
            .in('id', setsToDelete.map(set => set.id));
          
          if (deleteSetsError) throw deleteSetsError;
        }

        // Process each set
        for (let j = 0; j < exercise.sets.length; j++) {
          const set = exercise.sets[j];
          
          if (existingSetIds.includes(set.id)) {
            // Update existing set
            const { error: updateSetError } = await supabase
              .from('exercise_sets')
              .update({
                weight: set.weight,
                reps: set.reps,
                completed: set.completed,
                order: j
              })
              .eq('id', set.id);
            
            if (updateSetError) throw updateSetError;
          } else {
            // Insert new set
            const { error: insertSetError } = await supabase
              .from('exercise_sets')
              .insert({
                id: set.id, // Use the provided ID
                workout_exercise_id: exercise.id,
                weight: set.weight,
                reps: set.reps,
                completed: set.completed,
                order: j
              });
            
            if (insertSetError) throw insertSetError;
          }
        }
      }

      // Refresh the workout data in local state
      const refreshedWorkout = await fetchWorkoutWithDetails(updatedWorkout.id);
      
      if (refreshedWorkout) {
        setWorkouts(prev => 
          prev.map(workout => workout.id === refreshedWorkout.id ? refreshedWorkout : workout)
        );
      }

      toast.success(`Workout "${updatedWorkout.name}" updated`);
    } catch (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to update workout');
      
      // Fallback update in local state
      setWorkouts(prev => 
        prev.map(workout => workout.id === updatedWorkout.id ? updatedWorkout : workout)
      );
    }
  };

  // Delete a workout
  const deleteWorkout = async (workoutId: string): Promise<void> => {
    try {
      const workoutToDelete = workouts.find(w => w.id === workoutId);
      if (!workoutToDelete) {
        toast.error("Workout not found");
        return;
      }

      // Delete the workout (cascade will delete related exercises and sets)
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
      
      // Update local state
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
      toast.success(`Workout "${workoutToDelete.name}" deleted`);
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  // Start a workout session
  const startWorkout = async (workoutId: string): Promise<void> => {
    try {
      const workout = getWorkout(workoutId);
      if (!workout) {
        toast.error("Workout not found");
        return;
      }

      // Create a workout session in Supabase
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          workout_id: workoutId,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create session exercises and sets based on the workout template
      const sessionExercises = [];

      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        
        // Insert session exercise
        const { data: sessionExercise, error: exerciseError } = await supabase
          .from('session_exercises')
          .insert({
            session_id: session.id,
            exercise_id: exercise.exerciseId,
            exercise_name: exercise.exerciseName,
            notes: exercise.notes,
            order: i
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;
        
        sessionExercises.push(sessionExercise);

        // Insert sets for this exercise
        const sessionSets = [];
        for (let j = 0; j < exercise.sets.length; j++) {
          const set = exercise.sets[j];
          sessionSets.push({
            session_exercise_id: sessionExercise.id,
            weight: set.weight,
            reps: set.reps,
            completed: false,
            order: j
          });
        }

        const { error: setsError } = await supabase
          .from('session_sets')
          .insert(sessionSets);

        if (setsError) throw setsError;
      }

      // Create the active workout object
      const workoutSession: WorkoutSession = {
        id: session.id,
        workoutId: workout.id,
        startTime: session.start_time,
        exercises: await Promise.all(sessionExercises.map(async (ex) => {
          // Fetch sets for this session exercise
          const { data: sessionSets, error: setsError } = await supabase
            .from('session_sets')
            .select('*')
            .eq('session_exercise_id', ex.id)
            .order('order', { ascending: true });

          if (setsError) throw setsError;

          // Format the sets
          const sets: ExerciseSet[] = sessionSets.map(set => ({
            id: set.id,
            weight: Number(set.weight),
            reps: set.reps,
            completed: set.completed,
            order: set.order
          }));

          // Return the exercise with its sets
          return {
            id: ex.id,
            exerciseId: ex.exercise_id,
            exerciseName: ex.exercise_name,
            notes: ex.notes || undefined,
            sets,
            order: ex.order
          };
        }))
      };

      // Set the active workout
      setActiveWorkout(workoutSession);
      toast.success(`Started workout: ${workout.name}`);
    } catch (error) {
      console.error('Error starting workout:', error);
      toast.error('Failed to start workout');
    }
  };

  // End the current workout session
  const endWorkout = async (): Promise<void> => {
    if (!activeWorkout) {
      toast.error("No active workout to end");
      return;
    }

    try {
      // Update the session end time
      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .update({
          end_time: new Date().toISOString()
        })
        .eq('id', activeWorkout.id);

      if (sessionError) throw sessionError;

      // Update the last performed date on the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          last_performed: new Date().toISOString()
        })
        .eq('id', activeWorkout.workoutId);

      if (workoutError) throw workoutError;

      // Refresh the workout data
      const refreshedWorkout = await fetchWorkoutWithDetails(activeWorkout.workoutId);
      
      if (refreshedWorkout) {
        setWorkouts(prev => 
          prev.map(workout => workout.id === refreshedWorkout.id ? refreshedWorkout : workout)
        );
      }

      setActiveWorkout(null);
      toast.success("Workout completed");
    } catch (error) {
      console.error('Error ending workout:', error);
      toast.error('Failed to end workout');
    }
  };

  // Update an exercise in the current workout
  const updateCurrentWorkoutExercise = async (updatedExercise: WorkoutExercise): Promise<void> => {
    if (!activeWorkout) {
      toast.error("No active workout");
      return;
    }

    try {
      // Update the session exercise
      const { error: exerciseError } = await supabase
        .from('session_exercises')
        .update({
          notes: updatedExercise.notes
        })
        .eq('id', updatedExercise.id);

      if (exerciseError) throw exerciseError;

      // Update each set
      for (const set of updatedExercise.sets) {
        const { error: setError } = await supabase
          .from('session_sets')
          .update({
            weight: set.weight,
            reps: set.reps,
            completed: set.completed
          })
          .eq('id', set.id);

        if (setError) throw setError;
      }

      // Update local state
      setActiveWorkout(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          exercises: prev.exercises.map(ex => 
            ex.id === updatedExercise.id ? updatedExercise : ex
          )
        };
      });
    } catch (error) {
      console.error('Error updating exercise in session:', error);
      toast.error('Failed to update exercise');
      
      // Fallback update in local state
      setActiveWorkout(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          exercises: prev.exercises.map(ex => 
            ex.id === updatedExercise.id ? updatedExercise : ex
          )
        };
      });
    }
  };

  return (
    <WorkoutContext.Provider value={{
      workouts,
      exercises,
      activeWorkout,
      getWorkout,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      startWorkout,
      endWorkout,
      updateCurrentWorkoutExercise,
    }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="mb-4">Loading your workouts...</div>
          </div>
        </div>
      ) : children}
    </WorkoutContext.Provider>
  );
}

// Create a custom hook to use the workout context
export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
