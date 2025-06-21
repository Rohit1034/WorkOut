import { useState, useEffect, useRef } from 'react';
import { generateMockPose, analyzeExercise } from '@/utils/poseAnalysis';
import { POSE_LANDMARKS, Results, NormalizedLandmark } from '@mediapipe/pose';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isMediaPipeReady, setIsMediaPipeReady] = useState(false);
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

  // Initialize MediaPipe Pose model FIRST
  const initializeMediaPipe = async (): Promise<boolean> => {
    try {
      setIsModelLoading(true);
      console.log('🔄 STEP 1: Initializing MediaPipe Pose model...');
      
      // Test if MediaPipe files are accessible
      const testFiles = [
        '/mediapipe/pose_solution_wasm_bin.js',
        '/mediapipe/pose_solution_wasm_bin.wasm',
        '/mediapipe/pose_landmark_lite.tflite'
      ];
      
      console.log('🔄 STEP 1.1: Testing file accessibility...');
      for (const file of testFiles) {
        try {
          const response = await fetch(file, { method: 'HEAD' });
          if (!response.ok) {
            console.error(`❌ MediaPipe file not accessible: ${file} (${response.status})`);
          } else {
            console.log(`✅ MediaPipe file accessible: ${file}`);
          }
        } catch (error) {
          console.error(`❌ Error checking MediaPipe file ${file}:`, error);
        }
      }
      
      console.log('🔄 STEP 1.2: Checking for global MediaPipe Pose...');
      // @ts-ignore
      const MediaPipePose = window.Pose;

      if (typeof MediaPipePose !== 'function') {
        throw new Error('Failed to find Pose constructor on window object. Check if pose.js is loaded.');
      }
      console.log('✅ Found MediaPipePose constructor on window object');
      
      console.log('🔄 STEP 1.3: Creating MediaPipe instance...');
      poseRef.current = new MediaPipePose({
        locateFile: (file: string) => {
          const filePath = `/mediapipe/${file}`;
          console.log(`📁 MediaPipe requesting file: ${file} -> ${filePath}`);
          return filePath;
        }
      });
      
      console.log('✅ MediaPipePose instance created');
      
      console.log('🔄 STEP 1.4: Setting MediaPipe options...');
      await poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      console.log('✅ MediaPipe Pose model loaded successfully');
      setIsModelLoading(false);
      setIsMediaPipeReady(true);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize MediaPipe:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setIsModelLoading(false);
      console.log('🔄 Falling back to mock pose detection');
      setUseFallbackMode(true);
      setIsMediaPipeReady(true); // Mark as ready so we can proceed with fallback
      return false;
    }
  };

  // Start camera ONLY after MediaPipe is ready
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        return;
      }
      
      console.log('🔄 STEP 2: Starting camera...');
      
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
          console.log('✅ Camera ready');
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
      console.error('❌ Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  // Initialize everything in the correct order
  const initializeEverything = async () => {
    console.log('🚀 Starting initialization sequence...');
    
    // Step 1: Load MediaPipe first
    const mediaPipeSuccess = await initializeMediaPipe();
    
    if (mediaPipeSuccess) {
      console.log('✅ MediaPipe loaded successfully, proceeding to camera');
      // Step 2: Start camera only after MediaPipe is ready
      await startCamera();
    } else {
      console.log('⚠️ MediaPipe failed, but proceeding with fallback mode');
      // Still start camera for fallback mode
      await startCamera();
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

  // Fallback pose detection using mock data
  const startFallbackAnalysis = (exerciseType: string, onRepComplete: () => void) => {
    console.log('🎭 Using fallback pose detection for:', exerciseType);
    
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
    
    console.log('🔄 STEP 3: Starting pose analysis for:', exerciseType);
    isAnalyzingRef.current = true;
    setIsAnalyzing(true);

    // If we're already in fallback mode, use that
    if (useFallbackMode) {
      startFallbackAnalysis(exerciseType, onRepComplete);
      return;
    }

    // MediaPipe should already be initialized at this point
    if (!poseRef.current) {
      console.error('❌ MediaPipe not initialized, switching to fallback');
      setUseFallbackMode(true);
      startFallbackAnalysis(exerciseType, onRepComplete);
      return;
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
          console.error('❌ Error processing frame:', error);
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
    isMediaPipeReady,
    error,
    initializeEverything,
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
