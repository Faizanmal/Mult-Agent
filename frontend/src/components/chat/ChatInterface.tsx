"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { InputBar } from '@/components/input/InputBar';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { Bot, User, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { 
    messages, 
    sendChatMessage, 
    connectionStatus, 
    isConnected,
    sessionId 
  } = useWebSocketContext();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      console.log('📤 ChatInterface: Sending message via WebSocket context');
      console.log('🔌 Connection status:', connectionStatus, 'isConnected:', isConnected);
      console.log('🆔 Session ID:', sessionId);
      if (isConnected && sendChatMessage) {
        sendChatMessage(content.trim());
      } else {
        // Add a system message to show the issue
        console.warn('❌ WebSocket not connected, adding system message');
        // In a real implementation, you might want to send via HTTP API as fallback
      }
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'agent':
        return <Bot className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageVariant = (type: string) => {
    switch (type) {
      case 'user':
        return 'default';
      case 'agent':
        return 'secondary';
      case 'system':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Agent Chat</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isConnected ? 'default' : 'destructive'}
              className="flex items-center space-x-1"
            >
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span className="text-xs">
                {connectionStatus}
              </span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              Session: {sessionId}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation with the multi-agent system</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getMessageVariant(message.type)} className="text-xs">
                          {message.agentName || message.sender}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm bg-muted/50 rounded-lg p-3">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t">
            <InputBar
              onSend={handleSendMessage}
              isLoading={false}
              placeholder={
                isConnected 
                  ? "Type your message..." 
                  : sessionId === 'initializing...' 
                  ? "Initializing session..."
                  : "Type your message (offline mode)..."
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}