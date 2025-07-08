import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  addDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from 'shared';
import { useTheme } from './themeContext';

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState('');

  const { theme } = useTheme();
  const ordersRef = collection(db, 'order');

  useEffect(() => {
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, []);

  const [newTable, setNewTable] = useState('');
  const [newItemsText, setNewItemsText] = useState('');

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newTable || !newItemsText) return setToast('Please provide table and items');

    const items = newItemsText
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [itemPart, notePart] = line.split('|');
        const [name, qty] = itemPart.trim().split('x');
        return {
          name: name.trim(),
          quantity: parseInt(qty || '1'),
          notes: notePart ? notePart.trim() : '',
        };
      });

    try {
      await addDoc(ordersRef, {
        table: newTable,
        items,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setNewTable('');
      setNewItemsText('');
      setToast('Order created successfully');
    } catch (err) {
      console.error('Error creating order:', err);
      setToast('Failed to create order');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const orderDoc = doc(db, 'order', id);
      await updateDoc(orderDoc, { status: newStatus });
      setToast(`Order marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      setToast('Failed to update status');
    }
  };

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  const relativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp.toDate().getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  const styles = {
    container: {
      padding: 20,
      maxWidth: 1000,
      margin: '0 auto',
      fontFamily: 'sans-serif',
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: '100vh',
    },
    form: {
      marginBottom: 24,
      backgroundColor: '#f0f4f8',
      padding: 16,
      borderRadius: 8,
      maxWidth: 600,
    },
    input: {
      width: '100%',
      padding: 10,
      marginBottom: 10,
      fontSize: 16,
      borderRadius: 4,
      border: `1px solid ${theme.primary}33`,
      boxSizing: 'border-box',
    },
    button: {
      padding: '8px 16px',
      backgroundColor: theme.primary,
      marginBottom: 10,
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      marginRight: 8,
    },
    cardGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
    },
    card: {
      border: `1px solid ${theme.primary}55`,
      borderRadius: 8,
      padding: 12,
      backgroundColor: '#fff',
      width: 'calc(33.333% - 16px)',
      minWidth: 250,
      boxSizing: 'border-box',
    },
    buttonGroup: {
      marginTop: 10,
      marginBottom: 10,
    },
    toast: {
      backgroundColor: '#000a',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: 8,
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 999,
    },
  };

  return (
    <div style={styles.container}>
      <h2>📥 Staff Order Management</h2>

      <button onClick={() => setShowCreateForm(!showCreateForm)} style={styles.button}>
        {showCreateForm ? 'Hide' : '➕ New Order'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreateOrder} style={styles.form}>
          <h3>Create Order</h3>
          <input
            type="text"
            placeholder="Table Number"
            value={newTable}
            onChange={(e) => setNewTable(e.target.value)}
            style={styles.input}
          />
          <textarea
            placeholder="Items (e.g. Burger x2 | No pickles)"
            value={newItemsText}
            onChange={(e) => setNewItemsText(e.target.value)}
            rows={4}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Create Order
          </button>
        </form>
      )}

      <div style={{ marginBottom: 16 }}>
        <label>Status Filter: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={styles.cardGrid}>
        {filteredOrders.map((order) => (
          <div key={order.id} style={styles.card}>
            <h4>🪑 Table {order.table}</h4>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Time:</strong> {relativeTime(order.createdAt)}</p>
            <ul>
              {(order.items || []).map((item, idx) => (
                <li key={idx}>
                  {item.name} × {item.quantity}
                  {item.notes && ` (${item.notes})`}
                </li>
              ))}
            </ul>

            <div style={styles.buttonGroup}>
              {order.status === 'pending' && (
                <button onClick={() => updateStatus(order.id, 'in-progress')} style={styles.button}>
                  Start
                </button>
              )}
              {order.status === 'in-progress' && (
                <button onClick={() => updateStatus(order.id, 'completed')} style={styles.button}>
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}