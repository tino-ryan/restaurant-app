import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, query, where, Timestamp
} from 'firebase/firestore';
import { db } from 'shared/firebaseConfig';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { useTheme } from './themeContext';

export default function PerformanceInsights() {
  const { theme } = useTheme();
  const [todaySales, setTodaySales] = useState(0);
  const [tablesToday, setTablesToday] = useState(0);
  const [popularItems, setPopularItems] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [busiestHours, setBusiestHours] = useState([]);

  useEffect(() => {
    const fetchTodayMetrics = async () => {
      const billingRef = collection(db, 'billing_complete');
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const q = query(billingRef, where('settledAt', '>=', Timestamp.fromDate(start)), where('settledAt', '<', Timestamp.fromDate(end)));
      const snapshot = await getDocs(q);

      let total = 0;
      const tables = new Set();

      snapshot.forEach(doc => {
        const data = doc.data();
        total += data.totalPaid;
        tables.add(data.table);
      });

      setTodaySales(total.toFixed(2));
      setTablesToday(tables.size);
    };

    const fetchPopularItems = async () => {
      const orderRef = collection(db, 'order');
      const q = query(orderRef, where('status', '==', 'completed'));
      const snapshot = await getDocs(q);

      const itemCounts = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.items) {
          data.items.forEach(item => {
            const name = item.name;
            itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
          });
        }
      });

      const sortedItems = Object.entries(itemCounts)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty);

      setPopularItems(sortedItems);
    };

    const fetchMonthlyStats = async () => {
      const billingRef = collection(db, 'billing_complete');
      const snapshot = await getDocs(billingRef);

      const monthlyMap = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.settledAt.toDate();
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!monthlyMap[key]) monthlyMap[key] = { month: key, total: 0 };
        monthlyMap[key].total += data.totalPaid;
      });

      const chartArr = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
      setMonthlyStats(chartArr);
    };

    const fetchBusiestHours = async () => {
      const billingRef = collection(db, 'billing_complete');
      const snapshot = await getDocs(billingRef);

      const hourMap = Array(24).fill(0);

      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.settledAt.toDate();
        const hour = date.getHours();
        hourMap[hour]++;
      });

      const chartArr = hourMap.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: count
      }));

      setBusiestHours(chartArr);
    };

    fetchTodayMetrics();
    fetchPopularItems();
    fetchMonthlyStats();
    fetchBusiestHours();
  }, []);

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: '100vh',
      padding: '20px 16px',
      boxSizing: 'border-box',
    },
    section: {
      marginBottom: 40,
    },
    sectionHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    card: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 12,
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      marginBottom: 24,
    },
    bigNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.primary,
      margin: '4px 0',
    },
    subLabel: {
      fontSize: 14,
      color: '#555',
    },
    chartContainer: {
      width: '100%',
      height: 300,
    },
    statRow: {
      display: 'flex',
      gap: 32,
      flexWrap: 'wrap',
      marginBottom: 24,
    },
    statCard: {
      flex: '1 1 200px',
      ...this?.card,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.sectionHeader}>📈 Performance & Insights</h1>

      {/* Key Metrics */}
      <div style={styles.statRow}>
        <div style={styles.card}>
          <p style={styles.subLabel}>Today's Sales</p>
          <p style={styles.bigNumber}>R{todaySales}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.subLabel}>Tables Occupied Today</p>
          <p style={styles.bigNumber}>{tablesToday}</p>
        </div>
      </div>

      {/* Most Popular */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>🔥 Most Popular Items</h2>
        <div style={styles.card}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularItems.slice(0, 5)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Least Popular */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>❄️ Least Popular Items</h2>
        <div style={styles.card}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularItems.slice(-5)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>📅 Monthly Revenue</h2>
        <div style={styles.card}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Busiest Times */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>⏰ Busiest Times of Day</h2>
        <div style={styles.card}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={busiestHours}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
