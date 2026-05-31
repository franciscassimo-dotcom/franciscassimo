import React, { useState, useEffect } from 'react';
import { UserProfile, UserSettings } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentSettings, setCurrentSettings] = useState<UserSettings>({
    themeMode: 'dark',
    fontSize: 'medium',
    fontType: 'sans'
  });
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for active login session in localStorage or sessionStorage
  useEffect(() => {
    try {
      const activeUserStr = sessionStorage.getItem('active_authenticated_user');
      if (activeUserStr) {
        const userObj: UserProfile = JSON.parse(activeUserStr);
        setCurrentUser(userObj);

        // Load custom settings
        const storedSettings = localStorage.getItem(`settings_${userObj.username}`);
        if (storedSettings) {
          setCurrentSettings(JSON.parse(storedSettings));
        }
      }
    } catch (e) {
      console.error("Erro ao inicializar sessão de utilizador ativa: ", e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Login handler
  const handleAuthSuccess = (profile: UserProfile, settings: UserSettings) => {
    setCurrentUser(profile);
    setCurrentSettings(settings);
    sessionStorage.setItem('active_authenticated_user', JSON.stringify(profile));
    localStorage.setItem(`settings_${profile.username}`, JSON.stringify(settings));
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('active_authenticated_user');
  };

  // Update Settings flow
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setCurrentSettings(newSettings);
    if (currentUser) {
      localStorage.setItem(`settings_${currentUser.username}`, JSON.stringify(newSettings));
    }
  };

  // Update Profile flow
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setCurrentUser(newProfile);
    sessionStorage.setItem('active_authenticated_user', JSON.stringify(newProfile));
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400 font-mono text-sm tracking-widest gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Carregando Sistema de Segurança...</span>
      </div>
    );
  }

  return (
    <>
      {currentUser ? (
        <Dashboard
          user={currentUser}
          settings={currentSettings}
          onLogout={handleLogout}
          onUpdateSettings={handleUpdateSettings}
          onUpdateProfile={handleUpdateProfile}
        />
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}
