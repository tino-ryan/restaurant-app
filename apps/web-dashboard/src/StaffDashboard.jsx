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
      padding: '20px 16px', // was 20px 40px
      boxSizing: 'border-box', // ensure padding is included in width
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
    },

    card: {
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      maxWidth: '100%', // important for mobile
      wordWrap: 'break-word', // avoids overflow
    },
    highlightedCard: {
      padding: 24,
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      backgroundColor: theme.primary || '#fef9f2',
    },
    cardHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    hcardHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#fff'
    },
    bigNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.primary,
      margin: '4px 0',
    },
    hbigNumber:{
      fontSize :32,
      fontWeight: 'bold',
      color: '#fff',
      margin: '4px 0',
    },
    bigNumberRow: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      marginBottom: 10,
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #f0f2f5",
      padding: "12px 16px",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 40,
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      color: "#111418",
      flexShrink: 1,
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      color: "#111418",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      flexWrap: "wrap",
      overflowX: "auto",
      flexShrink: 1,
      minWidth: 0,
    },

  logoSize: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 1.2,
    letterSpacing: "-0.015em",
  },


    subLabel: {
      fontSize: 14,
      color: '#555',
      marginBottom: 8,
    },
    hsubLabel: {
      fontSize: 14,
      color: '#fff',
      marginBottom: 8,
    },
    hbutton: {
      marginTop: 'auto',
      backgroundColor: '#fff',
      color: theme.primary,
      padding: '8px 12px',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      alignSelf: 'flex-start',
    },

    button: {
      marginTop: 'auto',
      backgroundColor: theme.primary,
      color: '#fff',
      padding: '8px 12px',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      alignSelf: 'flex-start',
    },
  };
  const NAV_LINKS = ["Dashboard", "Orders", "Menu", "Staff", "Reports"];

  return (
    <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoSize}>
              {/* Inline SVG for logo */}
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                color="#111418"
              >
                <path
                  d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 style={styles.headerTitle}>DineEase</h2>
          </div>

          <nav style={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {link}
              </a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button
              aria-label="Notifications"
              style={{
                backgroundColor: "#f0f2f5",
                borderRadius: 12,
                height: 40,
                width: 40,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#111418",
              }}
            >
              {/* Bell icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
              </svg>
            </button>
            <div
              style={{
                ...styles.avatar,
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuABiqx1vqHjahqEPOo7mtjvTSK0PLeXpPRcsshRzHrttvAjkNtrR69IVM8WdmYtOKY-MxQlXqfW-v4wMJ7xMYUh7lLo7-UZzZor76BnWk6xPxNME0HHLUstJFQ_Wc3cV7tmoDFpLHSalzsULCzKXaz9M-RDyzVhuWkRRmXWhuo3pQwucowcRKGJZCOtZqGGw7znGrH0sH09XRvjX1wblytOwou_bpdwGuYMLMv86g3u1MWM669E6UF436rvhLp6NHFeF7s25x8QGV0")',
              }}
              aria-label="User Avatar"
            />
          </div>
        </header>


      <div style={styles.grid}>
        {/* Highlighted: Live Orders */}
        <div style={{ ...styles.card, ...styles.highlightedCard }}>
          <div style={styles.hcardHeader}>Live Orders</div>
          <div style={styles.bigNumberRow}>
            <p style={styles.hbigNumber}>{orderStats.new}</p>
            <p style={styles.hsubLabel}>New Orders</p>
          </div>
          <div style={styles.bigNumberRow}>
            <p style={styles.hbigNumber}>{orderStats.inProgress}</p>
            <p style={styles.hsubLabel}>In Progress</p>
          </div>
          <button style={styles.hbutton} onClick={() => navigate('/orders')}>
            View All Orders
          </button>
        </div>

        {/* Highlighted: Waiter Requests */}
        <div style={{ ...styles.card, ...styles.highlightedCard }}>
          <div style={styles.hcardHeader}>Staff Requests</div>
          <div style={styles.bigNumberRow}>
            <p style={styles.hbigNumber}>{requestStats.pending}</p>
            <p style={styles.hsubLabel}>New Requests</p>
          </div>
          <div style={styles.bigNumberRow}>
            <p style={styles.hbigNumber}>{requestStats.unresolved}</p>
            <p style={styles.hsubLabel}>Unresolved Issues</p>
          </div>
          <button style={styles.hbutton} onClick={() => navigate('/waiter-requests')}>
            View Requests
          </button>
        </div>

        {/* Menu Management */}
        <div style={styles.card}>
          <div style={styles.cardHeader}> Menu Management</div>
          <div style={styles.bigNumberRow}>
            <p style={styles.bigNumber}>{menuStats.total}</p>
            <p style={styles.subLabel}>Items on Menu</p>
          </div>
          <div style={styles.bigNumberRow}>
            <p style={styles.bigNumber}>{menuStats.lowStock}</p>
            <p style={styles.subLabel}>Low Stock Items</p>
          </div>
          <button style={styles.button} onClick={() => navigate('/menu')}>
            Go to Menu Editor
          </button>
        </div>

        {/* Performance */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>Performance & Insights</div>
          <div style={styles.bigNumberRow}>
            <p style={styles.bigNumber}>R0.00</p>
            <p style={styles.subLabel}>Today's Sales</p>
          </div>
          <div style={styles.bigNumberRow}>
            <p style={styles.bigNumber}>3</p>
            <p style={styles.subLabel}>Tables Occupied</p>
          </div>
          <button style={styles.button} onClick={() => navigate('/performance-insights')}>
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}
