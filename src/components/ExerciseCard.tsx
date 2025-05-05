
import React from 'react';
import { Exercise } from '@/types/workout';
import { useWorkout } from '@/context/WorkoutContext';
import { Dumbbell } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const { selectExercise } = useWorkout();
  
  const handleSelectExercise = () => {
    selectExercise(exercise);
  };
  
  return (
    <div 
      className="exercise-card" 
      onClick={handleSelectExercise}
    >
      <Dumbbell className="workout-icon" />
      <p className="exercise-title">{exercise.name}</p>
    </div>
  );
};

export default ExerciseCard;
