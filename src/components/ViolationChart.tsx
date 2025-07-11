
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Flame } from "lucide-react";

interface Detection {
  id: number;
  timestamp: string;
  violationType: string;
  model: string;
  location: string;
  severity: string;
  confidence?: number;
  snapshot?: string;
}

interface ViolationChartProps {
  violations: Detection[];
  showDetailed?: boolean;
}

const ViolationChart: React.FC<ViolationChartProps> = ({ violations, showDetailed = false }) => {
  // Process detections data for charts
  const processDetectionsByHour = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      total: 0,
      fire: 0,
      smoke: 0,
      ppe_helmet: 0,
      ppe_vest: 0,
      ppe_other: 0
    }));

    violations.forEach(detection => {
      const hour = new Date(detection.timestamp).getHours();
      hourlyData[hour].total++;
      
      if (detection.model === 'FireSmoke') {
        if (detection.violationType.toLowerCase().includes('fire')) {
          hourlyData[hour].fire++;
        } else if (detection.violationType.toLowerCase().includes('smoke')) {
          hourlyData[hour].smoke++;
        }
      } else if (detection.model === 'PPE') {
        if (detection.violationType.toLowerCase().includes('helmet')) {
          hourlyData[hour].ppe_helmet++;
        } else if (detection.violationType.toLowerCase().includes('vest')) {
          hourlyData[hour].ppe_vest++;
        } else {
          hourlyData[hour].ppe_other++;
        }
      }
    });

    return hourlyData.slice(-12); // Show last 12 hours
  };

  const processDetectionsByType = () => {
    const typeCount = {
      fire: 0,
      smoke: 0,
      ppe_helmet: 0,
      ppe_vest: 0,
      ppe_other: 0
    };

    violations.forEach(detection => {
      if (detection.model === 'FireSmoke') {
        if (detection.violationType.toLowerCase().includes('fire')) {
          typeCount.fire++;
        } else if (detection.violationType.toLowerCase().includes('smoke')) {
          typeCount.smoke++;
        }
      } else if (detection.model === 'PPE') {
        if (detection.violationType.toLowerCase().includes('helmet')) {
          typeCount.ppe_helmet++;
        } else if (detection.violationType.toLowerCase().includes('vest')) {
          typeCount.ppe_vest++;
        } else {
          typeCount.ppe_other++;
        }
      }
    });

    return [
      { name: 'Fire', value: typeCount.fire, color: '#DC2626' },
      { name: 'Smoke', value: typeCount.smoke, color: '#6B7280' },
      { name: 'No Helmet', value: typeCount.ppe_helmet, color: '#EF4444' },
      { name: 'No Vest', value: typeCount.ppe_vest, color: '#F97316' },
      { name: 'Other PPE', value: typeCount.ppe_other, color: '#8B5CF6' }
    ].filter(item => item.value > 0);
  };

  const hourlyData = processDetectionsByHour();
  const typeData = processDetectionsByType();

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Detection Trends (Last 12 Hours)
            <Flame className="w-5 h-5 text-red-500" />
          </CardTitle>
          <CardDescription>
            Hourly breakdown of Fire/Smoke & PPE detections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="fire" fill="#DC2626" name="Fire" stackId="a" />
                <Bar dataKey="smoke" fill="#6B7280" name="Smoke" stackId="a" />
                <Bar dataKey="ppe_helmet" fill="#EF4444" name="No Helmet" stackId="b" />
                <Bar dataKey="ppe_vest" fill="#F97316" name="No Vest" stackId="b" />
                <Bar dataKey="ppe_other" fill="#8B5CF6" name="Other PPE" stackId="b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {showDetailed && (
        <>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Detection Types Distribution</CardTitle>
              <CardDescription>
                Breakdown of Fire/Smoke and PPE violation types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Detailed Hourly Breakdown</CardTitle>
              <CardDescription>
                Individual detection types by hour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="fire" stroke="#DC2626" strokeWidth={3} name="Fire" />
                    <Line type="monotone" dataKey="smoke" stroke="#6B7280" strokeWidth={3} name="Smoke" />
                    <Line type="monotone" dataKey="ppe_helmet" stroke="#EF4444" strokeWidth={2} name="No Helmet" />
                    <Line type="monotone" dataKey="ppe_vest" stroke="#F97316" strokeWidth={2} name="No Vest" />
                    <Line type="monotone" dataKey="ppe_other" stroke="#8B5CF6" strokeWidth={2} name="Other PPE" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ViolationChart;
