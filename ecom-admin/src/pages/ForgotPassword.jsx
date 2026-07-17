import { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setMessage('If that email exists, a reset link has been sent.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-red">JJ Spices</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Forgot Password</h2>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-brand-red">{error}</div>}
          {message && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}

          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-red py-2.5 font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="mt-4 text-center">
            <a href="/" className="text-sm font-semibold text-brand-red hover:underline">
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
