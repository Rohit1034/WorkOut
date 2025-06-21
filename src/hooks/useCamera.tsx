import { useState, useEffect, useRef } from 'react';
import { generateMockPose, analyzeExercise } from '@/utils/poseAnalysis';
import { POSE_LANDMARKS, Results, NormalizedLandmark } from '@mediapipe/pose';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraResolution, setCameraResolution] = useState({ width: 640, height: 480 }); // 4:3 ratio
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedPose, setDetectedPose] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const analyzeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRepTimeRef = useRef<number>(Date.now());
  const poseRef = useRef<any>(null);
  const isAnalyzingRef = useRef(false);

  // Correct keypoint names for MediaPipe Pose
  const keypointNames = [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer',
    'left_ear', 'right_ear', 'mouth_left', 'mouth_right', 'left_shoulder', 'right_shoulder',
    'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
    'left_index', 'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
    'left_foot_index', 'right_foot_index'
  ];

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
  
  // Helper to map MediaPipe keypoints to app format
  const mapMediaPipeKeypoints = (landmarks: NormalizedLandmark[] | undefined): any[] => {
    if (!landmarks) return [];
    return keypointNames.map((name, idx) => {
      const lm = landmarks[idx];
      return {
        name,
        x: lm ? lm.x * cameraResolution.width : 0,
        y: lm ? lm.y * cameraResolution.height : 0,
        score: lm ? lm.visibility : 0
      };
    });
  };

  // Initialize MediaPipe Pose model
  const initializeMediaPipe = async (): Promise<boolean> => {
    try {
      setIsModelLoading(true);
      console.log('Initializing MediaPipe Pose model...');
      
      const poseModule = await import('@mediapipe/pose');
      const MediaPipePose = poseModule.Pose;
      
      poseRef.current = new MediaPipePose({
        locateFile: (file: string) => {
          // Use local MediaPipe files from public directory
          return `/mediapipe/${file}`;
        }
      });
      
      await poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      console.log('MediaPipe Pose model loaded successfully');
      setIsModelLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      setIsModelLoading(false);
      console.log('Falling back to mock pose detection');
      setUseFallbackMode(true);
      return false;
    }
  };

  // Fallback pose detection using mock data
  const startFallbackAnalysis = (exerciseType: string, onRepComplete: () => void) => {
    console.log('Using fallback pose detection for:', exerciseType);
    
    const interval = setInterval(() => {
      if (!isAnalyzingRef.current) {
        clearInterval(interval);
        return;
      }
      
      // Generate mock pose data
      const mockPose = generateMockPose(exerciseType);
      setDetectedPose(mockPose);
      
      // Analyze exercise and check if rep is completed
      const currentTime = Date.now();
      if (currentTime - lastRepTimeRef.current >= 1000) {
        const isRepCompleted = analyzeExercise(exerciseType, mockPose, cameraResolution.height);
        if (isRepCompleted) {
          lastRepTimeRef.current = currentTime;
          onRepComplete();
        }
      }
    }, 100); // Update every 100ms for smooth animation
    
    analyzeIntervalRef.current = interval;
  };

  // Start analyzing exercise movements
  const startAnalyzing = async (exerciseType: string, onRepComplete: () => void) => {
    if (isAnalyzingRef.current) return;
    
    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    console.log(`Starting pose analysis for: ${exerciseType}`);

    // If we're already in fallback mode, use that
    if (useFallbackMode) {
      startFallbackAnalysis(exerciseType, onRepComplete);
      return;
    }

    // Initialize MediaPipe if not already done
    if (!poseRef.current) {
      const success = await initializeMediaPipe();
      if (!success) {
        // If MediaPipe failed, start fallback mode
        startFallbackAnalysis(exerciseType, onRepComplete);
        return;
      }
    }

    // Set up results handler
    poseRef.current.onResults((results: Results) => {
      if (results.poseLandmarks) {
        const keypoints = mapMediaPipeKeypoints(results.poseLandmarks);
        const pose = { keypoints };
        setDetectedPose(pose);
        
        // Analyze exercise and check if rep is completed
        const currentTime = Date.now();
        if (currentTime - lastRepTimeRef.current >= 1000) {
          const isRepCompleted = analyzeExercise(exerciseType, pose, cameraResolution.height);
          if (isRepCompleted) {
            lastRepTimeRef.current = currentTime;
            onRepComplete();
          }
        }
      }
    });

    // Start processing video frames
    const processFrame = async () => {
      if (videoRef.current && poseRef.current && isCameraReady && isAnalyzingRef.current) {
        try {
          await poseRef.current.send({ image: videoRef.current });
        } catch (error) {
          console.error('Error processing frame:', error);
          // If MediaPipe fails during processing, switch to fallback
          if (!useFallbackMode) {
            setUseFallbackMode(true);
            startFallbackAnalysis(exerciseType, onRepComplete);
          }
        }
      }
      if (isAnalyzingRef.current) {
        requestAnimationFrame(processFrame);
      }
    };
    processFrame();
  };
  
  const stopAnalyzing = () => {
    isAnalyzingRef.current = false;
    setIsAnalyzing(false);
    setDetectedPose(null);
    
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
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
    isModelLoading,
    useFallbackMode,
    startAnalyzing,
    stopAnalyzing
  };
};
