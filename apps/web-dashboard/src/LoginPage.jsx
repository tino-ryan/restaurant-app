import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'shared';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './themeContext'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme(); // ✅ Get current theme

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
    <div
      style={{
        ...styles.container,
        backgroundColor: theme.background,
        color: theme.text,
        borderColor: theme.primary,
      }}
    >
      <h2 style={{ color: theme.primary }}>Admin Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ ...styles.input, borderColor: theme.primary }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ ...styles.input, borderColor: theme.primary }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: theme.primary,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '100px auto',
    padding: 20,
    border: '1px solid',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid',
    outline: 'none',
  },
  button: {
    padding: 10,
    fontSize: 16,
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
};
