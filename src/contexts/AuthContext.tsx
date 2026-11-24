import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { runMigrations } from '../database/migrations';
import { UsuarioAutenticado } from '../models/types';
import { AuthService } from '../services/AuthService';

interface AuthContextData {
  user: UsuarioAutenticado | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signIn: (usuario: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UsuarioAutenticado | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const appStateRef = useRef<AppStateStatus>(
    (AppState.currentState as AppStateStatus) || 'active'
  );
  useEffect(() => {
    let isMounted = true;

    async function bootstrapApp() {
      try {
        await runMigrations();
        // Exige autenticação obrigatória sempre que abrir o aplicativo
        await AuthService.clearSession();
        if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar banco local:', error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    bootstrapApp();

    return () => {
      isMounted = false;
    };
  }, []);

  // Encerra a sessão ao sair/minimizar o aplicativo, exigindo novo login ao retornar
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current === 'active' &&
          nextAppState === 'background'
        ) {
          await AuthService.clearSession();
          setUser(null);
        }
        appStateRef.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const signIn = useCallback(async (usuario: string, senha: string) => {
    const authenticatedUser = await AuthService.login(usuario, senha);
    setUser(authenticatedUser);
  }, []);

  const signOut = useCallback(async () => {
    await AuthService.clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        isAuthenticated: Boolean(user),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}