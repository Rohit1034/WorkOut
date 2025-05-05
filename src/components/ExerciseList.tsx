
import React from 'react';
import { Exercise } from '@/types/workout';
import ExerciseCard from './ExerciseCard';

interface ExerciseListProps {
  exercises: Exercise[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

export default ExerciseList;
