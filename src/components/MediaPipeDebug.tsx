import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MediaPipeDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testMediaPipeFiles = async () => {
    setIsLoading(true);
    const results: any[] = [];
    
    const files = [
      '/mediapipe/pose_solution_wasm_bin.js',
      '/mediapipe/pose_solution_wasm_bin.wasm',
      '/mediapipe/pose_solution_simd_wasm_bin.js',
      '/mediapipe/pose_solution_simd_wasm_bin.wasm',
      '/mediapipe/pose_landmark_lite.tflite',
      '/mediapipe/pose_landmark_full.tflite',
      '/mediapipe/pose_web.binarypb',
      '/mediapipe/pose_solution_packed_assets.data'
    ];

    for (const file of files) {
      try {
        const response = await fetch(file, { method: 'HEAD' });
        results.push({
          file,
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        });
      } catch (error) {
        results.push({
          file,
          status: 'ERROR',
          ok: false,
          error: error.message
        });
      }
    }

    // Test MediaPipe import
    try {
      const poseModule = await import('@mediapipe/pose');
      results.push({
        file: 'MediaPipe Import',
        status: 'SUCCESS',
        ok: true,
        hasPose: !!poseModule.Pose,
        version: poseModule.VERSION
      });
    } catch (error) {
      results.push({
        file: 'MediaPipe Import',
        status: 'ERROR',
        ok: false,
        error: error.message
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const testMediaPipeInitialization = async () => {
    setIsLoading(true);
    const results: any[] = [];

    try {
      const poseModule = await import('@mediapipe/pose');
      const MediaPipePose = poseModule.Pose;
      
      const pose = new MediaPipePose({
        locateFile: (file: string) => {
          const filePath = `/mediapipe/${file}`;
          console.log(`Requesting: ${file} -> ${filePath}`);
          return filePath;
        }
      });

      await pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      results.push({
        file: 'MediaPipe Initialization',
        status: 'SUCCESS',
        ok: true,
        message: 'MediaPipe initialized successfully'
      });

      pose.close();
    } catch (error) {
      results.push({
        file: 'MediaPipe Initialization',
        status: 'ERROR',
        ok: false,
        error: error.message,
        stack: error.stack
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    testMediaPipeFiles();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>MediaPipe Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testMediaPipeFiles} disabled={isLoading}>
              Test File Accessibility
            </Button>
            <Button onClick={testMediaPipeInitialization} disabled={isLoading}>
              Test MediaPipe Initialization
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Testing...</p>
            </div>
          )}

          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.ok 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="font-mono text-sm">
                  <div className="font-semibold">{result.file}</div>
                  <div className="text-xs mt-1">
                    Status: {result.status}
                    {result.contentType && ` | Type: ${result.contentType}`}
                    {result.contentLength && ` | Size: ${result.contentLength}`}
                    {result.hasPose && ` | Has Pose: ${result.hasPose}`}
                    {result.version && ` | Version: ${result.version}`}
                  </div>
                  {result.error && (
                    <div className="text-red-600 text-xs mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  {result.message && (
                    <div className="text-green-600 text-xs mt-1">
                      {result.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded border">
            <h3 className="font-semibold mb-2">Browser Information</h3>
            <div className="text-sm space-y-1">
              <div>User Agent: {navigator.userAgent}</div>
              <div>Platform: {navigator.platform}</div>
              <div>WebAssembly: {typeof WebAssembly !== 'undefined' ? 'Supported' : 'Not Supported'}</div>
              <div>SharedArrayBuffer: {typeof SharedArrayBuffer !== 'undefined' ? 'Supported' : 'Not Supported'}</div>
              <div>Cross-Origin Isolation: {crossOriginIsolated ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaPipeDebug; 