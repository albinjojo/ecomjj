import { useState, useEffect } from 'react';
import GoogleSignInButton from './components/GoogleSignInButton';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>JJ Stores</h1>
      {user ? (
        <p>Signed in as: {user.email}</p>
      ) : (
        <GoogleSignInButton onSignedIn={setUser} />
      )}
    </div>
  );
}

export default App;