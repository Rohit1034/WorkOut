
export type ExerciseType = 'pullups' | 'skipping' | 'squats';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  iconName: string;
  description: string;
}

export interface WorkoutSession {
  exerciseType: ExerciseType;
  startTime: Date;
  endTime?: Date;
  repetitions: number;
  duration: number; // in seconds
  completed: boolean;
}
