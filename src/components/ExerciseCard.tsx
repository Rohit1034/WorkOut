
import React from 'react';
import { Exercise } from '@/types/workout';
import { useWorkout } from '@/context/WorkoutContext';
import { Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const { selectExercise } = useWorkout();
  const navigate = useNavigate();
  
  const handleSelectExercise = () => {
    selectExercise(exercise);
    navigate('/exercise'); // Navigate to the exercise detail page
  };
  
  return (
    <div 
      className="exercise-card bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-fitmitra-accent transition-colors"
      onClick={handleSelectExercise}
    >
      <div className="p-3 bg-fitmitra-accent rounded-full mb-2">
        <Dumbbell className="h-8 w-8 text-fitmitra-primary" />
      </div>
      <p className="exercise-title font-medium text-fitmitra-dark">{exercise.name}</p>
    </div>
  );
};

export default ExerciseCard;
