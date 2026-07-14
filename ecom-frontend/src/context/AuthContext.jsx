import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, logout as apiLogout, queryKeys } from '../lib/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => getMe(),
  });

  const user = data?.user ?? null;

  function setUser(nextUser) {
    queryClient.setQueryData(queryKeys.me, nextUser ? { user: nextUser } : null);
  }

  async function signOut() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading: isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
