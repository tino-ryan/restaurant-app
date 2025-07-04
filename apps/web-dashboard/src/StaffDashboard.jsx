import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1>🍽️ Staff Dashboard</h1>
      <div style={styles.grid}>
        <button style={styles.card} onClick={() => navigate('/orders')}>
          🧾 Manage Orders
        </button>
        <button style={styles.card} onClick={() => navigate('/menu')}>
          📋 Edit Menu
        </button>
        <button style={styles.card} onClick={() => navigate('/stats')}>
          📊 View Stats
        </button>
        <button style={{ ...styles.card, backgroundColor: '#c0392b' }} onClick={() => navigate('/login')}>
          🔒 Logout
        </button>

        <button style={styles.card} onClick={() => navigate('/waiter-requests')}>
        🛎️ Waiter Requests
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 40,
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginTop: 40,
  },
  card: {
    padding: '30px 20px',
    fontSize: 18,
    backgroundColor: '#0e3e72',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};
