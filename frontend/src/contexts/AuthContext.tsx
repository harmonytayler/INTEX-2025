import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  userId: number;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure userId is a number
      return {
        ...parsedUser,
        userId: typeof parsedUser.userId === 'string' ? parseInt(parsedUser.userId, 10) : parsedUser.userId
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.roles?.includes('Administrator') ?? false;

  useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('Is admin:', isAdmin);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user, isAdmin]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading, setLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 