
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import WorkoutCamera from '@/components/WorkoutCamera';
import WorkoutControls from '@/components/WorkoutControls';
import { useWorkout } from '@/context/WorkoutContext';
import { useNavigate } from 'react-router-dom';

const WorkoutPage: React.FC = () => {
  const { selectedExercise, currentSession } = useWorkout();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!selectedExercise || !currentSession) {
      navigate('/');
    }
  }, [selectedExercise, currentSession]);
  
  if (!selectedExercise || !currentSession) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-fitmitra-light">
      <Header 
        showBackButton 
        title={`${selectedExercise.name} Workout`} 
        onBackClick={() => navigate('/exercise')}
      />
      
      <div className="container mx-auto px-4 py-4 space-y-4">
        <WorkoutCamera />
        <WorkoutControls />
      </div>
    </div>
  );
};

export default WorkoutPage;
