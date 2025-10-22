'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Hash, Shield, Database, Activity } from 'lucide-react';

interface HashRecord {
  losId: string;
  department: string;
  formHash: string;
  formDataHash: string;
  version: string;
  timestamp: string;
  signer: string;
  status: string;
  verificationHash?: string;
}

interface CreateHashRequest {
  losId: string;
  department: string;
  applicationData: any;
  version: string;
  signer: string;
}

interface VerifyHashRequest {
  losId: string;
  department: string;
  applicationData: any;
}

const departments = [
  { value: 'PB', label: 'Personal Banking (PB)' },
  { value: 'SPU', label: 'Small & Personal Unit (SPU)' },
  { value: 'COPS', label: 'Central Operations (COPS)' },
  { value: 'EAMVU', label: 'EAMVU Unit (EAMVU)' },
  { value: 'CIU', label: 'Credit Information Unit (CIU)' },
  { value: 'RRU', label: 'Risk Review Unit (RRU)' },
  { value: 'Risk', label: 'Risk Management (Risk)' },
  { value: 'Compliance', label: 'Compliance Department (Compliance)' }
];

export default function BlockchainHashDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hashRecords, setHashRecords] = useState<HashRecord[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('CIU');
  const [serviceHealth, setServiceHealth] = useState<boolean | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateHashRequest>({
    losId: '',
    department: 'CIU',
    applicationData: {},
    version: '1.0',
    signer: ''
  });

  const [verifyForm, setVerifyForm] = useState<VerifyHashRequest>({
    losId: '',
    department: 'CIU',
    applicationData: {}
  });

  const [formData, setFormData] = useState<string>('');

  // Check service health on component mount
  useEffect(() => {
    checkServiceHealth();
    loadDepartmentHashes(selectedDepartment);
  }, [selectedDepartment]);

  const checkServiceHealth = async () => {
    try {
      const response = await fetch('/api/blockchain-hash/hash-service-health');
      const result = await response.json();
      setServiceHealth(result.success);
    } catch (error) {
      setServiceHealth(false);
    }
  };

  const loadDepartmentHashes = async (department: string) => {
    try {
      const response = await fetch(`/api/blockchain-hash/department-hashes/${department}`);
      const result = await response.json();
      if (result.success) {
        setHashRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to load department hashes:', error);
    }
  };

  const handleCreateHash = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Parse form data
      let parsedData;
      try {
        parsedData = JSON.parse(formData);
      } catch (e) {
        throw new Error('Invalid JSON in form data');
      }

      const requestData = {
        ...createForm,
        applicationData: parsedData
      };

      const response = await fetch('/api/blockchain-hash/create-application-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Hash created successfully!' });
        setCreateForm({
          losId: '',
          department: 'CIU',
          applicationData: {},
          version: '1.0',
          signer: ''
        });
        setFormData('');
        loadDepartmentHashes(createForm.department);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create hash' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyHash = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Parse form data
      let parsedData;
      try {
        parsedData = JSON.parse(formData);
      } catch (e) {
        throw new Error('Invalid JSON in form data');
      }

      const requestData = {
        ...verifyForm,
        applicationData: parsedData
      };

      const response = await fetch('/api/blockchain-hash/verify-application-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        const verificationStatus = result.data.verification?.overallMatch ? 'VERIFIED' : 'REJECTED';
        setMessage({ 
          type: result.data.verification?.overallMatch ? 'success' : 'error', 
          text: `Hash verification completed: ${verificationStatus}` 
        });
        loadDepartmentHashes(verifyForm.department);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to verify hash' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatHash = (hash: string) => {
    return hash.length > 20 ? `${hash.substring(0, 20)}...` : hash;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Hash Dashboard</h1>
          <p className="text-gray-600">Department-wise hashing and verification system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Service Status:</span>
          {serviceHealth === null ? (
            <Badge variant="secondary">Checking...</Badge>
          ) : serviceHealth ? (
            <Badge className="bg-green-100 text-green-800">Healthy</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
          )}
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Hash</TabsTrigger>
          <TabsTrigger value="verify">Verify Hash</TabsTrigger>
          <TabsTrigger value="view">View Hashes</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Create Department Hash
              </CardTitle>
              <CardDescription>
                Create a new blockchain hash for application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="losId">LOS ID</Label>
                  <Input
                    id="losId"
                    value={createForm.losId}
                    onChange={(e) => setCreateForm({ ...createForm, losId: e.target.value })}
                    placeholder="e.g., LOS_001"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={createForm.department} onValueChange={(value) => setCreateForm({ ...createForm, department: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={createForm.version}
                    onChange={(e) => setCreateForm({ ...createForm, version: e.target.value })}
                    placeholder="e.g., 1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="signer">Signer</Label>
                  <Input
                    id="signer"
                    value={createForm.signer}
                    onChange={(e) => setCreateForm({ ...createForm, signer: e.target.value })}
                    placeholder="e.g., user123"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="formData">Form Data (JSON)</Label>
                <Textarea
                  id="formData"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                  placeholder='{"test": "data", "form": "application"}'
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateHash} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Hash
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Verify Hash
              </CardTitle>
              <CardDescription>
                Verify the integrity of stored application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="verifyLosId">LOS ID</Label>
                  <Input
                    id="verifyLosId"
                    value={verifyForm.losId}
                    onChange={(e) => setVerifyForm({ ...verifyForm, losId: e.target.value })}
                    placeholder="e.g., LOS_001"
                  />
                </div>
                <div>
                  <Label htmlFor="verifyDepartment">Department</Label>
                  <Select value={verifyForm.department} onValueChange={(value) => setVerifyForm({ ...verifyForm, department: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="verifyFormData">Form Data (JSON)</Label>
                <Textarea
                  id="verifyFormData"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                  placeholder='{"test": "data", "form": "application"}'
                  rows={4}
                />
              </div>
              <Button onClick={handleVerifyHash} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Verify Hash
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Department Hashes
              </CardTitle>
              <CardDescription>
                View all hashes for a specific department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="viewDepartment">Select Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                {hashRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hashes found for {selectedDepartment}
                  </div>
                ) : (
                  hashRecords.map((hash, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{hash.losId}</span>
                            {getStatusBadge(hash.status)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(hash.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Form Hash:</span>
                            <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                              {formatHash(hash.formHash)}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Data Hash:</span>
                            <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                              {formatHash(hash.formDataHash)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Signer: {hash.signer}</span>
                          <span className="ml-4">Version: {hash.version}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

