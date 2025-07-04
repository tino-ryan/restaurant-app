import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from 'shared';

export default function WaiterRequestsPage() {
  const [calls, setCalls] = useState([]);
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false); // 🔊 toggle state

  useEffect(() => {
    const q = query(
      collection(db, 'waiter_calls'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCalls(items);

      const newRequests = items.filter(item => !notifiedIds.has(item.id));

      if (newRequests.length > 0) {
        if (soundEnabled) {
          const audio = new Audio('/sound.wav');
          audio.play().catch(err => {
            console.error('Audio failed to play:', err.message);
          });
        }

        alert(`🛎️ New waiter request from Table ${newRequests[0].table}`);

        const updatedIds = new Set(notifiedIds);
        newRequests.forEach(r => updatedIds.add(r.id));
        setNotifiedIds(updatedIds);
        setUnreadCount(prev => prev + newRequests.length);
      }
    });

    return () => unsubscribe();
  }, [notifiedIds, soundEnabled]);

  const markHandled = async (id) => {
    try {
      const ref = doc(db, 'waiter_calls', id);
      await updateDoc(ref, { status: 'handled' });
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (e) {
      alert('Failed to update');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>
          🛎️ Waiter Requests{' '}
          {unreadCount > 0 && (
            <span style={{ color: 'red', fontSize: 18, marginLeft: 8 }}>
              🔴 {unreadCount}
            </span>
          )}
        </h2>
        <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ padding: '6px 12px' }}>
          {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
        </button>
      </div>

      {calls.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul>
          {calls.map(call => (
            <li key={call.id} style={{ marginBottom: 10 }}>
              <strong>Table {call.table}</strong> –{' '}
              {new Date(call.timestamp?.toDate?.()).toLocaleString()}
              <button
                onClick={() => markHandled(call.id)}
                style={{ marginLeft: 10 }}
              >
                Mark Handled
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
