
import React, { useEffect, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useWorkout } from '@/context/WorkoutContext';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const WorkoutCamera: React.FC = () => {
  const { 
    videoRef, 
    isCameraReady, 
    error, 
    startCamera, 
    stopCamera, 
    detectedPose,
    startAnalyzing,
    stopAnalyzing
  } = useCamera();
  
  const { selectedExercise, currentSession, incrementRepetitions } = useWorkout();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (selectedExercise && currentSession) {
      // Start camera immediately when component loads
      startCamera();
    }
    
    return () => {
      stopCamera();
      stopAnalyzing();
    };
  }, [selectedExercise, currentSession]);

  // Start analyzing posture once camera is ready
  useEffect(() => {
    if (isCameraReady && selectedExercise) {
      // Initialize ML model for posture analysis
      console.log('Starting pose analysis for:', selectedExercise.type);
      
      // Start analyzing with the specific exercise type
      startAnalyzing(selectedExercise.type, () => {
        // This callback is called when a repetition is completed
        incrementRepetitions();
      });
    }
    
    return () => {
      stopAnalyzing();
    };
  }, [isCameraReady, selectedExercise]);

  // Draw pose keypoints on canvas
  useEffect(() => {
    if (canvasRef.current && detectedPose) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Clear previous drawings
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw keypoints
        detectedPose.keypoints.forEach((keypoint: any) => {
          if (keypoint.score && keypoint.score < 0.5) return; // Skip low confidence points
          
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'lime';
          ctx.fill();
          
          // Draw keypoint name
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(keypoint.name, keypoint.x + 10, keypoint.y);
        });
        
        // In a real implementation, we'd also draw lines connecting the keypoints
      }
    }
  }, [detectedPose]);

  // Set canvas dimensions to match video
  useEffect(() => {
    if (isCameraReady && videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
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
        Posture analysis in progress - Auto counting reps...
      </div>
    </div>
  );
};

export default WorkoutCamera;
