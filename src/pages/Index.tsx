
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Camera, TrendingUp, Users, Clock, Flame } from "lucide-react";
import LiveVideoFeed from "@/components/LiveVideoFeed";
import ViolationChart from "@/components/ViolationChart";
import ComplianceMetrics from "@/components/ComplianceMetrics";
import ViolationLogs from "@/components/ViolationLogs";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [detections, setDetections] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    totalDetections: 0,
    fireDetections: 0,
    smokeDetections: 0,
    ppeViolations: 0,
    complianceRate: 95.2
  });
  const { toast } = useToast();

  // Fetch detection data from backend
  const fetchDetections = async () => {
    try {
      const response = await fetch('http://localhost:8000/detections');
      if (response.ok) {
        const data = await response.json();
        const formattedDetections = data.detections?.map(detection => ({
          id: Date.now() + Math.random(),
          timestamp: detection.Time,
          violationType: detection.Class,
          model: detection.Model,
          location: "Production Unit A",
          severity: detection.Model === "FireSmoke" ? "high" : "medium",
          confidence: detection.Confidence,
          snapshot: detection.Snapshot
        })) || [];
        
        setDetections(formattedDetections);
        
        // Update stats - fix the arithmetic operation error by ensuring all values are numbers
        const fireCount = Number(formattedDetections.filter(d => d.model === "FireSmoke" && d.violationType === "fire").length);
        const smokeCount = Number(formattedDetections.filter(d => d.model === "FireSmoke" && d.violationType === "smoke").length);
        const ppeCount = Number(formattedDetections.filter(d => d.model === "PPE").length);
        const totalCount = Number(formattedDetections.length);
        
        setStats(prev => ({
          ...prev,
          totalDetections: totalCount,
          fireDetections: fireCount,
          smokeDetections: smokeCount,
          ppeViolations: ppeCount,
          complianceRate: Math.max(70, 100 - (totalCount * 2))
        }));
      }
    } catch (error) {
      console.error('Failed to fetch detections:', error);
    }
  };

  // Simulate real-time data updates and sound alerts
  useEffect(() => {
    let interval;
    if (isMonitoring) {
      // Fetch initial data
      fetchDetections();
      
      // Set up polling for new detections
      interval = setInterval(() => {
        fetchDetections();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  // Handle new detection notifications
  useEffect(() => {
    if (detections.length > 0) {
      const latestDetection = detections[0];
      const isRecent = new Date() - new Date(latestDetection.timestamp) < 10000; // Within 10 seconds
      
      if (isRecent && isMonitoring) {
        // Play browser audio alert
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMTBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwTBDyP2fTNeSsFJHfH8N2QQCgBAA==');
          audio.volume = 0.3;
          audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
          console.log('Browser audio not supported:', e);
        }

        const detectionType = latestDetection.model === "FireSmoke" ? "Fire/Smoke" : "PPE Violation";
        const icon = latestDetection.model === "FireSmoke" ? "🔥" : "⚠️";
        
        toast({
          title: `${icon} ${detectionType} Detected`,
          description: `${latestDetection.violationType} detected with ${(latestDetection.confidence * 100).toFixed(1)}% confidence at ${new Date(latestDetection.timestamp).toLocaleTimeString()}`,
          variant: latestDetection.model === "FireSmoke" ? "destructive" : "destructive",
        });
      }
    }
  }, [detections, isMonitoring, toast]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast({
      title: "Monitoring Started",
      description: "Fire/Smoke & PPE detection system is now active",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "Monitoring Stopped",
      description: "Detection system has been paused",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Fire/Smoke & PPE Detection System
                </h1>
                <p className="text-sm text-gray-600">Real-time Safety Monitoring Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isMonitoring ? "default" : "secondary"} className="px-3 py-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                {isMonitoring ? "Active" : "Inactive"}
              </Badge>
              <Button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                className="px-6"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Fire Detections</p>
                  <p className="text-3xl font-bold">{stats.fireDetections}</p>
                </div>
                <Flame className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Smoke Detections</p>
                  <p className="text-3xl font-bold">{stats.smokeDetections}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">PPE Violations</p>
                  <p className="text-3xl font-bold">{stats.ppeViolations}</p>
                </div>
                <Users className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Compliance Rate</p>
                  <p className="text-3xl font-bold">{stats.complianceRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Hours</p>
                  <p className="text-3xl font-bold">24/7</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="live-feed">Live Feed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Detection Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplianceMetrics violations={detections} />
              <ViolationChart violations={detections} />
            </div>
          </TabsContent>

          <TabsContent value="live-feed">
            <LiveVideoFeed isMonitoring={isMonitoring} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6">
              <ViolationChart violations={detections} showDetailed={true} />
              <ComplianceMetrics violations={detections} showDetailed={true} />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <ViolationLogs violations={detections} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
