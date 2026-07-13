import { Link } from 'react-router-dom';

function ComingSoon() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Coming soon</h1>
      <p className="text-sm text-gray-500">This page isn't ready yet — check back soon.</p>
      <Link to="/" className="mt-2 rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </div>
  );
}

export default ComingSoon;
