import { useEffect, useState } from "react";
import { supabase } from "@aurora/shared/supabase";

type Role = 'admin' | 'supplier' | 'buyer' | null;

interface UseUserRoleResult {
  role: Role;
  loading: boolean;
  error: string | null;
}

const useUserRole = (): UseUserRoleResult => {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      if (error) setError(error.message);
      else setRole(data?.role ?? null);
      setLoading(false);
    };
    fetchRole();
  }, []);

  return { role, loading, error };
};

export default useUserRole;
