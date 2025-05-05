
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkout } from '@/context/WorkoutContext';
import { useNavigate } from 'react-router-dom';

const WorkoutSummary: React.FC = () => {
  const { workoutHistory, clearSelectedExercise } = useWorkout();
  const navigate = useNavigate();
  
  const latestWorkout = workoutHistory.length > 0 ? workoutHistory[workoutHistory.length - 1] : null;
  
  const handleGoHome = () => {
    clearSelectedExercise();
    navigate('/');
  };
  
  // Use useEffect to navigate if no workout exists, instead of returning from the function
  useEffect(() => {
    if (!latestWorkout) {
      handleGoHome();
    }
  }, [latestWorkout]);
  
  // If no workout found, render a loading state until navigation happens
  if (!latestWorkout) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes > 0 ? `${minutes}m ` : ''}${remainingSeconds}s`;
  };

  const getExerciseName = (type: string) => {
    switch (type) {
      case 'pullups': return 'Pull-ups';
      case 'skipping': return 'Skipping';
      case 'squats': return 'Squats';
      default: return type;
    }
  };
  
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-bold text-center mb-4 text-fitmitra-dark">Workout Summary</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-fitmitra-accent rounded-lg">
            <p className="font-medium">Exercise:</p>
            <p className="font-bold text-fitmitra-primary">{getExerciseName(latestWorkout.exerciseType)}</p>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-fitmitra-accent rounded-lg">
            <p className="font-medium">Repetitions:</p>
            <p className="font-bold text-fitmitra-primary">{latestWorkout.repetitions}</p>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-fitmitra-accent rounded-lg">
            <p className="font-medium">Duration:</p>
            <p className="font-bold text-fitmitra-primary">{formatDuration(latestWorkout.duration)}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            onClick={handleGoHome}
            className="w-full bg-fitmitra-primary hover:bg-fitmitra-secondary"
          >
            Back to Exercises
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummary;
