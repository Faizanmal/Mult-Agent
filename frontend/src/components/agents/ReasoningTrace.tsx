"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ReasoningStep } from '@/contexts/AgentContext';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronRight, Zap, Brain, Eye, Code } from 'lucide-react';
import { useState } from 'react';

interface ReasoningTraceProps {
  steps: ReasoningStep[];
}

export default function ReasoningTrace({ steps }: ReasoningTraceProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (step: string) => {
    if (step.toLowerCase().includes('reasoning') || step.toLowerCase().includes('thinking')) {
      return <Brain className="h-4 w-4 text-purple-500" />;
    }
    if (step.toLowerCase().includes('vision') || step.toLowerCase().includes('image')) {
      return <Eye className="h-4 w-4 text-blue-500" />;
    }
    if (step.toLowerCase().includes('tool') || step.toLowerCase().includes('api')) {
      return <Zap className="h-4 w-4 text-orange-500" />;
    }
    return <Code className="h-4 w-4 text-green-500" />;
  };

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No reasoning steps yet. Agent reasoning will appear here during processing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card key={step.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    {getStepIcon(step.step)}
                    <div className="text-left">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {step.step}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {formatDistanceToNow(step.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {expandedSteps.has(step.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Reasoning
                      </h5>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg">
                        {step.reasoning}
                      </p>
                    </div>
                    
                    {step.toolCalls && step.toolCalls.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                          Tool Calls
                        </h5>
                        <div className="space-y-2">
                          {step.toolCalls.map((toolCall, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Zap className="h-4 w-4 text-orange-500" />
                                <Badge variant="secondary" className="text-xs">
                                  {toolCall.tool}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <h6 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Input
                                  </h6>
                                  <pre className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto">
                                    {JSON.stringify(toolCall.input, null, 2)}
                                  </pre>
                                </div>
                                
                                <div>
                                  <h6 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Output
                                  </h6>
                                  <pre className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto">
                                    {JSON.stringify(toolCall.output, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}