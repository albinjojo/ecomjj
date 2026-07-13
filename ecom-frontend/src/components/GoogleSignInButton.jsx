import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { googleSignIn } from '../lib/api';

function GoogleSignInButton({ onSignedIn }) {
  const [error, setError] = useState(null);

  async function handleSuccess(credentialResponse) {
    try {
      const data = await googleSignIn(credentialResponse.credential);
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
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </div>
  );
}

export default GoogleSignInButton;