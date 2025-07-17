import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'shared';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './themeContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const themeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'fineDining', label: 'Fine Dining' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { theme, setThemeName, themeName } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err.message);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.page(theme), fontFamily: theme.font }}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            color={theme.primary}
          >
            <path
              d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"
              fill="currentColor"
            />
          </svg>
          <h2 style={{ ...styles.headerTitle, color: theme.primary }}>DineEase</h2>
        </div>
      </header>

      <div style={{ ...styles.card(theme), borderColor: theme.primary }}>
        {/* THEME SELECTOR */}
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="theme-select"
            style={{ color: theme.text, fontWeight: 'bold', marginRight: 10 }}
          >
            Select Theme:
          </label>
          <select
            id="theme-select"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            style={{
              padding: 6,
              borderRadius: 6,
              border: `1px solid ${theme.primary}`,
              backgroundColor: theme.card,
              color: theme.text,
              fontFamily: theme.font,
              cursor: 'pointer',
            }}
          >
            {themeOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <h2 style={{ ...styles.title, color: theme.primary }}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to access your dashboard</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <FaEnvelope style={styles.icon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <FaLock style={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button(theme),
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}


const styles = {
page: (theme) => ({
  backgroundColor: theme.background,
  color: theme.text,
  minHeight: '100vh',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: theme.backgroundImage || 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}),
  header: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    maxWidth: 900,
    padding: '20px 0',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  card: (theme) => ({
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 10px 32px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(12px)',
  }),
  title: {
    fontSize: 28,
    marginBottom: 6,
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    border: '1px solid #ccc',
    padding: '10px 14px',
  },
  icon: {
    marginRight: 10,
    color: '#888',
    fontSize: 16,
  },
  input: {
    flex: 1,
    border: 'none',
    fontSize: 16,
    outline: 'none',
    backgroundColor: 'transparent',
  },
  button: (theme) => ({
    padding: '12px 14px',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    background: `linear-gradient(to right, ${theme.primary}, ${theme.primary}CC)`,
  }),
  error: {
    color: '#b00020',
    backgroundColor: '#ffe6e6',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
};
