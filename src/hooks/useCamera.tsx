
import { useState, useEffect, useRef } from 'react';
import { generateMockPose, analyzeExercise } from '@/utils/poseAnalysis';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraResolution, setCameraResolution] = useState({ width: 640, height: 480 }); // 4:3 ratio
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedPose, setDetectedPose] = useState<any>(null);
  const analyzeIntervalRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        return;
      }
      
      const constraints = {
        video: { 
          facingMode: 'user',
          width: { ideal: cameraResolution.width },
          height: { ideal: cameraResolution.height },
          aspectRatio: { ideal: 4/3 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
          
          // Update the actual resolution we got
          if (videoRef.current) {
            setCameraResolution({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            });
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraReady(false);
    }
    
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
      setIsAnalyzing(false);
    }
  };

  // Capture a frame from the video
  const captureFrame = () => {
    if (!videoRef.current || !isCameraReady) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };
  
  // Start analyzing exercise movements
  const startAnalyzing = (exerciseType: string, onRepComplete: () => void) => {
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
    }
    
    setIsAnalyzing(true);
    
    // In real implementation, this would analyze video frames
    // For now, we'll use mock data to simulate pose detection
    analyzeIntervalRef.current = window.setInterval(() => {
      // Generate mock pose data
      const pose = generateMockPose(exerciseType);
      setDetectedPose(pose);
      
      // Analyze exercise and check if rep is completed
      const isRepCompleted = analyzeExercise(exerciseType, pose);
      
      if (isRepCompleted) {
        // Call callback function when rep is completed
        onRepComplete();
      }
    }, 500); // Check every 500ms
  };
  
  const stopAnalyzing = () => {
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
      setIsAnalyzing(false);
      setDetectedPose(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopAnalyzing();
    };
  }, []);

  return {
    videoRef,
    isCameraReady,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    cameraResolution,
    detectedPose,
    isAnalyzing,
    startAnalyzing,
    stopAnalyzing
  };
};
