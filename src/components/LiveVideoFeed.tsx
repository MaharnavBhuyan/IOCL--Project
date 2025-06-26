
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Pause, RotateCcw } from "lucide-react";

interface LiveVideoFeedProps {
  isMonitoring: boolean;
}

const LiveVideoFeed: React.FC<LiveVideoFeedProps> = ({ isMonitoring }) => {
  const videoRef = useRef<HTMLImageElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);

  useEffect(() => {
    if (isMonitoring && videoRef.current) {
      // In a real implementation, this would connect to your FastAPI /live endpoint
      // For demo purposes, we'll simulate a video feed
      videoRef.current.src = "data:image/svg+xml;base64," + btoa(`
        <svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1f2937"/>
          <text x="50%" y="50%" text-anchor="middle" fill="#9CA3AF" font-size="24" font-family="Arial">
            Live Video Feed
          </text>
          <text x="50%" y="60%" text-anchor="middle" fill="#6B7280" font-size="16" font-family="Arial">
            ${isMonitoring ? 'Monitoring Active' : 'Click Start Monitoring'}
          </text>
          <circle cx="320" cy="200" r="5" fill="${isMonitoring ? '#10B981' : '#6B7280'}">
            ${isMonitoring ? '<animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>' : ''}
          </circle>
        </svg>
      `);
      setIsStreaming(true);
    } else {
      setIsStreaming(false);
    }
  }, [isMonitoring]);

  // Simulate detection updates
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setDetectionCount(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

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
              ref={videoRef}
              className="w-full h-full object-cover"
              alt="Live video feed"
            />
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
            {!isMonitoring && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg">Start monitoring to view live feed</p>
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
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Stream
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Connect to FastAPI Backend:</h4>
            <code className="text-sm">
              http://your-fastapi-server:8000/live
            </code>
          </div>
          <p className="text-sm text-gray-600">
            Replace the simulated feed above with a real video stream from your FastAPI backend. 
            The stream endpoint should return multipart/x-mixed-replace content type with JPEG frames.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveVideoFeed;
