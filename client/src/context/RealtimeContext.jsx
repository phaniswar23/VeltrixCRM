import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';

const RealtimeContext = createContext(null);

export const RealtimeProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const eventSourceRef = useRef(null);
  const listenersRef = useRef(new Map());
  const boundEventsRef = useRef(new Set());

  const bindEvent = (es, type) => {
    if (!es || boundEventsRef.current.has(type)) return;
    boundEventsRef.current.add(type);
    es.addEventListener(type, (e) => {
      try {
        const data = JSON.parse(e.data);
        handleEvent(type, data);
      } catch (err) {
        handleEvent(type, e.data);
      }
    });
  };

  const handleEvent = (type, data) => {
    setLastEvent({ type, data, timestamp: Date.now() });
    const callbacks = listenersRef.current.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in realtime listener for ${type}:`, err);
        }
      });
    }
  };

  const addEventListener = (eventType, callback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType).add(callback);

    if (eventSourceRef.current) {
      bindEvent(eventSourceRef.current, eventType);
    }

    return () => {
      const set = listenersRef.current.get(eventType);
      if (set) {
        set.delete(callback);
      }
    };
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    boundEventsRef.current.clear();

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const sseUrl = `${apiUrl}/api/realtime/stream?token=${encodeURIComponent(token)}`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      // Standard CRM and messaging events
      const standardEvents = [
        'DEAL_CREATED',
        'DEAL_UPDATED',
        'DEAL_DELETED',
        'CUSTOMER_CREATED',
        'CUSTOMER_UPDATED',
        'CUSTOMER_DELETED',
        'CUSTOMERS_IMPORTED',
        'TASK_CREATED',
        'INVOICE_CREATED',
        'INVOICE_UPDATED',
        'TIMELINE_EVENT_ADDED',
        'NOTIFICATION_RECEIVED',
        'NEW_MESSAGE',
        'USER_TYPING',
        'CONVERSATION_CLEARED',
      ];

      standardEvents.forEach((evType) => bindEvent(es, evType));

      // Also bind any currently registered listeners
      for (const evType of listenersRef.current.keys()) {
        bindEvent(es, evType);
      }

      es.onerror = () => {
        setIsConnected(false);
      };

      return () => {
        es.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      };
    } catch (err) {
      console.error('SSE initialization error:', err);
    }
  }, [isAuthenticated, token]);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastEvent, addEventListener }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);

