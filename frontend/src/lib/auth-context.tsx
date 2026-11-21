"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "owner" | "admin" | "viewer";
  photoURL?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  demoLogin: (role?: "owner" | "admin" | "viewer") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => false,
  signInWithGoogle: async () => false,
  signOut: async () => {},
  demoLogin: () => {},
});

const DEFAULT_USER: UserProfile = {
  uid: "usr_hemanya_admin_01",
  email: "hemanya.1251070718@vit.edu",
  displayName: "Hemanya Devendra Gillurkar",
  role: "owner",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check local storage for persistent session
    try {
      const stored = localStorage.getItem("passport_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Pre-populate with default authenticated principal for demo convenience
        setUser(DEFAULT_USER);
        localStorage.setItem("passport_user", JSON.stringify(DEFAULT_USER));
      }
    } catch (e) {
      setUser(DEFAULT_USER);
    }
  }, []);

  const signIn = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const newUser: UserProfile = {
        uid: "usr_" + Math.random().toString(36).substring(7),
        email,
        displayName: email.split("@")[0],
        role: "admin",
      };
      setUser(newUser);
      localStorage.setItem("passport_user", JSON.stringify(newUser));
      toast.success(`Signed in as ${newUser.displayName}`);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const googleUser: UserProfile = {
        uid: "usr_google_hemanya_28",
        email: "hemanyagillurkar28@gmail.com",
        displayName: "Hemanya Gillurkar",
        role: "owner",
      };
      setUser(googleUser);
      localStorage.setItem("passport_user", JSON.stringify(googleUser));
      toast.success("Google Authentication verified");
      return true;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("passport_user");
    toast.success("Signed out of Passport");
  };

  const demoLogin = (role: "owner" | "admin" | "viewer" = "owner") => {
    const demoUser: UserProfile = {
      ...DEFAULT_USER,
      role,
    };
    setUser(demoUser);
    localStorage.setItem("passport_user", JSON.stringify(demoUser));
    toast.success(`Active Session: ${demoUser.displayName} (${role.toUpperCase()})`);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
