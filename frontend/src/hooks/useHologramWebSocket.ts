/**
 * Hologram WebSocket Hook
 * Manages real-time communication with the holographic command center
 */

import { useRef, useCallback, useEffect } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  [key: string]: any;
}

interface WebSocketCallbacks {
  onMessage: (message: WebSocketMessage) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onError?: (error: Event) => void;
}

interface UseHologramWebSocketReturn {
  connect: (callbacks: WebSocketCallbacks) => void;
  disconnect: () => void;
  sendCommand: (command: string, params?: any) => Promise<void>;
  subscribe: (topics: string[]) => void;
  unsubscribe: (topics: string[]) => void;
  isConnected: boolean;
}

export const useHologramWebSocket = (): UseHologramWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef<WebSocketCallbacks | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback((callbacks: WebSocketCallbacks) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    callbacksRef.current = callbacks;

    try {
      // Determine WebSocket URL based on environment
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/hologram/stream`;

      console.log('🔗 Connecting to Hologram WebSocket:', wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        reconnectAttemptsRef.current = 0;
        callbacks.onConnect();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📡 WebSocket message received:', message.type);
          callbacks.onMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        callbacks.onDisconnect();

        // Attempt to reconnect if not a manual disconnect
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(callbacks);
          }, reconnectDelay * reconnectAttemptsRef.current);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        callbacks.onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      callbacks.onError?.(error as Event);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    callbacksRef.current = null;
    console.log('🔌 WebSocket disconnected manually');
  }, []);

  const sendCommand = useCallback(async (command: string, params: any = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const message = {
        type: 'command',
        command,
        params,
        timestamp: new Date().toISOString()
      };

      try {
        wsRef.current.send(JSON.stringify(message));
        console.log('📤 Command sent:', command, params);
        resolve();
      } catch (error) {
        console.error('Failed to send command:', error);
        reject(error);
      }
    });
  }, []);

  const subscribe = useCallback((topics: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    const message = {
      type: 'subscribe',
      topics,
      timestamp: new Date().toISOString()
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      console.log('📝 Subscribed to topics:', topics);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  }, []);

  const unsubscribe = useCallback((topics: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot unsubscribe: WebSocket not connected');
      return;
    }

    const message = {
      type: 'unsubscribe',
      topics,
      timestamp: new Date().toISOString()
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      console.log('📝 Unsubscribed from topics:', topics);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }, []);

  const isConnected = wsRef.current?.readyState === WebSocket.OPEN;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Ping/pong for connection health
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendCommand('ping', {});
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, sendCommand]);

  return {
    connect,
    disconnect,
    sendCommand,
    subscribe,
    unsubscribe,
    isConnected
  };
};

export default useHologramWebSocket;

