import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from './DataContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isViewingAs: boolean;
  viewingAsUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  startViewingAs: (targetUser: User, reason: string) => void;
  stopViewingAs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isViewingAs, setIsViewingAs] = useState(false);
  const [viewingAsUser, setViewingAsUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsViewingAs(false);
    setViewingAsUser(null);
    localStorage.removeItem('currentUser');
  };

  const startViewingAs = (targetUser: User, reason: string) => {
    setIsViewingAs(true);
    setViewingAsUser(targetUser);
    console.log(`[AUDIT] Admin ${user?.name} started viewing as ${targetUser.name}. Reason: ${reason}`);
  };

  const stopViewingAs = () => {
    console.log(`[AUDIT] Admin ${user?.name} stopped viewing as ${viewingAsUser?.name}`);
    setIsViewingAs(false);
    setViewingAsUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isViewingAs,
      viewingAsUser,
      login,
      logout,
      startViewingAs,
      stopViewingAs,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
