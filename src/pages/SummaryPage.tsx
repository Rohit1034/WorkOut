
import React from 'react';
import Header from '@/components/Header';
import WorkoutSummary from '@/components/WorkoutSummary';

const SummaryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-fitmitra-light">
      <Header title="Workout Summary" />
      <WorkoutSummary />
    </div>
  );
};

export default SummaryPage;
