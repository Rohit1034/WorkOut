
import React, { createContext, useState, useContext } from 'react';
import { Exercise, WorkoutSession, ExerciseType } from '@/types/workout';

interface WorkoutContextType {
  selectedExercise: Exercise | null;
  workoutHistory: WorkoutSession[];
  currentSession: WorkoutSession | null;
  selectExercise: (exercise: Exercise) => void;
  startWorkout: () => void;
  endWorkout: () => void;
  incrementRepetitions: () => void;
  clearSelectedExercise: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);

  const selectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const clearSelectedExercise = () => {
    setSelectedExercise(null);
  };

  const startWorkout = () => {
    if (!selectedExercise) return;
    
    const newSession: WorkoutSession = {
      exerciseType: selectedExercise.type,
      startTime: new Date(),
      repetitions: 0,
      duration: 0,
      completed: false,
    };
    
    setCurrentSession(newSession);
  };

  const endWorkout = () => {
    if (currentSession) {
      const completedSession: WorkoutSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
        duration: Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000),
      };
      
      setWorkoutHistory([...workoutHistory, completedSession]);
      setCurrentSession(null);
    }
  };

  const incrementRepetitions = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        repetitions: currentSession.repetitions + 1,
      });
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        selectedExercise,
        workoutHistory,
        currentSession,
        selectExercise,
        startWorkout,
        endWorkout,
        incrementRepetitions,
        clearSelectedExercise,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
