
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Pause, RotateCcw } from "lucide-react";

interface LiveVideoFeedProps {
  isMonitoring: boolean;
}

const LiveVideoFeed: React.FC<LiveVideoFeedProps> = ({ isMonitoring }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [streamUrl] = useState('http://localhost:8000/live'); // Your FastAPI endpoint

  useEffect(() => {
    if (isMonitoring && imgRef.current) {
      // Connect to FastAPI live stream
      imgRef.current.src = streamUrl;
      imgRef.current.onload = () => {
        setIsStreaming(true);
        console.log('Live stream connected successfully');
      };
      imgRef.current.onerror = () => {
        setIsStreaming(false);
        console.error('Failed to connect to live stream. Make sure FastAPI server is running on http://localhost:8000');
      };
    } else {
      setIsStreaming(false);
      if (imgRef.current) {
        imgRef.current.src = '';
      }
    }
  }, [isMonitoring, streamUrl]);

  // Simulate detection updates when streaming
  useEffect(() => {
    if (isMonitoring && isStreaming) {
      const interval = setInterval(() => {
        setDetectionCount(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, isStreaming]);

  const handleResetStream = () => {
    if (imgRef.current) {
      imgRef.current.src = '';
      setTimeout(() => {
        if (imgRef.current && isMonitoring) {
          imgRef.current.src = streamUrl;
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Live Video Stream
              </CardTitle>
              <CardDescription>
                Real-time PPE detection from camera feed
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isStreaming ? "default" : "secondary"}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                {isStreaming ? "Streaming" : "Offline"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <img
              ref={imgRef}
              className="w-full h-full object-cover"
              alt="Live video feed"
              style={{ display: isStreaming ? 'block' : 'none' }}
            />
            {!isStreaming && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg">
                    {isMonitoring ? 'Connecting to webcam...' : 'Start monitoring to view live feed'}
                  </p>
                  {isMonitoring && (
                    <p className="text-sm mt-2 opacity-75">
                      Make sure FastAPI server is running on localhost:8000
                    </p>
                  )}
                </div>
              </div>
            )}
            {isStreaming && (
              <div className="absolute top-4 left-4 space-y-2">
                <Badge className="bg-red-500/90 text-white">
                  ● REC
                </Badge>
                <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-blue-600 font-medium">Objects Detected</p>
                <p className="text-2xl font-bold text-blue-700">{detectionCount}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-green-600 font-medium">Frame Rate</p>
                <p className="text-2xl font-bold text-green-700">{isStreaming ? '30 FPS' : '0 FPS'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-purple-600 font-medium">Resolution</p>
                <p className="text-2xl font-bold text-purple-700">1080p</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleResetStream}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Stream
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">FastAPI Endpoint:</h4>
            <code className="text-sm">
              {streamUrl}
            </code>
          </div>
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>To see the webcam feed:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make sure your FastAPI server is running with: <code>python your_script.py</code></li>
              <li>Ensure your webcam is connected and accessible</li>
              <li>Click "Start Monitoring" above</li>
              <li>The live feed will appear once connected</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveVideoFeed;
