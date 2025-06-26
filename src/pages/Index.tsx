
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Camera, TrendingUp, Users, Clock } from "lucide-react";
import LiveVideoFeed from "@/components/LiveVideoFeed";
import ViolationChart from "@/components/ViolationChart";
import ComplianceMetrics from "@/components/ComplianceMetrics";
import ViolationLogs from "@/components/ViolationLogs";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [violations, setViolations] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    totalViolations: 0,
    helmetsViolations: 0,
    vestsViolations: 0,
    complianceRate: 95.2
  });
  const { toast } = useToast();

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new violation data
      const violationTypes = ["no_helmet", "no_vest", "no_shoes", "no_gloves"];
      const randomViolation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
      
      if (Math.random() < 0.1 && isMonitoring) { // 10% chance of violation
        const newViolation = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          violationType: randomViolation,
          location: "Production Unit A",
          severity: Math.random() > 0.7 ? "high" : "medium"
        };
        
        setViolations(prev => [newViolation, ...prev.slice(0, 49)]);
        setStats(prev => ({
          ...prev,
          totalViolations: prev.totalViolations + 1,
          helmetsViolations: randomViolation === "no_helmet" ? prev.helmetsViolations + 1 : prev.helmetsViolations,
          vestsViolations: randomViolation === "no_vest" ? prev.vestsViolations + 1 : prev.vestsViolations,
          complianceRate: Math.max(85, prev.complianceRate - 0.1)
        }));

        toast({
          title: "PPE Violation Detected",
          description: `${randomViolation.replace('_', ' ').toUpperCase()} violation detected at ${new Date().toLocaleTimeString()}`,
          variant: "destructive",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, toast]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast({
      title: "Monitoring Started",
      description: "PPE detection system is now active",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "Monitoring Stopped",
      description: "PPE detection system has been paused",
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
                  PPE Detection System
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Violations</p>
                  <p className="text-3xl font-bold">{stats.totalViolations}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-200" />
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

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Helmet Violations</p>
                  <p className="text-3xl font-bold">{stats.helmetsViolations}</p>
                </div>
                <Users className="w-8 h-8 text-orange-200" />
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
            <TabsTrigger value="logs">Violation Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplianceMetrics violations={violations} />
              <ViolationChart violations={violations} />
            </div>
          </TabsContent>

          <TabsContent value="live-feed">
            <LiveVideoFeed isMonitoring={isMonitoring} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6">
              <ViolationChart violations={violations} showDetailed={true} />
              <ComplianceMetrics violations={violations} showDetailed={true} />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <ViolationLogs violations={violations} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
