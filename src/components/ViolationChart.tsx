
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar } from "lucide-react";

interface Violation {
  id: number;
  timestamp: string;
  violationType: string;
  location: string;
  severity: string;
}

interface ViolationChartProps {
  violations: Violation[];
  showDetailed?: boolean;
}

const ViolationChart: React.FC<ViolationChartProps> = ({ violations, showDetailed = false }) => {
  // Process violations data for charts
  const processViolationsByHour = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      violations: 0,
      helmet: 0,
      vest: 0,
      shoes: 0,
      gloves: 0
    }));

    violations.forEach(violation => {
      const hour = new Date(violation.timestamp).getHours();
      hourlyData[hour].violations++;
      
      switch (violation.violationType) {
        case 'no_helmet':
          hourlyData[hour].helmet++;
          break;
        case 'no_vest':
          hourlyData[hour].vest++;
          break;
        case 'no_shoes':
          hourlyData[hour].shoes++;
          break;
        case 'no_gloves':
          hourlyData[hour].gloves++;
          break;
      }
    });

    return hourlyData.slice(-12); // Show last 12 hours
  };

  const processViolationsByType = () => {
    const typeCount = {
      no_helmet: 0,
      no_vest: 0,
      no_shoes: 0,
      no_gloves: 0
    };

    violations.forEach(violation => {
      typeCount[violation.violationType as keyof typeof typeCount]++;
    });

    return [
      { name: 'No Helmet', value: typeCount.no_helmet, color: '#EF4444' },
      { name: 'No Vest', value: typeCount.no_vest, color: '#F97316' },
      { name: 'No Shoes', value: typeCount.no_shoes, color: '#EAB308' },
      { name: 'No Gloves', value: typeCount.no_gloves, color: '#8B5CF6' }
    ];
  };

  const hourlyData = processViolationsByHour();
  const typeData = processViolationsByType();

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Violation Trends (Last 12 Hours)
          </CardTitle>
          <CardDescription>
            Hourly breakdown of PPE violations detected
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
                <Bar dataKey="violations" fill="url(#violationGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="violationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {showDetailed && (
        <>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Violation Types Distribution</CardTitle>
              <CardDescription>
                Breakdown of different PPE violation types
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
                Individual violation types by hour
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
                    <Line type="monotone" dataKey="helmet" stroke="#EF4444" strokeWidth={2} name="Helmet" />
                    <Line type="monotone" dataKey="vest" stroke="#F97316" strokeWidth={2} name="Vest" />
                    <Line type="monotone" dataKey="shoes" stroke="#EAB308" strokeWidth={2} name="Shoes" />
                    <Line type="monotone" dataKey="gloves" stroke="#8B5CF6" strokeWidth={2} name="Gloves" />
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
