import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Clock, User, Hash, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

/**
 * Enhanced Department Change Monitor Component
 * Displays real-time department changes with blockchain verification
 */
const DepartmentChangeMonitor = ({ losId, className = "" }) => {
  const [changes, setChanges] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [activitySummary, setActivitySummary] = useState(null);
  const [verification, setVerification] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Department list for filtering
  const departments = ['ALL', 'PB', 'SPU', 'COPS', 'EAMVU', 'CIU', 'RRU', 'RISK', 'COMPLIANCE'];

  // Department colors for visual distinction
  const departmentColors = {
    'PB': 'bg-blue-100 text-blue-800 border-blue-200',
    'SPU': 'bg-green-100 text-green-800 border-green-200',
    'COPS': 'bg-purple-100 text-purple-800 border-purple-200',
    'EAMVU': 'bg-orange-100 text-orange-800 border-orange-200',
    'CIU': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'RRU': 'bg-red-100 text-red-800 border-red-200',
    'RISK': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'COMPLIANCE': 'bg-pink-100 text-pink-800 border-pink-200'
  };

  // Risk level colors
  const riskLevelColors = {
    'LOW': 'bg-green-50 border-green-200',
    'MEDIUM': 'bg-yellow-50 border-yellow-200',
    'HIGH': 'bg-red-50 border-red-200'
  };

  useEffect(() => {
    if (losId) {
      initializeChangeMonitor();
      connectToChangeStream();
    }

    return () => {
      disconnectFromChangeStream();
    };
  }, [losId]);

  useEffect(() => {
    if (losId) {
      fetchDepartmentChanges();
    }
  }, [selectedDepartment, losId]);

  // Initialize change monitor
  const initializeChangeMonitor = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchDepartmentChanges(),
        fetchActivitySummary()
      ]);
    } catch (error) {
      setError(`Failed to initialize: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch department changes
  const fetchDepartmentChanges = async () => {
    try {
      const endpoint = selectedDepartment === 'ALL' 
        ? `/api/department-changes/history/${losId}`
        : `/api/department-changes/history/${losId}/${selectedDepartment}`;

      const response = await fetch(`${endpoint}?includeDetails=true`);
      const data = await response.json();

      if (data.success) {
        setChanges(data.history);
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError(`Failed to fetch changes: ${error.message}`);
    }
  };

  // Fetch activity summary
  const fetchActivitySummary = async () => {
    try {
      const response = await fetch(`/api/department-changes/activity/${losId}`);
      const data = await response.json();

      if (data.success) {
        setActivitySummary(data.totals);
      }
    } catch (error) {
      console.warn('Failed to fetch activity summary:', error);
    }
  };

  // Verify changes for a specific department
  const verifyChanges = async (department) => {
    try {
      const response = await fetch(`/api/department-changes/verify/${losId}/${department}`);
      const data = await response.json();

      if (data.success) {
        setVerification(prev => ({
          ...prev,
          [department]: data.verification
        }));
      }
    } catch (error) {
      console.error(`Failed to verify ${department} changes:`, error);
    }
  };

  // Connect to real-time change stream
  const connectToChangeStream = () => {
    try {
      const eventSource = new EventSource(`/api/department-changes/stream/${losId}`);
      
      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('📡 Connected to change stream');
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'change') {
          // Add new change to the list
          setChanges(prev => [data.change, ...prev]);
          
          // Show notification (you can customize this)
          console.log('📋 New change received:', data.change);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        console.warn('📡 Change stream connection lost');
      };

      // Store event source for cleanup
      window.changeEventSource = eventSource;

    } catch (error) {
      console.error('Failed to connect to change stream:', error);
    }
  };

  // Disconnect from change stream
  const disconnectFromChangeStream = () => {
    if (window.changeEventSource) {
      window.changeEventSource.close();
      window.changeEventSource = null;
    }
    setIsConnected(false);
  };

  // Get risk level based on total risk score
  const getRiskLevel = (riskScore) => {
    if (riskScore >= 8) return 'HIGH';
    if (riskScore >= 4) return 'MEDIUM';
    return 'LOW';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="animate-spin h-6 w-6 mr-2" />
            Loading change history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Department Change Timeline - LOS-{losId}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? '🔗 Live' : '📴 Offline'}
            </Badge>
          </div>
        </div>
        
        {/* Activity Summary */}
        {activitySummary && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-xl font-bold text-blue-600">{activitySummary.departments}</div>
              <div className="text-sm text-blue-600">Departments</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-xl font-bold text-green-600">{activitySummary.totalChanges}</div>
              <div className="text-sm text-green-600">Total Changes</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="text-xl font-bold text-purple-600">{activitySummary.uniqueOfficers}</div>
              <div className="text-sm text-purple-600">Officers</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="text-xl font-bold text-orange-600">
                {Math.round(activitySummary.totalRiskScore / Math.max(activitySummary.totalChanges, 1))}
              </div>
              <div className="text-sm text-orange-600">Avg Risk</div>
            </div>
          </div>
        )}

        {/* Department Filter */}
        <div className="flex items-center gap-4 mt-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchDepartmentChanges()}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Change Timeline */}
        <div className="space-y-4">
          {changes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No changes found for {selectedDepartment === 'ALL' ? 'any department' : selectedDepartment}
            </div>
          ) : (
            changes.map((change, index) => {
              const riskLevel = getRiskLevel(change.totalRiskScore);
              const deptColor = departmentColors[change.department] || 'bg-gray-100 text-gray-800';
              
              return (
                <div 
                  key={change.id} 
                  className={`border rounded-lg p-4 ${riskLevelColors[riskLevel]}`}
                >
                  {/* Change Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={deptColor}>
                        {change.department}
                      </Badge>
                      <Badge variant="outline">
                        {change.changeType.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="secondary">
                        Risk: {riskLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      #{change.sequence}
                    </div>
                  </div>

                  {/* Change Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{change.officer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{formatTimestamp(change.timestamp)}</span>
                    </div>
                  </div>

                  {/* Field Changes */}
                  {change.fieldChanges && (
                    <div className="space-y-2 mb-3">
                      {change.fieldChanges.map((fieldChange, i) => (
                        <div key={i} className="bg-white rounded p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{fieldChange.fieldName}</span>
                            <Badge variant="outline" size="sm">
                              Risk: {fieldChange.riskScore}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="bg-red-50 px-2 py-1 rounded text-red-700">
                              {fieldChange.oldValue || 'null'}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="bg-green-50 px-2 py-1 rounded text-green-700">
                              {fieldChange.newValue || 'null'}
                            </span>
                          </div>
                          {fieldChange.changeReason && (
                            <div className="text-xs text-gray-500 mt-1">
                              Reason: {fieldChange.changeReason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blockchain Verification */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-mono text-gray-600">
                        {change.compositeHash?.substring(0, 16)}...
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {change.blockchain?.verificationStatus === 'VERIFIED' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs">
                        {change.blockchain?.verificationStatus || 'Unknown'}
                      </span>
                      
                      {change.blockchain?.txId && (
                        <span className="text-xs font-mono text-gray-500">
                          {change.blockchain.txId.substring(0, 12)}...
                        </span>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => verifyChanges(change.department)}
                        className="text-xs h-6"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Verification Results */}
        {Object.keys(verification).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Verification Results</h4>
            {Object.entries(verification).map(([dept, result]) => (
              <div key={dept} className="mb-2">
                <Badge className={departmentColors[dept]}>
                  {dept}
                </Badge>
                <span className="ml-2 text-sm">
                  {result.isValid ? 
                    `✅ All ${result.totalChanges} changes verified` : 
                    `❌ ${result.summary.invalidChanges} invalid changes`
                  }
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentChangeMonitor;
