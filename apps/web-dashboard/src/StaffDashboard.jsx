import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from 'shared';
import { useTheme } from './themeContext';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const menuRef = collection(db, 'menu');
      const q = query(menuRef, where('active', '==', true));
      const snapshot = await getDocs(q);
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchMenuItems();

    const ordersRef = collection(db, 'order');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, snapshot => {
      const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orderData);
    });

    const requestsRef = collection(db, 'waiter_calls');
    const requestsQuery = query(requestsRef, where('status', '==', 'pending'));
    const unsubscribeRequests = onSnapshot(requestsQuery, snapshot => {
      const requestData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestData);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRequests();
    };
  }, []);

  const orderStats = {
    new: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
  };

  const menuStats = {
    total: menuItems.length,
    lowStock: menuItems.filter(item => item.stock && item.stock <= 3).length,
  };

  const requestStats = {
    pending: requests.length,
    unresolved: 1, // Placeholder, replace with actual unresolved logic if available
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: '100vh',
      padding: '20px 40px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 40,
    },
    welcome: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    logout: {
      background: 'transparent',
      border: 'none',
      color: theme.danger,
      cursor: 'pointer',
      fontSize: 16,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 20,
    },
    card: {
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
    },
    cardHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    button: {
      marginTop: 10,
      backgroundColor: theme.primary,
      color: '#fff',
      padding: '8px 12px',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.welcome}> Welcome, Staff Member</div>
        <button style={styles.logout} onClick={() => navigate('/login')}>Log out</button>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}> Live Orders</div>
          <p>{orderStats.new} New Orders</p>
          <p>{orderStats.inProgress} In Progress</p>
          <button style={styles.button} onClick={() => navigate('/orders')}>View All Orders</button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}> Menu Management</div>
          <p>{menuStats.total} Items on Menu</p>
          <p>{menuStats.lowStock} Low Stock</p>
          <button style={styles.button} onClick={() => navigate('/menu')}>Go to Menu Editor</button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}> Performance & Insights</div>
          <p>Today's Sales: R0.00</p>
          <p>3 Tables Occupied</p>
          <button style={styles.button} onClick={() => navigate('/stats')}>View Reports</button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}> Staff & Requests</div>
          <p>{requestStats.pending} New Requests</p>
          <p>{requestStats.unresolved} Unresolved Issues</p>
          <button style={styles.button} onClick={() => navigate('/waiter-requests')}>View Requests</button>
        </div>
      </div>
    </div>
  );
}
