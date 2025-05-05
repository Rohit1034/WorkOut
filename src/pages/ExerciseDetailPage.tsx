
import React from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useWorkout } from '@/context/WorkoutContext';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

const ExerciseDetailPage: React.FC = () => {
  const { selectedExercise, startWorkout } = useWorkout();
  const navigate = useNavigate();
  
  if (!selectedExercise) {
    navigate('/');
    return null;
  }
  
  const handleStartWorkout = () => {
    startWorkout();
    navigate('/workout');
  };
  
  return (
    <div className="min-h-screen bg-fitmitra-light">
      <Header showBackButton title={selectedExercise.name} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="p-4 bg-fitmitra-accent rounded-full">
              <Dumbbell className="h-12 w-12 text-fitmitra-primary" />
            </div>
            <h2 className="text-2xl font-bold mt-4 text-center">{selectedExercise.name}</h2>
          </div>
          
          <p className="text-gray-600 mb-6">{selectedExercise.description}</p>
          
          <div className="bg-fitmitra-accent p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Instructions:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Position yourself in front of the camera</li>
              <li>Make sure your full body is visible</li>
              <li>The app will automatically count your reps</li>
              <li>You can also manually count reps if needed</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleStartWorkout}
            className="w-full bg-fitmitra-primary hover:bg-fitmitra-secondary"
          >
            Start Workout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;
