 import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

function GoogleSignInButton({ onSignedIn }) {
  const [error, setError] = useState(null);

  async function handleSuccess(credentialResponse) {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // required so the cookie actually gets set
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!res.ok) {
        throw new Error('Sign-in failed');
      }

      const data = await res.json();
      if (onSignedIn) onSignedIn(data.user);
    } catch (err) {
      console.error(err);
      setError('Something went wrong signing in. Please try again.');
    }
  }

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Google sign-in was cancelled or failed.')}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default GoogleSignInButton;