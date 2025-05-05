
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkout } from '@/context/WorkoutContext';
import { useTimer } from '@/hooks/useTimer';
import { ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WorkoutControls: React.FC = () => {
  const { selectedExercise, currentSession, incrementRepetitions, endWorkout } = useWorkout();
  const { seconds, isRunning, startTimer, pauseTimer, formatTime } = useTimer();
  const { toast } = useToast();
  const [isWorkoutEnded, setIsWorkoutEnded] = useState(false);
  
  useEffect(() => {
    if (currentSession && !isRunning) {
      startTimer();
    }
  }, [currentSession, isRunning]);
  
  const handleAddRep = () => {
    incrementRepetitions();
    toast({
      title: "Rep counted!",
      description: currentSession ? `Total: ${currentSession.repetitions + 1}` : "",
      duration: 1000,
    });
  };
  
  const handleEndWorkout = () => {
    pauseTimer();
    endWorkout();
    setIsWorkoutEnded(true);
  };
  
  if (!selectedExercise || !currentSession) {
    return null;
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Time</p>
          <p className="text-2xl font-bold text-fitmitra-dark">{formatTime()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Reps</p>
          <p className="text-2xl font-bold text-fitmitra-primary">{currentSession.repetitions}</p>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button 
          onClick={handleAddRep}
          className="flex-1 bg-fitmitra-primary hover:bg-fitmitra-secondary h-16"
        >
          <ArrowUp className="mr-2 h-5 w-5" />
          Count Rep
        </Button>
        
        <Button 
          onClick={handleEndWorkout}
          variant="outline"
          className="flex-1 border-fitmitra-primary text-fitmitra-primary hover:bg-fitmitra-accent h-16"
        >
          End Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutControls;
