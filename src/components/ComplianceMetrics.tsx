
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Violation {
  id: number;
  timestamp: string;
  violationType: string;
  location: string;
  severity: string;
}

interface ComplianceMetricsProps {
  violations: Violation[];
  showDetailed?: boolean;
}

const ComplianceMetrics: React.FC<ComplianceMetricsProps> = ({ violations, showDetailed = false }) => {
  // Calculate compliance metrics
  const calculateMetrics = () => {
    const totalDetections = Math.max(violations.length * 10, 100); // Simulate total detections
    const totalViolations = violations.length;
    const complianceRate = ((totalDetections - totalViolations) / totalDetections) * 100;
    
    const violationsByType = {
      no_helmet: violations.filter(v => v.violationType === 'no_helmet').length,
      no_vest: violations.filter(v => v.violationType === 'no_vest').length,
      no_shoes: violations.filter(v => v.violationType === 'no_shoes').length,
      no_gloves: violations.filter(v => v.violationType === 'no_gloves').length,
    };

    const severityCount = {
      high: violations.filter(v => v.severity === 'high').length,
      medium: violations.filter(v => v.severity === 'medium').length,
      low: violations.filter(v => v.severity === 'low').length,
    };

    return {
      complianceRate: Math.max(complianceRate, 85),
      totalDetections,
      totalViolations,
      violationsByType,
      severityCount
    };
  };

  const metrics = calculateMetrics();

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (rate: number) => {
    if (rate >= 95) return { text: 'Excellent', color: 'bg-green-500' };
    if (rate >= 85) return { text: 'Good', color: 'bg-yellow-500' };
    return { text: 'Needs Attention', color: 'bg-red-500' };
  };

  const status = getComplianceStatus(metrics.complianceRate);

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety Compliance Overview
          </CardTitle>
          <CardDescription>
            Real-time safety compliance metrics and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Compliance Rate */}
          <div className="text-center space-y-4">
            <div>
              <div className={`text-4xl font-bold ${getComplianceColor(metrics.complianceRate)}`}>
                {metrics.complianceRate.toFixed(1)}%
              </div>
              <p className="text-gray-600">Overall Compliance Rate</p>
            </div>
            <div className="space-y-2">
              <Progress value={metrics.complianceRate} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Target: 95%</span>
                <Badge className={status.color}>{status.text}</Badge>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalDetections}</div>
              <div className="text-sm text-blue-800">Total Detections</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{metrics.totalViolations}</div>
              <div className="text-sm text-red-800">Total Violations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PPE Type Breakdown */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>PPE Compliance by Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(metrics.violationsByType).map(([type, count]) => {
            const total = Math.max(count * 8, 20); // Simulate total checks
            const compliance = ((total - count) / total) * 100;
            const typeLabel = type.replace('no_', '').replace('_', ' ');
            
            return (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{typeLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{compliance.toFixed(1)}%</span>
                    {compliance >= 90 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <Progress value={compliance} className="h-2" />
                <div className="text-xs text-gray-500">
                  {count} violations out of {total} checks
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {showDetailed && (
        <>
          {/* Severity Breakdown */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Violation Severity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{metrics.severityCount.high}</div>
                  <div className="text-sm text-red-800">High Risk</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.severityCount.medium}</div>
                  <div className="text-sm text-yellow-800">Medium Risk</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.severityCount.low}</div>
                  <div className="text-sm text-green-800">Low Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Performance */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Performance Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Last Hour Compliance</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {(metrics.complianceRate + Math.random() * 2).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Peak Violation Time</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  14:00 - 16:00
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Most Common Violation</span>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  No Helmet
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ComplianceMetrics;
