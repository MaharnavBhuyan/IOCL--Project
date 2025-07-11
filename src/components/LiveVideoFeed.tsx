
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Pause, RotateCcw, AlertCircle, Flame, Volume2 } from "lucide-react";

interface LiveVideoFeedProps {
  isMonitoring: boolean;
}

const LiveVideoFeed: React.FC<LiveVideoFeedProps> = ({ isMonitoring }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [fireDetections, setFireDetections] = useState(0);
  const [ppeDetections, setPpeDetections] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [streamUrl] = useState('http://localhost:8000/live');
  const [lastDetectionTime, setLastDetectionTime] = useState<string>('');

  useEffect(() => {
    if (isMonitoring && imgRef.current) {
      console.log('Connecting to enhanced Fire/Smoke & PPE detection stream...');
      setConnectionError(null);
      
      imgRef.current.src = streamUrl;
      
      imgRef.current.onload = () => {
        setIsStreaming(true);
        setConnectionError(null);
        console.log('Live detection stream connected successfully');
      };
      
      imgRef.current.onerror = (error) => {
        setIsStreaming(false);
        const errorMsg = 'Failed to connect to FastAPI server. Make sure it\'s running with both fire and PPE models loaded.';
        setConnectionError(errorMsg);
        console.error(errorMsg, error);
      };

      const timeout = setTimeout(() => {
        if (!isStreaming) {
          setConnectionError('Connection timeout. Please ensure your enhanced FastAPI server is running with both models.');
        }
      }, 5000);

      return () => clearTimeout(timeout);
    } else {
      setIsStreaming(false);
      setConnectionError(null);
      if (imgRef.current) {
        imgRef.current.src = '';
      }
    }
  }, [isMonitoring, streamUrl, isStreaming]);

  // Fetch detection statistics
  useEffect(() => {
    if (isMonitoring && isStreaming) {
      const statsInterval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/stats');
          if (response.ok) {
            const stats = await response.json();
            setDetectionCount(stats.total_detections || 0);
            
            const fireCount = stats.by_model?.FireSmoke || 0;
            const ppeCount = stats.by_model?.PPE || 0;
            
            setFireDetections(fireCount);
            setPpeDetections(ppeCount);
            
            if (stats.recent_detections && stats.recent_detections.length > 0) {
              const latest = stats.recent_detections[stats.recent_detections.length - 1];
              setLastDetectionTime(latest.Time);
            }
          }
        } catch (error) {
          console.error('Failed to fetch detection stats:', error);
        }
      }, 3000);

      return () => clearInterval(statsInterval);
    }
  }, [isMonitoring, isStreaming]);

  const handleResetStream = () => {
    console.log('Resetting detection stream connection...');
    setConnectionError(null);
    if (imgRef.current) {
      imgRef.current.src = '';
      setTimeout(() => {
        if (imgRef.current && isMonitoring) {
          imgRef.current.src = streamUrl;
        }
      }, 500);
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing enhanced FastAPI connection...');
      const response = await fetch('http://localhost:8000/', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        console.log('Enhanced FastAPI server is running:', data);
        setConnectionError(null);
      } else {
        setConnectionError('FastAPI server responded with error');
      }
    } catch (error) {
      console.error('FastAPI connection test failed:', error);
      setConnectionError('Cannot connect to FastAPI server. Make sure it\'s running on http://localhost:8000 with both models loaded.');
    }
  };

  const testAudio = async () => {
    try {
      const response = await fetch('http://localhost:8000/test_audio');
      if (response.ok) {
        console.log('Audio test initiated on server');
      }
    } catch (error) {
      console.error('Audio test failed:', error);
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
                Live Detection Stream
                <Flame className="w-5 h-5 text-red-500" />
              </CardTitle>
              <CardDescription>
                Real-time Fire/Smoke & PPE detection with audio alerts
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
          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Connection Error</p>
                <p className="text-red-600 text-sm mt-1">{connectionError}</p>
              </div>
            </div>
          )}

          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <img
              ref={imgRef}
              className="w-full h-full object-cover"
              alt="Live detection feed"
              style={{ display: isStreaming ? 'block' : 'none' }}
            />
            {!isStreaming && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="flex justify-center space-x-2 mb-2">
                    <Play className="w-12 h-12 opacity-50" />
                    <Flame className="w-12 h-12 opacity-50 text-red-400" />
                  </div>
                  <p className="text-lg">
                    {isMonitoring ? 'Connecting to detection system...' : 'Start monitoring to view live detection feed'}
                  </p>
                  {isMonitoring && (
                    <div className="text-sm mt-2 opacity-75 space-y-1">
                      <p>Make sure your enhanced FastAPI server is running</p>
                      <p className="text-xs">Run: <code>python main1.py</code></p>
                      <p className="text-xs">Required: firensmoke.pt & PPEdetect.pt models</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {isStreaming && (
              <div className="absolute top-4 left-4 space-y-2">
                <Badge className="bg-red-500/90 text-white">
                  ● LIVE DETECTION
                </Badge>
                <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {new Date().toLocaleTimeString()}
                </div>
                {lastDetectionTime && (
                  <div className="text-white text-xs bg-red-500/80 px-2 py-1 rounded">
                    Last: {new Date(lastDetectionTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-red-600 font-medium">Fire Detected</p>
                <p className="text-2xl font-bold text-red-700">{fireDetections}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-orange-600 font-medium">PPE Violations</p>
                <p className="text-2xl font-bold text-orange-700">{ppeDetections}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-blue-600 font-medium">Total Detections</p>
                <p className="text-2xl font-bold text-blue-700">{detectionCount}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-green-600 font-medium">Frame Rate</p>
                <p className="text-2xl font-bold text-green-700">{isStreaming ? '30 FPS' : '0 FPS'}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleResetStream}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Stream
            </Button>
            <Button variant="outline" size="sm" onClick={testConnection}>
              <Camera className="w-4 h-4 mr-2" />
              Test Backend
            </Button>
            <Button variant="outline" size="sm" onClick={testAudio}>
              <Volume2 className="w-4 h-4 mr-2" />
              Test Audio
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Enhanced Backend Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Detection Endpoints:</h4>
            <div className="space-y-1 text-sm">
              <div><code>GET /live</code> - Live webcam stream with detection</div>
              <div><code>GET /detections</code> - All detection records</div>
              <div><code>GET /stats</code> - Detection statistics</div>
              <div><code>GET /test_audio</code> - Test audio alerts</div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-3"><strong>To enable enhanced detection:</strong></p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Install required packages: <code className="bg-gray-200 px-1 rounded">pip install fastapi uvicorn opencv-python ultralytics torch pandas pygame pillow</code></li>
              <li>Place your model files: <code className="bg-gray-200 px-1 rounded">firensmoke.pt</code> and <code className="bg-gray-200 px-1 rounded">PPEdetect.pt</code></li>
              <li>Add audio file: <code className="bg-gray-200 px-1 rounded">alert.mp3</code> (optional for sound alerts)</li>
              <li>Run the server: <code className="bg-gray-200 px-1 rounded">python main1.py</code></li>
              <li>Click "Start Monitoring" above</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">Enhanced Features:</p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>🔥 Fire and smoke detection with high-priority alerts</li>
              <li>⚠️ PPE violation detection (helmets, vests, etc.)</li>
              <li>🔊 Audio alerts for all detections</li>
              <li>📸 Automatic snapshot saving</li>
              <li>📊 Excel/CSV logging with timestamps</li>
              <li>📈 Real-time statistics and metrics</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium mb-2">Troubleshooting:</p>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Ensure both YOLO models are in the same directory</li>
              <li>• Check webcam permissions and availability</li>
              <li>• Verify audio file format (MP3 recommended)</li>
              <li>• Check FastAPI server logs for detection results</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveVideoFeed;
