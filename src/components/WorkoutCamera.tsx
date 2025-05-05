
import React, { useEffect, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useWorkout } from '@/context/WorkoutContext';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const WorkoutCamera: React.FC = () => {
  const { videoRef, isCameraReady, error, startCamera, stopCamera } = useCamera();
  const { selectedExercise, currentSession } = useWorkout();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (selectedExercise && currentSession) {
      // Start camera immediately when component loads
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [selectedExercise, currentSession]);

  // Prepare for ML posture analysis (placeholder for now)
  useEffect(() => {
    if (isCameraReady && videoRef.current && canvasRef.current) {
      // Here we would initialize the ML model for posture analysis
      // This is just a placeholder for future implementation
      const analyzePosture = () => {
        // This function will be used for posture analysis with ML
        // For now, just logging that frames are being processed
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            // Process video frame
            console.log('Processing frame for posture analysis');
          }
        }
        
        // Continue analyzing frames
        if (isCameraReady) {
          requestAnimationFrame(analyzePosture);
        }
      };
      
      // Start the analysis loop
      analyzePosture();
    }
  }, [isCameraReady]);

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
    <div className="video-container relative">
      <AspectRatio ratio={4/3} className="bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ pointerEvents: 'none' }}
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
      </AspectRatio>
      <div className="mt-2 text-xs text-center text-gray-500">
        Posture analysis in progress...
      </div>
    </div>
  );
};

export default WorkoutCamera;
