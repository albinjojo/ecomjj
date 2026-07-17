import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      onLoginSuccess(data.admin);
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
          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-brand-red">{error}</div>}

          <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
            required
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand-red"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-red py-2.5 font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm font-semibold text-brand-red hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
