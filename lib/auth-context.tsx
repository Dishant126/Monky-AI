"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Note: We don't store the token locally since it's in httpOnly cookie
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const getAccessToken = async (): Promise<string> => {
    if (accessToken) {
      return accessToken;
    }
    throw new Error("No access token available");
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      setAccessToken(data.token);

      return { success: true };
    } catch (error) {
      return { success: false, error: "An error occurred during login" };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setUser(data.user);
      setAccessToken(data.token);

      return { success: true };
    } catch (error) {
      return { success: false, error: "An error occurred during signup" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setAccessToken(null);
    router.push("/login");
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return { success: false, error: "Not authenticated" };

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to update profile",
        };
      }

      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update profile" };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      if (!user) return { success: false, error: "Not authenticated" };

      const usersData = localStorage.getItem("users");
      const users = usersData ? JSON.parse(usersData) : [];
      const userIndex = users.findIndex((u: any) => u.id === user.id);

      if (userIndex === -1) {
        return { success: false, error: "User not found" };
      }

      if (users[userIndex].password !== currentPassword) {
        return { success: false, error: "Current password is incorrect" };
      }

      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to change password" };
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      if (!user) return { success: false, error: "Not authenticated" };

      const usersData = localStorage.getItem("users");
      const users = usersData ? JSON.parse(usersData) : [];
      const userIndex = users.findIndex((u: any) => u.id === user.id);

      if (userIndex === -1) {
        return { success: false, error: "User not found" };
      }

      if (users[userIndex].password !== password) {
        return { success: false, error: "Password is incorrect" };
      }

      users.splice(userIndex, 1);
      localStorage.setItem("users", JSON.stringify(users));

      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      router.push("/login");

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to delete account" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        isLoading,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
