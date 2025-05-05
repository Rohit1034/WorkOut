
import React from 'react';
import Header from '@/components/Header';
import ExerciseList from '@/components/ExerciseList';
import { exercises } from '@/data/exercises';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-fitmitra-light">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4 text-fitmitra-dark">Select Your Workout</h2>
        <ExerciseList exercises={exercises} />
      </div>
    </div>
  );
};

export default HomePage;
