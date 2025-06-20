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

// Debounce flags to prevent noisy detections
let lastSquatState = false;
let lastPullupState = false;
let lastSkippingState = false;

// Counter for continuous frames detecting the same position
let squatPositionCounter = 0;
let pullupPositionCounter = 0; 
let skippingPositionCounter = 0;

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
  
  // Add randomness but with a bias toward completing reps
  const completionBias = Math.random() > 0.7; // 30% chance of showing completion pose
  
  switch (exerciseType) {
    case 'squats':
      // Make squatDown alternate more predictably for testing
      if (squatDown) {
        // If we're currently in squat down position, show standing up (with some randomness)
        const standingUpChance = completionBias ? 0.8 : 0.4; // Higher chance to stand up if biased
        if (Math.random() < standingUpChance) {
          // Show standing up pose
          keypoints = [
            { name: 'left_hip', x: 100, y: 200, score: 0.9 },
            { name: 'left_knee', x: 100, y: 300, score: 0.9 },
            { name: 'left_ankle', x: 100, y: 400, score: 0.9 },
            { name: 'right_hip', x: 140, y: 200, score: 0.9 },
            { name: 'right_knee', x: 140, y: 300, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 400, score: 0.9 }
          ];
        } else {
          // Still in squat position
          keypoints = [
            { name: 'left_hip', x: 100, y: 300, score: 0.9 },
            { name: 'left_knee', x: 100, y: 350, score: 0.9 },
            { name: 'left_ankle', x: 100, y: 400, score: 0.9 },
            { name: 'right_hip', x: 140, y: 300, score: 0.9 },
            { name: 'right_knee', x: 140, y: 350, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 400, score: 0.9 }
          ];
        }
      } else {
        // If we're standing up, show squatting down (with some randomness)
        const squattingDownChance = completionBias ? 0.7 : 0.3; // Higher chance to squat if biased
        if (Math.random() < squattingDownChance) {
          // Show squatting down pose
          keypoints = [
            { name: 'left_hip', x: 100, y: 300, score: 0.9 },
            { name: 'left_knee', x: 100, y: 350, score: 0.9 },
            { name: 'left_ankle', x: 100, y: 400, score: 0.9 },
            { name: 'right_hip', x: 140, y: 300, score: 0.9 },
            { name: 'right_knee', x: 140, y: 350, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 400, score: 0.9 }
          ];
        } else {
          // Still standing
          keypoints = [
            { name: 'left_hip', x: 100, y: 200, score: 0.9 },
            { name: 'left_knee', x: 100, y: 300, score: 0.9 },
            { name: 'left_ankle', x: 100, y: 400, score: 0.9 },
            { name: 'right_hip', x: 140, y: 200, score: 0.9 },
            { name: 'right_knee', x: 140, y: 300, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 400, score: 0.9 }
          ];
        }
      }
      break;
    
    case 'pullups':
      // Make pullupUp alternate more predictably for testing
      if (pullupUp) {
        // If we're currently pulled up, show coming down (with some randomness)
        const comingDownChance = completionBias ? 0.8 : 0.4; 
        if (Math.random() < comingDownChance) {
          // Show arms extended pose
          keypoints = [
            { name: 'left_shoulder', x: 100, y: 200, score: 0.9 },
            { name: 'left_elbow', x: 120, y: 230, score: 0.9 },
            { name: 'left_wrist', x: 140, y: 100, score: 0.9 },
            { name: 'right_shoulder', x: 180, y: 200, score: 0.9 },
            { name: 'right_elbow', x: 160, y: 230, score: 0.9 },
            { name: 'right_wrist', x: 140, y: 100, score: 0.9 }
          ];
        } else {
          // Still in pull up position
          keypoints = [
            { name: 'left_shoulder', x: 100, y: 150, score: 0.9 },
            { name: 'left_elbow', x: 120, y: 120, score: 0.9 },
            { name: 'left_wrist', x: 140, y: 100, score: 0.9 },
            { name: 'right_shoulder', x: 180, y: 150, score: 0.9 },
            { name: 'right_elbow', x: 160, y: 120, score: 0.9 },
            { name: 'right_wrist', x: 140, y: 100, score: 0.9 }
          ];
        }
      } else {
        // If we're hanging, show pulling up (with some randomness)
        const pullingUpChance = completionBias ? 0.7 : 0.3;
        if (Math.random() < pullingUpChance) {
          // Show pulled up pose
          keypoints = [
            { name: 'left_shoulder', x: 100, y: 150, score: 0.9 },
            { name: 'left_elbow', x: 120, y: 120, score: 0.9 },
            { name: 'left_wrist', x: 140, y: 100, score: 0.9 },
            { name: 'right_shoulder', x: 180, y: 150, score: 0.9 },
            { name: 'right_elbow', x: 160, y: 120, score: 0.9 },
            { name: 'right_wrist', x: 140, y: 100, score: 0.9 }
          ];
        } else {
          // Still hanging
          keypoints = [
            { name: 'left_shoulder', x: 100, y: 200, score: 0.9 },
            { name: 'left_elbow', x: 120, y: 230, score: 0.9 },
            { name: 'left_wrist', x: 140, y: 100, score: 0.9 },
            { name: 'right_shoulder', x: 180, y: 200, score: 0.9 },
            { name: 'right_elbow', x: 160, y: 230, score: 0.9 },
            { name: 'right_wrist', x: 140, y: 100, score: 0.9 }
          ];
        }
      }
      break;
      
    case 'skipping':
      // Make skipping alternate more predictably for testing
      if (skippingUp) {
        // If we're currently in the air, show landing (with some randomness)
        const landingChance = completionBias ? 0.8 : 0.4;
        if (Math.random() < landingChance) {
          // Show feet on ground
          keypoints = [
            { name: 'left_ankle', x: 100, y: 400, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 400, score: 0.9 },
            { name: 'left_knee', x: 100, y: 300, score: 0.9 },
            { name: 'right_knee', x: 140, y: 300, score: 0.9 }
          ];
        } else {
          // Still in the air
          keypoints = [
            { name: 'left_ankle', x: 100, y: 350, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 350, score: 0.9 },
            { name: 'left_knee', x: 100, y: 250, score: 0.9 },
            { name: 'right_knee', x: 140, y: 250, score: 0.9 }
          ];
        }
      } else {
        // If we're on the ground, show jumping (with some randomness)
        const jumpingChance = completionBias ? 0.7 : 0.3;
        if (Math.random() < jumpingChance) {
          // Show feet in air
          keypoints = [
            { name: 'left_ankle', x: 100, y: 350, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 350, score: 0.9 },
            { name: 'left_knee', x: 100, y: 250, score: 0.9 },
            { name: 'right_knee', x: 140, y: 250, score: 0.9 }
          ];
        } else {
          // Still on ground
          keypoints = [
            { name: 'left_ankle', x: 100, y: 400, score: 0.9 },
            { name: 'right_ankle', x: 140, y: 400, score: 0.9 },
            { name: 'left_knee', x: 100, y: 300, score: 0.9 },
            { name: 'right_knee', x: 140, y: 300, score: 0.9 }
          ];
        }
      }
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
  
  // Detect squat movement pattern with debouncing
  const currentSquatDown = angle < 120;
  
  // Increment position counter if stable, reset otherwise
  if (currentSquatDown === lastSquatState) {
    squatPositionCounter++;
  } else {
    squatPositionCounter = 0;
    lastSquatState = currentSquatDown;
  }
  
  // Only register position after a few stable frames
  const STABLE_FRAMES = 3;
  if (squatPositionCounter >= STABLE_FRAMES) {
    let repCompleted = false;
    
    if (currentSquatDown && !squatDown) {
      squatDown = true;
    } else if (!currentSquatDown && squatDown) {
      repCompleted = true;
      squatDown = false;
    }
    
    return repCompleted;
  }
  
  return false;
};

export const analyzePullups = (pose: Pose): boolean => {
  const leftShoulder = pose.keypoints.find(k => k.name === 'left_shoulder');
  const leftElbow = pose.keypoints.find(k => k.name === 'left_elbow');
  const leftWrist = pose.keypoints.find(k => k.name === 'left_wrist');
  
  // Calculate angles
  const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  
  // Detect pullup movement pattern with debouncing
  const currentPullupUp = angle < 130;
  
  // Increment position counter if stable, reset otherwise
  if (currentPullupUp === lastPullupState) {
    pullupPositionCounter++;
  } else {
    pullupPositionCounter = 0;
    lastPullupState = currentPullupUp;
  }
  
  // Only register position after a few stable frames
  const STABLE_FRAMES = 3;
  if (pullupPositionCounter >= STABLE_FRAMES) {
    let repCompleted = false;
    
    if (currentPullupUp && !pullupUp) {
      pullupUp = true;
    } else if (!currentPullupUp && pullupUp) {
      repCompleted = true;
      pullupUp = false;
    }
    
    return repCompleted;
  }
  
  return false;
};

export const analyzeSkipping = (pose: Pose, canvasHeight?: number): boolean => {
  const leftAnkle = pose.keypoints.find(k => k.name === 'left_ankle' && (k.score ?? 0) > 0.5);
  const rightAnkle = pose.keypoints.find(k => k.name === 'right_ankle' && (k.score ?? 0) > 0.5);
  if (!leftAnkle || !rightAnkle) return false;

  // Use dynamic threshold: feet are up if avg y is less than 70% of canvas height
  const height = canvasHeight || 480; // fallback to 480 if not provided
  const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const threshold = height * 0.7;
  const currentSkippingUp = avgAnkleY < threshold;

  if (currentSkippingUp === lastSkippingState) {
    skippingPositionCounter++;
  } else {
    skippingPositionCounter = 0;
    lastSkippingState = currentSkippingUp;
  }

  const STABLE_FRAMES = 3;
  if (skippingPositionCounter >= STABLE_FRAMES) {
    let repCompleted = false;
    if (currentSkippingUp && !skippingUp) {
      skippingUp = true;
    } else if (!currentSkippingUp && skippingUp) {
      repCompleted = true;
      skippingUp = false;
    }
    return repCompleted;
  }
  return false;
};

// Main analysis function that works for all exercise types
export const analyzeExercise = (exerciseType: string, pose: Pose, canvasHeight?: number): boolean => {
  switch (exerciseType) {
    case 'squats':
      return analyzeSquats(pose);
    case 'pullups':
      return analyzePullups(pose);
    case 'skipping':
      return analyzeSkipping(pose, canvasHeight);
    default:
      return false;
  }
};
