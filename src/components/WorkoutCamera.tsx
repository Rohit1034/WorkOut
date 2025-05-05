
import React, { useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useWorkout } from '@/context/WorkoutContext';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const WorkoutCamera: React.FC = () => {
  const { videoRef, isCameraReady, error, startCamera, stopCamera } = useCamera();
  const { selectedExercise, currentSession } = useWorkout();

  useEffect(() => {
    if (selectedExercise && currentSession) {
      // Start camera immediately when component loads
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [selectedExercise, currentSession]);

  if (!selectedExercise || !currentSession) {
    return null;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-center">
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={startCamera}
          className="mt-2 bg-fitmitra-primary hover:bg-fitmitra-secondary"
        >
          <Camera className="mr-2 h-4 w-4" />
          Retry Camera Access
        </Button>
      </div>
    );
  }

  return (
    <div className="video-container aspect-video relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg h-full w-full object-cover"
      />
      {!isCameraReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white rounded-lg">
          <div className="text-center">
            <div className="animate-pulse mb-2">
              <Camera className="h-10 w-10 mx-auto" />
            </div>
            <p>Loading camera...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCamera;
