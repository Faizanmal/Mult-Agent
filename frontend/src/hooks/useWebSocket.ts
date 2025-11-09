"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from './use-toast';

interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  sendMessage: (message: Record<string, unknown>) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
}

// Global singleton to prevent multiple connections
let globalWebSocket: WebSocket | null = null;
let globalConnectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
const globalMessageHandlers: Set<(message: WebSocketMessage) => void> = new Set();
const globalConnectHandlers: Set<() => void> = new Set();
const globalDisconnectHandlers: Set<() => void> = new Set();
const globalErrorHandlers: Set<(error: Event) => void> = new Set();
let connectionAttemptRef: NodeJS.Timeout | null = null;

// Prevent rapid connection attempts
const CONNECTION_THROTTLE_MS = 2000;
let lastConnectionAttempt = 0;

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>(globalConnectionStatus);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const isMountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 15; // Increased from 10 to 15
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlRef = useRef(url); // Store the URL for reconnection

  // Update URL ref when URL changes
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  // Register handlers globally
  useEffect(() => {
    if (onMessage) globalMessageHandlers.add(onMessage);
    if (onConnect) globalConnectHandlers.add(onConnect);
    if (onDisconnect) globalDisconnectHandlers.add(onDisconnect);
    if (onError) globalErrorHandlers.add(onError);

    return () => {
      if (onMessage) globalMessageHandlers.delete(onMessage);
      if (onConnect) globalConnectHandlers.delete(onConnect);
      if (onDisconnect) globalDisconnectHandlers.delete(onDisconnect);
      if (onError) globalErrorHandlers.delete(onError);
    };
  }, [onMessage, onConnect, onDisconnect, onError]);

  // Heartbeat mechanism to detect broken connections
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    // Send heartbeat every 25 seconds (reduced from 30)
    heartbeatIntervalRef.current = setInterval(() => {
      if (globalWebSocket?.readyState === WebSocket.OPEN) {
        try {
          globalWebSocket.send(JSON.stringify({ type: 'ping' }));
          
          // Set timeout to detect if pong is not received
          heartbeatTimeoutRef.current = setTimeout(() => {
            console.warn('Heartbeat timeout - connection may be broken, attempting to reconnect...');
            if (globalWebSocket) {
              globalWebSocket.close(1000, 'Heartbeat timeout');
            }
          }, 8000); // Reduced timeout to 8 seconds
        } catch (error) {
          console.error('Failed to send heartbeat:', error);
        }
      }
    }, 25000); // 25 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Clear any pending reconnection attempt
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Throttle connection attempts
    const now = Date.now();
    if (now - lastConnectionAttempt < CONNECTION_THROTTLE_MS) {
      console.log('Connection attempt throttled, waiting...');
      return;
    }
    lastConnectionAttempt = now;

    // Check if already connected or connecting
    if (globalWebSocket && (globalWebSocket.readyState === WebSocket.OPEN || globalWebSocket.readyState === WebSocket.CONNECTING)) {
      console.log('Using existing global WebSocket connection, state:', globalWebSocket.readyState);
      setConnectionStatus(globalConnectionStatus);
      if (globalWebSocket.readyState === WebSocket.OPEN) {
        globalConnectHandlers.forEach(handler => handler());
      }
      return;
    }

    // Don't attempt connection if URL is empty
    if (!urlRef.current || urlRef.current.trim() === '') {
      console.log('No WebSocket URL provided, skipping connection');
      setConnectionStatus('disconnected');
      return;
    }

    // Clear any pending connection attempt
    if (connectionAttemptRef) {
      clearTimeout(connectionAttemptRef);
      connectionAttemptRef = null;
    }

    try {
      // Use the URL as-is (should already be correct from WebSocketContext)
      const wsUrl = urlRef.current;
      console.log('Creating new global WebSocket connection to:', wsUrl);
      globalConnectionStatus = 'connecting';
      setConnectionStatus('connecting');
      
      globalWebSocket = new WebSocket(wsUrl);
      
      globalWebSocket.onopen = () => {
        console.log('WebSocket connected successfully to:', urlRef.current);
        globalConnectionStatus = 'connected';
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        if (isMountedRef.current) {
          setConnectionStatus('connected');
        }
        globalConnectHandlers.forEach(handler => {
          try {
            handler();
          } catch (error) {
            console.error('Error in connect handler:', error);
          }
        });
        
        // Start heartbeat for connection health monitoring
        startHeartbeat();
      };

      globalWebSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          // Handle pong messages for heartbeat
          if (message.type === 'pong') {
            console.log('Heartbeat pong received - connection is alive');
            if (heartbeatTimeoutRef.current) {
              clearTimeout(heartbeatTimeoutRef.current);
              heartbeatTimeoutRef.current = null;
            }
            return;
          }
          
          if (isMountedRef.current) {
            setLastMessage(message);
          }
          
          globalMessageHandlers.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              console.error('Error in message handler:', error);
            }
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      globalWebSocket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        stopHeartbeat();
        globalConnectionStatus = 'disconnected';
        globalWebSocket = null;
        
        if (isMountedRef.current) {
          setConnectionStatus('disconnected');
        }
        
        globalDisconnectHandlers.forEach(handler => {
          try {
            handler();
          } catch (error) {
            console.error('Error in disconnect handler:', error);
          }
        });

        // Attempt to reconnect if the connection was closed unexpectedly
        // Always attempt to reconnect unless explicitly closed with code 1000 (normal closure)
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          // More aggressive exponential backoff with max 20 seconds
          const reconnectDelay = Math.min(1000 * 1.5 ** reconnectAttemptsRef.current, 20000);
          console.log(`Attempting to reconnect in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && globalConnectionStatus !== 'connected') {
              connect();
            }
          }, reconnectDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached. Giving up.');
          globalConnectionStatus = 'error';
          if (isMountedRef.current) {
            setConnectionStatus('error');
          }
          toast({
            title: "Connection Failed",
            description: "Unable to establish WebSocket connection after multiple attempts.",
            variant: "destructive",
          });
        }
      };

      globalWebSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        globalConnectionStatus = 'error';
        stopHeartbeat();
        
        // Don't set globalWebSocket to null here, let onclose handle it
        // globalWebSocket = null;
        
        if (isMountedRef.current) {
          setConnectionStatus('error');
        }
        
        globalErrorHandlers.forEach(handler => {
          try {
            handler(error);
          } catch (handlerError) {
            console.error('Error in error handler:', handlerError);
          }
        });
        
        // Attempt to reconnect on error
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const reconnectDelay = Math.min(1000 * 1.5 ** reconnectAttemptsRef.current, 20000);
          console.log(`Attempting to reconnect in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && globalConnectionStatus !== 'connected') {
              connect();
            }
          }, reconnectDelay);
        } else {
          console.error('Max reconnection attempts reached. Giving up.');
          toast({
            title: "Connection Failed",
            description: "Unable to establish WebSocket connection after multiple attempts.",
            variant: "destructive",
          });
        }
      };

    } catch (error) {
      globalConnectionStatus = 'error';
      stopHeartbeat();
      setConnectionStatus('error');
      console.error('Failed to connect to WebSocket:', error);
      
      // Attempt to reconnect on error
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const reconnectDelay = Math.min(1000 * 1.5 ** reconnectAttemptsRef.current, 20000);
        console.log(`Attempting to reconnect in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && globalConnectionStatus !== 'connected') {
            connect();
          }
        }, reconnectDelay);
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to establish WebSocket connection.",
          variant: "destructive",
        });
      }
    }
  }, [startHeartbeat, stopHeartbeat]);

  const disconnect = useCallback(() => {
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (connectionAttemptRef) {
      clearTimeout(connectionAttemptRef);
      connectionAttemptRef = null;
    }

    // Stop heartbeat
    stopHeartbeat();

    // Reset reconnect attempts
    reconnectAttemptsRef.current = 0;

    if (globalWebSocket) {
      globalWebSocket.close();
      globalWebSocket = null;
    }
    globalConnectionStatus = 'disconnected';
    setConnectionStatus('disconnected');
  }, [stopHeartbeat]);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (globalWebSocket?.readyState === WebSocket.OPEN) {
      globalWebSocket.send(JSON.stringify(message));
    } else {
      console.warn('Global WebSocket is not connected. Message not sent:', message);
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please check your connection.",
        variant: "destructive",
      });
      
      // Try to reconnect if not connected
      if (globalConnectionStatus !== 'connecting' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        connect();
      }
    }
  }, [connect]);

  // Single connection attempt on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (globalConnectionStatus === 'disconnected') {
        connect();
      } else {
        setConnectionStatus(globalConnectionStatus);
      }
    }, 100); // Small delay to let React settle

    return () => {
      clearTimeout(timeoutId);
      isMountedRef.current = false;
      stopHeartbeat();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  return {
    sendMessage,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
  };
}