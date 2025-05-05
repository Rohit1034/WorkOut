
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWorkout } from '@/context/WorkoutContext';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'FitMitra', 
  showBackButton = false, 
  onBackClick 
}) => {
  const { clearSelectedExercise } = useWorkout();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      clearSelectedExercise();
    }
  };
  
  return (
    <header className="px-4 py-4 flex items-center justify-between bg-gradient-to-r from-fitmitra-primary to-fitmitra-secondary text-white">
      <div className="flex items-center">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackClick}
            className="mr-2 text-white hover:text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
    </header>
  );
};

export default Header;
