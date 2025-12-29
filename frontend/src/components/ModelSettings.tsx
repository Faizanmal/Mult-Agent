'use client';

import { useState, useEffect } from 'react';
import { useMultiModel, ModelPreference } from '@/hooks/useMultiModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ModelsData {
  providers: Record<string, { models: string[] }>;
}

export function ModelSettings() {
  const { getPreferences, updatePreferences, getModels, loading } = useMultiModel();
  const [preferences, setPreferences] = useState<ModelPreference | null>(null);
  const [models, setModels] = useState<ModelsData | null>(null);

  const defaultPreferences: ModelPreference = {
    priority: 'balanced',
    fallback_enabled: true,
    max_cost_per_request: 0.5,
  };

  useEffect(() => {
    const fetchData = async () => {
      const [prefs, modelList] = await Promise.all([
        getPreferences(),
        getModels(),
      ]);
      setPreferences(prefs);
      setModels(modelList);
    };
    fetchData();
  }, [getPreferences, getModels]);

  const handleSave = async () => {
    if (!preferences) return;

    const success = await updatePreferences(preferences);
    if (success) {
      toast.success('Preferences saved');
    } else {
      toast.error('Failed to save preferences');
    }
  };

  if (loading && !preferences) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={preferences?.priority || 'balanced'}
              onValueChange={(value) =>
                setPreferences({ ...(preferences || defaultPreferences), priority: value as 'cost' | 'balanced' | 'quality' })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cost" id="cost" />
                <Label htmlFor="cost">Cost - Optimize for lowest cost</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced">Balanced - Balance cost and quality</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quality" id="quality" />
                <Label htmlFor="quality">Quality - Best available model</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preferred Provider */}
          {models && (
            <div className="space-y-2">
              <Label>Preferred Provider (optional)</Label>
              <RadioGroup
                value={preferences?.preferred_provider || 'auto'}
                onValueChange={(value) =>
                  setPreferences({
                    ...(preferences || defaultPreferences),
                    preferred_provider: value === 'auto' ? undefined : value,
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto">Auto - Let system choose</Label>
                </div>
                {Object.keys(models.providers || {}).map((provider) => (
                  <div key={provider} className="flex items-center space-x-2">
                    <RadioGroupItem value={provider} id={provider} />
                    <Label htmlFor={provider} className="capitalize">
                      {provider}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Max Cost */}
          <div className="space-y-2">
            <Label>Max Cost Per Request ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={preferences?.max_cost_per_request || 0.5}
              onChange={(e) =>
                setPreferences((prev) => ({ ...(prev || defaultPreferences), max_cost_per_request: parseFloat(e.target.value) }))
              }
            />
          </div>

          {/* Fallback */}
          <div className="flex items-center justify-between">
            <Label>Enable Fallback</Label>
            <Switch
              checked={preferences?.fallback_enabled ?? true}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...(prev || defaultPreferences), fallback_enabled: checked }))
              }
            />
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={loading} className="w-full">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Model Stats */}
      {models && (
        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(models.providers || {}).map(([provider, data]: [string, { models: string[] }]) => (
                <div key={provider}>
                  <h3 className="font-medium capitalize mb-2">{provider}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {data.models?.map((model: string) => (
                      <div key={model} className="pl-4">
                        • {model}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
