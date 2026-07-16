import { useAuth } from '../hooks/useAuth';

function Checkout() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Checkout — signed in as {user?.email}</h1>
    </div>
  );
}

export default Checkout;
