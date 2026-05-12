import { useEffect, useState } from 'react';
import { subscribeToConnections } from '../services/connections';
import type { Connection } from '../types';

export const useConnections = (userId: string | undefined) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setConnections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToConnections(userId, (data) => {
      setConnections(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  return { connections, loading };
};
