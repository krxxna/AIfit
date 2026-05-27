import { useEffect, useMemo, useState } from 'react';
import { AuthPanel } from './components/AuthPanel';
import { Dashboard } from './components/Dashboard';
import { defaultProfile } from './data/dummyData';
import { buildRecommendation } from './utils/recommendations';
import { api } from './api/client';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fitai_theme') === 'dark');
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('fitai_profile');
    return stored ? JSON.parse(stored) : defaultProfile;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('fitai_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('fitai_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    async function verifyStoredToken() {
      localStorage.removeItem('fitai_demo_auth');
      const token = localStorage.getItem('fitai_token');
      if (!token) {
        setAuthChecked(true);
        return;
      }

      try {
        const { data } = await api.get('/profile');
        if (data.user?.name) {
          setProfile((current) => ({ ...current, name: data.user.name, ...data.user.profile }));
        }
        setAuthenticated(true);
      } catch {
        localStorage.removeItem('fitai_token');
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }

    verifyStoredToken();
  }, []);

  const recommendation = useMemo(() => buildRecommendation(profile), [profile]);

  function authenticate(payload = {}) {
    if (!payload.token) return;
    localStorage.setItem('fitai_token', payload.token);
    if (payload.user?.name) {
      setProfile((current) => ({ ...current, name: payload.user.name, ...payload.user.profile }));
    }
    localStorage.removeItem('fitai_demo_auth');
    setAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('fitai_demo_auth');
    localStorage.removeItem('fitai_token');
    setAuthenticated(false);
  }

  if (!authChecked) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center text-slate-600 dark:text-slate-300">
        <div className="glass rounded-lg p-6 shadow-sm">
          <p className="text-sm font-semibold">Checking secure session...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <AuthPanel onAuthenticate={authenticate} />;
  }

  return (
    <Dashboard
      profile={profile}
      setProfile={setProfile}
      recommendation={recommendation}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onLogout={logout}
    />
  );
}
