import { useEffect, useState } from 'react';
import { subscribeToContacts } from '../services/contacts';
import type { Contact } from '../types';

export const useContacts = (userId: string | undefined, connectionId: string | undefined) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !connectionId) {
      setContacts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToContacts(userId, connectionId, (data) => {
      setContacts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId, connectionId]);

  return { contacts, loading };
};
