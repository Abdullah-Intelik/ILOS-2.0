import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Database, 
  Clock, 
  User, 
  Hash, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  FileEdit,
  Eye,
  Search
} from 'lucide-react';

/**
 * Database Change Monitor Component
 * Displays database changes alongside department changes for complete audit trail
 */
const DatabaseChangeMonitor = ({ losId, className = "" }) => {
  const [databaseChanges, setDatabaseChanges] = useState([]);
  const [departmentChanges, setDepartmentChanges] = useState([]);
  const [selectedTab, setSelectedTab] = useState('database');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Risk level colors
  const riskLevelColors = {
    'LOW': 'bg-green-50 border-green-200 text-green-800',
    'MEDIUM': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    'HIGH': 'bg-red-50 border-red-200 text-red-800',
    'CRITICAL': 'bg-red-100 border-red-300 text-red-900'
  };

  // Operation colors
  const operationColors = {
    'UPDATE': 'bg-blue-100 text-blue-800',
    'INSERT': 'bg-green-100 text-green-800',
    'DELETE': 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    if (losId) {
      fetchAllChanges();
      // Refresh every 10 seconds
      const interval = setInterval(fetchAllChanges, 10000);
      return () => clearInterval(interval);
    }
  }, [losId]);

  // Fetch both database and department changes
  const fetchAllChanges = async () => {
    try {
      setIsLoading(true);
      
      // Fetch database changes
      const dbResponse = await fetch(`/api/database-changes/summary/${losId}`);
      const dbData = await dbResponse.json();
      
      if (dbData.success) {
        setDatabaseChanges(dbData.changes || []);
      }

      // Fetch department changes
      const deptResponse = await fetch(`/api/department-changes/history/${losId}?includeDetails=true`);
      const deptData = await deptResponse.json();
      
      if (deptData.success) {
        setDepartmentChanges(deptData.history || []);
      }

      setLastRefresh(new Date());
      setError(null);
      
    } catch (error) {
      setError(`Failed to fetch changes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh
  const handleRefresh = () => {
    fetchAllChanges();
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

  // Format field changes for display
  const formatFieldChanges = (changedFields) => {
    if (Array.isArray(changedFields)) {
      return changedFields.join(', ');
    }
    return changedFields || 'N/A';
  };

  // Get risk badge
  const getRiskBadge = (riskLevel, riskScore) => {
    const colorClass = riskLevelColors[riskLevel] || riskLevelColors['LOW'];
    return (
      <Badge className={colorClass}>
        {riskLevel} ({riskScore}/10)
      </Badge>
    );
  };

  if (isLoading && databaseChanges.length === 0 && departmentChanges.length === 0) {
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
            Complete Change Audit - LOS-{losId}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <Search className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Badge variant="secondary">
              Last: {formatTimestamp(lastRefresh)}
            </Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{databaseChanges.length}</div>
            <div className="text-sm text-blue-600">DB Changes</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{departmentChanges.length}</div>
            <div className="text-sm text-green-600">Dept Changes</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {databaseChanges.filter(c => c.risk_level === 'HIGH' || c.risk_level === 'CRITICAL').length}
            </div>
            <div className="text-sm text-red-600">High Risk</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {databaseChanges.length + departmentChanges.length}
            </div>
            <div className="text-sm text-purple-600">Total</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database Changes ({databaseChanges.length})
            </TabsTrigger>
            <TabsTrigger value="department" className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Department Changes ({departmentChanges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="mt-6">
            <div className="space-y-4">
              {databaseChanges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium">No Database Changes Detected</div>
                  <div className="text-sm">Direct database modifications will appear here</div>
                </div>
              ) : (
                databaseChanges.map((change, index) => (
                  <div 
                    key={change.id || index} 
                    className={`border rounded-lg p-4 ${riskLevelColors[change.risk_level] || riskLevelColors['LOW']}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={operationColors[change.operation] || operationColors['UPDATE']}>
                          {change.operation}
                        </Badge>
                        <Badge variant="outline">
                          {change.table_name}
                        </Badge>
                        {getRiskBadge(change.risk_level, change.risk_score)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {change.id}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{change.changed_by || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatTimestamp(change.changed_at)}</span>
                      </div>
                    </div>

                    {/* Changed Fields */}
                    <div className="bg-white rounded p-3 border mb-3">
                      <div className="text-sm font-medium mb-2">Changed Fields:</div>
                      <div className="text-sm text-gray-600">
                        {formatFieldChanges(change.changed_fields)}
                      </div>
                    </div>

                    {/* Values Changed */}
                    {change.old_values && change.new_values && (
                      <div className="bg-white rounded p-3 border">
                        <div className="text-sm font-medium mb-2">Value Changes:</div>
                        {Object.keys(change.new_values || {}).map(key => {
                          const oldVal = change.old_values?.[key];
                          const newVal = change.new_values?.[key];
                          if (oldVal !== newVal) {
                            return (
                              <div key={key} className="text-sm mb-1">
                                <span className="font-medium">{key}:</span>
                                <span className="ml-2 bg-red-50 px-2 py-1 rounded text-red-700">
                                  {String(oldVal || 'null')}
                                </span>
                                <span className="mx-2 text-gray-400">→</span>
                                <span className="bg-green-50 px-2 py-1 rounded text-green-700">
                                  {String(newVal || 'null')}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}

                    {/* Processing Status */}
                    <div className="flex items-center justify-between pt-3 border-t mt-3">
                      <div className="flex items-center gap-2">
                        {change.processed_by_tracker ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-xs">
                          {change.processed_by_tracker ? 'Processed' : 'Pending Processing'}
                        </span>
                      </div>
                      {change.sensitive_fields_changed && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Sensitive Data
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="department" className="mt-6">
            <div className="space-y-4">
              {departmentChanges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium">No Department Changes</div>
                  <div className="text-sm">Workflow changes will appear here</div>
                </div>
              ) : (
                departmentChanges.map((change, index) => (
                  <div 
                    key={change.id || index} 
                    className="border rounded-lg p-4 bg-blue-50 border-blue-200"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          {change.department}
                        </Badge>
                        <Badge variant="outline">
                          {change.changeType?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        #{change.sequence}
                      </div>
                    </div>

                    {/* Details */}
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

                    {/* Blockchain Status */}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-mono text-gray-600">
                        {change.compositeHash?.substring(0, 16)}...
                      </span>
                      {change.blockchain?.verificationStatus === 'VERIFIED' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            Monitoring LOS-{losId} for all changes
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/database-changes/detailed/${losId}`, '_blank')}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <Activity className="h-4 w-4 mr-1" />
              Force Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseChangeMonitor;
