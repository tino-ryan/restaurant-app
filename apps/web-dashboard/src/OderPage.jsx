import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  addDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

import { db } from 'shared';

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

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
    if (!newTable || !newItemsText) return alert("Please provide table and items");

        const items = newItemsText
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
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
    } catch (err) {
        console.error('Error creating order:', err);
        alert('Failed to create order');
    }
    };



  const updateStatus = async (id, newStatus) => {
    try {
      const orderDoc = doc(db, 'order', id);
      await updateDoc(orderDoc, { status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <div style={styles.container}>
      <h2>📥 Staff Order Management</h2>
    <form onSubmit={handleCreateOrder} style={styles.form}>
      <h3>➕ Create New Order</h3>
        <input
          type="text"
          placeholder="Table Number"
          value={newTable}
          onChange={(e) => setNewTable(e.target.value)}
          style={styles.input}
      />
      <textarea
          placeholder="Items (e.g. Burger x2)"
          value={newItemsText}
          onChange={(e) => setNewItemsText(e.target.value)}
          rows={4}
          style={styles.input}
      />
      <button type="submit" style={styles.button}>Create Order</button>
    </form>


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

      {filteredOrders.map((order) => (
        <div key={order.id} style={styles.card}>
          <h3>🪑 Table {order.table}</h3>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Ordered:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
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
              <button
                onClick={() => updateStatus(order.id, 'in-progress')}
                style={styles.button}
              >
                Start
              </button>
            )}
            {order.status === 'in-progress' && (
              <button
                onClick={() => updateStatus(order.id, 'completed')}
                style={styles.button}
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  card: {
    border: '1px solid #ccc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonGroup: {
    marginTop: 10,
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#0e3e72',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    marginRight: 8,
  },
  form: {
    marginBottom: 24,
    backgroundColor: '#eef2f5',
    padding: 16,
    borderRadius: 8,
    },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },

};
