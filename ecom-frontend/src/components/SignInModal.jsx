import GoogleSignInButton from './GoogleSignInButton';

function SignInModal({ onClose, onSignedIn }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-brand-pink hover:text-gray-700"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="mb-1 text-lg font-bold text-gray-900">Sign in to continue</h2>
        <p className="mb-4 text-sm text-gray-500">Sign in to proceed to checkout.</p>

        <GoogleSignInButton onSignedIn={onSignedIn} />
      </div>
    </div>
  );
}

export default SignInModal;
