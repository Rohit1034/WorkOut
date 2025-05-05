
// Types for pose detection
type KeyPoint = {
  name: string;
  x: number;
  y: number;
  score?: number;
};

type Pose = {
  keypoints: KeyPoint[];
};

// Tracking state for exercises
let squatDown = false;
let pullupUp = false;
let skippingUp = false;

// Calculate angle between three points
export const calculateAngle = (
  pointA: KeyPoint | undefined,
  pointB: KeyPoint | undefined, 
  pointC: KeyPoint | undefined
): number => {
  if (!pointA || !pointB || !pointC) return 180;
  
  const angleRadians = Math.atan2(
    pointC.y - pointB.y,
    pointC.x - pointB.x
  ) - Math.atan2(
    pointA.y - pointB.y,
    pointA.x - pointB.x
  );
  
  let angleDegrees = Math.abs(angleRadians * 180 / Math.PI);
  
  // Ensure we get the smaller angle
  if (angleDegrees > 180) {
    angleDegrees = 360 - angleDegrees;
  }
  
  return angleDegrees;
};

// Mock pose for testing (we'll replace this with real ML detection later)
export const generateMockPose = (exerciseType: string): Pose => {
  // Generate random keypoints based on exercise type
  let keypoints: KeyPoint[] = [];
  
  switch (exerciseType) {
    case 'squats':
      // Mock different squat positions for testing
      const isSquatDown = Math.random() > 0.5;
      const hipY = isSquatDown ? 300 : 200;
      const kneeY = isSquatDown ? 350 : 300;
      
      keypoints = [
        { name: 'left_hip', x: 100, y: hipY },
        { name: 'left_knee', x: 100, y: kneeY },
        { name: 'left_ankle', x: 100, y: 400 },
        { name: 'right_hip', x: 140, y: hipY },
        { name: 'right_knee', x: 140, y: kneeY },
        { name: 'right_ankle', x: 140, y: 400 }
      ];
      break;
    
    case 'pullups':
      // Mock pullup positions for testing
      const isPullupUp = Math.random() > 0.5;
      const shoulderY = isPullupUp ? 150 : 200;
      const elbowY = isPullupUp ? 120 : 230;
      
      keypoints = [
        { name: 'left_shoulder', x: 100, y: shoulderY },
        { name: 'left_elbow', x: 120, y: elbowY },
        { name: 'left_wrist', x: 140, y: 100 },
        { name: 'right_shoulder', x: 180, y: shoulderY },
        { name: 'right_elbow', x: 160, y: elbowY },
        { name: 'right_wrist', x: 140, y: 100 }
      ];
      break;
      
    case 'skipping':
      // Mock skipping positions
      const isJumping = Math.random() > 0.5;
      const ankleY = isJumping ? 350 : 400;
      
      keypoints = [
        { name: 'left_ankle', x: 100, y: ankleY },
        { name: 'right_ankle', x: 140, y: ankleY },
        { name: 'left_knee', x: 100, y: ankleY - 100 },
        { name: 'right_knee', x: 140, y: ankleY - 100 }
      ];
      break;
      
    default:
      keypoints = [];
  }
  
  return { keypoints };
};

// Analysis functions for different exercises
export const analyzeSquats = (pose: Pose): boolean => {
  const leftHip = pose.keypoints.find(k => k.name === 'left_hip');
  const leftKnee = pose.keypoints.find(k => k.name === 'left_knee');
  const leftAnkle = pose.keypoints.find(k => k.name === 'left_ankle');
  
  // Calculate angles
  const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
  
  // Detect squat movement pattern
  let repCompleted = false;
  if (angle < 100 && !squatDown) {
    squatDown = true;
  } else if (angle > 160 && squatDown) {
    repCompleted = true;
    squatDown = false;
  }
  
  return repCompleted;
};

export const analyzePullups = (pose: Pose): boolean => {
  const leftShoulder = pose.keypoints.find(k => k.name === 'left_shoulder');
  const leftElbow = pose.keypoints.find(k => k.name === 'left_elbow');
  const leftWrist = pose.keypoints.find(k => k.name === 'left_wrist');
  
  // Calculate angles
  const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  
  // Detect pullup movement pattern
  let repCompleted = false;
  if (angle < 90 && !pullupUp) {
    pullupUp = true;
  } else if (angle > 150 && pullupUp) {
    repCompleted = true;
    pullupUp = false;
  }
  
  return repCompleted;
};

export const analyzeSkipping = (pose: Pose): boolean => {
  const leftAnkle = pose.keypoints.find(k => k.name === 'left_ankle');
  const rightAnkle = pose.keypoints.find(k => k.name === 'right_ankle');
  
  // Simple check for feet position (y coordinate)
  if (!leftAnkle || !rightAnkle) return false;
  
  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  
  // Detect skipping movement pattern
  let repCompleted = false;
  if (avgAnkleY < 370 && !skippingUp) {
    skippingUp = true;
  } else if (avgAnkleY > 390 && skippingUp) {
    repCompleted = true;
    skippingUp = false;
  }
  
  return repCompleted;
};

// Main analysis function that works for all exercise types
export const analyzeExercise = (exerciseType: string, pose: Pose): boolean => {
  switch (exerciseType) {
    case 'squats':
      return analyzeSquats(pose);
    case 'pullups':
      return analyzePullups(pose);
    case 'skipping':
      return analyzeSkipping(pose);
    default:
      return false;
  }
};
