/**
 * Simple API Test Component
 * For debugging backend connectivity
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';

export function ApiTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testApiEndpoints = async () => {
    setIsLoading(true);
    setResults([]);

    const tests = [
      {
        name: 'Get Sessions',
        test: () => apiClient.getSessions()
      },
      {
        name: 'Get Agents',
        test: () => apiClient.getAgents()
      },
      {
        name: 'Create Session',
        test: () => apiClient.createSession({ name: `Test Session ${Date.now()}` })
      }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`🧪 Testing: ${name}`);
        const result = await test();
        console.log(`✅ ${name} Success:`, result);
        setResults(prev => [...prev, { name, status: 'success', data: result }]);
        toast({
          title: `${name} Success`,
          description: `API call successful`,
        });
      } catch (error) {
        console.error(`❌ ${name} Failed:`, error);
        setResults(prev => [...prev, { name, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }]);
        toast({
          title: `${name} Failed`,
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>API Debug Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={testApiEndpoints} 
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? 'Testing...' : 'Test API Endpoints'}
        </Button>
        
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className={`p-2 rounded text-sm ${
                result.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <strong>{result.name}:</strong> {result.status}
                {result.error && <div>Error: {result.error}</div>}
                {result.data && (
                  <div>
                    Data: {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2).substring(0, 200) + '...' : result.data}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}