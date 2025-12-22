import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService, AuthError, AuthResult } from "../services/authService";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  isInitialized: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  sendPasswordResetEmail: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        // Initialize auth service
        const success = await authService.initialize();
        if (!success) {
          console.warn("Auth service failed to initialize");
        }

        // Subscribe to auth state changes
        unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
          setUser(firebaseUser);
          setIsLoading(false);
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const signUpWithEmail = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await authService.signUpWithEmail(email, password);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithEmail(email, password);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithApple();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await authService.signOut();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<AuthResult> => {
    return authService.sendPasswordResetEmail(email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    sendPasswordResetEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

