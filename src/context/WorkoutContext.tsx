
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';

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
}

// Define WorkoutExercise type (an exercise in a specific workout)
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes?: string;
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

// Generate a unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [exercises] = useState<Exercise[]>(sampleExercises); // In a real app, this would be fetched from an API

  // Load workouts from localStorage
  useEffect(() => {
    if (user) {
      const storedWorkouts = localStorage.getItem('workouts');
      if (storedWorkouts) {
        try {
          setWorkouts(JSON.parse(storedWorkouts));
        } catch (error) {
          console.error('Failed to parse stored workouts:', error);
          localStorage.removeItem('workouts');
        }
      } else {
        // Set sample workout for first-time users
        const sampleWorkout: Workout = {
          id: generateId(),
          name: 'Full Body Workout',
          description: 'A complete full body workout for beginners',
          exercises: [
            {
              id: generateId(),
              exerciseId: 'e1',
              exerciseName: 'Bench Press',
              sets: [
                { id: generateId(), weight: 45, reps: 10, completed: false },
                { id: generateId(), weight: 45, reps: 10, completed: false },
                { id: generateId(), weight: 45, reps: 10, completed: false },
              ],
            },
            {
              id: generateId(),
              exerciseId: 'e2',
              exerciseName: 'Squat',
              sets: [
                { id: generateId(), weight: 85, reps: 8, completed: false },
                { id: generateId(), weight: 85, reps: 8, completed: false },
                { id: generateId(), weight: 85, reps: 8, completed: false },
              ],
            },
            {
              id: generateId(),
              exerciseId: 'e3',
              exerciseName: 'Deadlift',
              sets: [
                { id: generateId(), weight: 95, reps: 6, completed: false },
                { id: generateId(), weight: 95, reps: 6, completed: false },
                { id: generateId(), weight: 95, reps: 6, completed: false },
              ],
            },
          ],
          createdAt: new Date().toISOString(),
        };
        setWorkouts([sampleWorkout]);
        localStorage.setItem('workouts', JSON.stringify([sampleWorkout]));
      }
    } else {
      setWorkouts([]);
      setActiveWorkout(null);
    }
  }, [user]);

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    if (user && workouts.length > 0) {
      localStorage.setItem('workouts', JSON.stringify(workouts));
    }
  }, [workouts, user]);

  // Get a specific workout
  const getWorkout = (workoutId: string) => {
    return workouts.find(workout => workout.id === workoutId);
  };

  // Add a new workout
  const addWorkout = async (newWorkout: Omit<Workout, 'id' | 'createdAt'>): Promise<Workout> => {
    const workout: Workout = {
      ...newWorkout,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setWorkouts(prev => [...prev, workout]);
    toast.success(`Workout "${workout.name}" created`);
    return workout;
  };

  // Update an existing workout
  const updateWorkout = async (updatedWorkout: Workout): Promise<void> => {
    setWorkouts(prev => 
      prev.map(workout => workout.id === updatedWorkout.id ? updatedWorkout : workout)
    );
    toast.success(`Workout "${updatedWorkout.name}" updated`);
  };

  // Delete a workout
  const deleteWorkout = async (workoutId: string): Promise<void> => {
    const workoutToDelete = workouts.find(w => w.id === workoutId);
    if (workoutToDelete) {
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
      toast.success(`Workout "${workoutToDelete.name}" deleted`);
    }
  };

  // Start a workout session
  const startWorkout = async (workoutId: string): Promise<void> => {
    const workout = getWorkout(workoutId);
    if (!workout) {
      toast.error("Workout not found");
      return;
    }

    // Create a new workout session with fresh sets based on the workout template
    const session: WorkoutSession = {
      id: generateId(),
      workoutId: workout.id,
      startTime: new Date().toISOString(),
      exercises: workout.exercises.map(ex => ({
        ...ex,
        id: generateId(),
        sets: ex.sets.map(set => ({
          ...set,
          id: generateId(),
          completed: false
        }))
      }))
    };

    setActiveWorkout(session);
    toast.success(`Started workout: ${workout.name}`);
  };

  // End the current workout session
  const endWorkout = async (): Promise<void> => {
    if (!activeWorkout) {
      toast.error("No active workout to end");
      return;
    }

    // Update the workout with the latest data
    const workout = getWorkout(activeWorkout.workoutId);
    if (workout) {
      const updatedWorkout: Workout = {
        ...workout,
        lastPerformed: new Date().toISOString(),
        exercises: activeWorkout.exercises
      };
      
      await updateWorkout(updatedWorkout);
    }

    setActiveWorkout(null);
    toast.success("Workout completed");
  };

  // Update an exercise in the current workout
  const updateCurrentWorkoutExercise = async (updatedExercise: WorkoutExercise): Promise<void> => {
    if (!activeWorkout) {
      toast.error("No active workout");
      return;
    }

    setActiveWorkout(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        exercises: prev.exercises.map(ex => 
          ex.id === updatedExercise.id ? updatedExercise : ex
        )
      };
    });
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
      {children}
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
