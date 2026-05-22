import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
  getStoredUser,
  isAuthenticated,
  type User,
  type RegisterData,
} from "../services/auth.mock";

interface AuthContextType {
  user: User | null;
  isLogged: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  editarPerfil: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const authed = await isAuthenticated();
      if (authed) {
        const stored = await getStoredUser();
        setUser(stored);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (phone: string, password: string) => {
    const { user } = await loginUser(phone, password);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    const { user } = await registerUser(data);
    setUser(user);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const editarPerfil = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await updateProfile(user.id, data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLogged: !!user, loading, login, register, logout, editarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
