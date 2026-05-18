import { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginError: string | null;
  isInIframe: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  loginError: null,
  isInIframe: false,
  login: async () => {},
  logout: async () => {},
});

/** Detect whether we're embedded inside an iframe (Replit preview). */
function detectIframe(): boolean {
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const isInIframe = detectIframe();

  useEffect(() => {
    // Capture any result coming back from a redirect login
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch(() => {});

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const login = async () => {
    setLoginError(null);

    // When inside an iframe (Replit preview), popups and redirects both fail.
    // Use redirect — the page navigates away then comes back logged in.
    if (isInIframe) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (err: unknown) {
        handleError(err);
      }
      return;
    }

    // Normal browser context — try popup first, fall back to redirect.
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e2: unknown) {
          handleError(e2);
        }
      } else {
        handleError(err);
      }
    }
  };

  const handleError = (err: unknown) => {
    const code = (err as { code?: string }).code ?? "";
    const msg = (err as { message?: string }).message ?? "";

    if (code === "auth/unauthorized-domain") {
      setLoginError(
        `Domain not authorized. In Firebase Console go to:\n` +
        `Authentication → Settings tab → Authorized domains → Add domain:\n` +
        window.location.hostname
      );
    } else if (code === "auth/operation-not-allowed") {
      setLoginError(
        "Google sign-in is not enabled. In Firebase Console go to:\n" +
        "Authentication → Sign-in method → Google → Enable"
      );
    } else {
      setLoginError(msg || "Login failed. Please try again.");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, loginError, isInIframe, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return useContext(AuthContext);
}
