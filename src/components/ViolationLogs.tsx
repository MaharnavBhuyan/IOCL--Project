
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, AlertTriangle, Clock, MapPin } from "lucide-react";

interface Violation {
  id: number;
  timestamp: string;
  violationType: string;
  location: string;
  severity: string;
}

interface ViolationLogsProps {
  violations: Violation[];
}

const ViolationLogs: React.FC<ViolationLogsProps> = ({ violations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredViolations = violations.filter(violation => {
    const matchesSearch = violation.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || violation.severity === severityFilter;
    const matchesType = typeFilter === 'all' || violation.violationType === typeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case 'no_helmet':
        return 'bg-red-100 text-red-800';
      case 'no_vest':
        return 'bg-orange-100 text-orange-800';
      case 'no_shoes':
        return 'bg-yellow-100 text-yellow-800';
      case 'no_gloves':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatViolationType = (type: string) => {
    return type.replace('no_', '').replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Timestamp', 'Violation Type', 'Location', 'Severity'],
      ...filteredViolations.map(v => [
        new Date(v.timestamp).toLocaleString(),
        formatViolationType(v.violationType),
        v.location,
        v.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ppe_violations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Violation Logs
              </CardTitle>
              <CardDescription>
                Detailed history of all PPE violations detected
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search violations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="no_helmet">No Helmet</SelectItem>
                <SelectItem value="no_vest">No Vest</SelectItem>
                <SelectItem value="no_shoes">No Shoes</SelectItem>
                <SelectItem value="no_gloves">No Gloves</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredViolations.length}</div>
              <div className="text-sm text-gray-600">Total Violations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredViolations.filter(v => v.severity === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredViolations.length > 0 ? 
                  (((violations.length - filteredViolations.length) / violations.length) * 100).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Compliance Rate</div>
            </div>
          </div>

          {/* Violations Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time
                    </div>
                  </TableHead>
                  <TableHead>Violation Type</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </div>
                  </TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No violations found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredViolations.map((violation) => (
                    <TableRow key={violation.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-mono text-sm">
                        {new Date(violation.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getViolationTypeColor(violation.violationType)}>
                          {formatViolationType(violation.violationType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{violation.location}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredViolations.length > 10 && (
            <div className="flex justify-center">
              <Button variant="outline" size="sm">
                Load More Violations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViolationLogs;
