'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define types for configuration schema
interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title?: string;
  description?: string;
  default?: any;
}

interface ConfigurationSchema {
  type?: string;
  properties?: Record<string, FieldSchema>;
  required?: string[];
}

interface PluginConfigurationProps {
  pluginName: string;
  configurationSchema: ConfigurationSchema;
  currentConfiguration: Record<string, any>;
  onSave: (config: Record<string, any>) => void;
  onCancel: () => void;
}

const PluginConfiguration: React.FC<PluginConfigurationProps> = ({
  pluginName,
  configurationSchema,
  currentConfiguration,
  onSave,
  onCancel,
}) => {
  const [configuration, setConfiguration] = useState(currentConfiguration);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (key: string, value: string | boolean | number | string[]) => {
    setConfiguration({
      ...configuration,
      [key]: value,
    });
    
    // Clear error for this field if it exists
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const validateConfiguration = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (configurationSchema.required) {
      for (const field of configurationSchema.required) {
        if (!configuration[field] || configuration[field] === '') {
          newErrors[field] = 'This field is required';
        }
      }
    }
    
    // Validate field types
    if (configurationSchema.properties) {
      for (const [field, fieldSchema] of Object.entries(configurationSchema.properties)) {
        const value = configuration[field];
        const type = fieldSchema.type;
        
        if (value !== undefined && value !== null && type) {
          switch (type) {
            case 'string':
              if (typeof value !== 'string') {
                newErrors[field] = 'Must be a string';
              }
              break;
            case 'number':
              if (typeof value !== 'number' && !/^-?\d+\.?\d*$/.test(value)) {
                newErrors[field] = 'Must be a number';
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean') {
                newErrors[field] = 'Must be a boolean';
              }
              break;
            case 'array':
              if (!Array.isArray(value)) {
                newErrors[field] = 'Must be an array';
              }
              break;
            case 'object':
              if (typeof value !== 'object' || Array.isArray(value)) {
                newErrors[field] = 'Must be an object';
              }
              break;
          }
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfiguration()) {
      onSave(configuration);
      toast({
        title: 'Configuration Saved',
        description: `Configuration for ${pluginName} has been saved successfully.`,
      });
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the configuration form.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setConfiguration(currentConfiguration);
    setErrors({});
    toast({
      title: 'Configuration Reset',
      description: 'Configuration has been reset to the last saved values.',
    });
  };

  const renderField = (key: string, fieldSchema: FieldSchema) => {
    const value = configuration[key] ?? '';
    const error = errors[key];
    
    switch (fieldSchema.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label htmlFor={key}>{fieldSchema.title || key}</Label>
            <Switch
              id={key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleInputChange(key, checked)}
            />
            {error && (
              <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-red-500 text-xs">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{fieldSchema.title || key}</Label>
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
              className={error ? 'border-red-500' : ''}
            />
            {fieldSchema.description && (
              <p className="text-sm text-muted-foreground">{fieldSchema.description}</p>
            )}
            {error && (
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
      
      case 'array':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{fieldSchema.title || key}</Label>
            <Textarea
              id={key}
              value={Array.isArray(value) ? value.join('\n') : value}
              onChange={(e) => handleInputChange(key, e.target.value.split('\n').filter(Boolean))}
              placeholder="Enter one item per line"
              rows={4}
              className={error ? 'border-red-500' : ''}
            />
            {fieldSchema.description && (
              <p className="text-sm text-muted-foreground">{fieldSchema.description}</p>
            )}
            {error && (
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{fieldSchema.title || key}</Label>
            <Textarea
              id={key}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={fieldSchema.description || `Enter ${key}`}
              rows={3}
              className={error ? 'border-red-500' : ''}
            />
            {fieldSchema.description && (
              <p className="text-sm text-muted-foreground">{fieldSchema.description}</p>
            )}
            {error && (
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Configure {pluginName}</CardTitle>
        </div>
        <CardDescription>
          Adjust the settings for this plugin according to your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(configurationSchema).length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Configuration Required</h3>
            <p className="text-muted-foreground">
              This plugin does not require any configuration settings.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {configurationSchema.properties &&
                Object.entries(configurationSchema.properties).map(([key, fieldSchema]) => (
                  <div key={key} className="relative">
                    {renderField(key, fieldSchema)}
                  </div>
                ))}
            </div>
            
            {configurationSchema.required && configurationSchema.required.length > 0 && (
              <div>
                <Label>Required Fields</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {configurationSchema.required.map((field: string) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PluginConfiguration;