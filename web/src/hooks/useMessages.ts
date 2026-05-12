import { useEffect, useState } from 'react';
import { subscribeToMessages } from '../services/messages';
import type { Message } from '../types';

export const useMessages = (userId: string | undefined, connectionId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !connectionId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToMessages(userId, connectionId, (data) => {
      setMessages(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId, connectionId]);

  return { messages, loading };
};
