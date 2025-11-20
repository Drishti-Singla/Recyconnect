import { useState, useEffect, useCallback, useRef } from 'react';

export const useRealTimeUpdates = (onUpdate) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    try {
      // WebSocket connection - adjust URL based on your backend configuration
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastUpdate({
            ...data,
            timestamp: new Date().toISOString()
          });
          
          // Call the provided update handler
          if (onUpdate && typeof onUpdate === 'function') {
            onUpdate(data);
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (connectionError) {
      console.error('Failed to establish WebSocket connection:', connectionError);
      setError('Failed to connect to real-time updates');
    }
  }, [onUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (sendError) {
        console.error('Error sending WebSocket message:', sendError);
        return false;
      }
    }
    return false;
  }, []);

  // Simulate real-time updates for development/demo purposes
  const simulateUpdates = useCallback(() => {
    const updateTypes = [
      'NEW_USER_REGISTRATION',
      'NEW_ITEM_POSTED',
      'ITEM_DONATED',
      'NEW_CONCERN_SUBMITTED',
      'ITEM_FLAGGED',
      'USER_REPORT_SUBMITTED'
    ];

    const generateRandomUpdate = () => {
      const type = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      const data = {
        type,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        data: {
          message: `Simulated ${type.toLowerCase().replace(/_/g, ' ')} event`,
          userId: Math.floor(Math.random() * 1000),
          itemId: type.includes('ITEM') ? Math.floor(Math.random() * 500) : null
        }
      };

      setLastUpdate(data);
      if (onUpdate && typeof onUpdate === 'function') {
        onUpdate(data);
      }
    };

    // Generate a random update every 10-30 seconds for demo purposes
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of update
        generateRandomUpdate();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [onUpdate]);

  useEffect(() => {
    // For development, you can choose to use WebSocket or simulation
    const useWebSocket = process.env.REACT_APP_USE_WEBSOCKET === 'true';
    
    if (useWebSocket) {
      connect();
    } else {
      // Use simulation for demo purposes
      setIsConnected(true);
      const cleanup = simulateUpdates();
      return cleanup;
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, simulateUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastUpdate,
    error,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};