import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthPanel } from './components/AuthPanel';
import { Dashboard } from './components/Dashboard';
import { OnboardingProfile } from './components/OnboardingProfile';
import { defaultProfile } from './data/dummyData';
import { buildRecommendation } from './utils/recommendations';
import { api } from './api/client';
import { buildProfilePayload, isProfileComplete, mergeUserProfile } from './utils/profile';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fitai_theme') === 'dark');
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('fitai_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('fitai_profile', JSON.stringify(profile));
  }, [profile]);

  const applyUser = useCallback((user) => {
    if (!user) return;
    setProfile(mergeUserProfile(user, defaultProfile));
    setProfileComplete(isProfileComplete(user));
  }, []);

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
        applyUser(data.user);
        setAuthenticated(true);
      } catch {
        localStorage.removeItem('fitai_token');
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }

    verifyStoredToken();
  }, [applyUser]);

  const recommendation = useMemo(() => buildRecommendation(profile), [profile]);

  function authenticate(payload = {}) {
    if (!payload.token) return;
    localStorage.setItem('fitai_token', payload.token);
    applyUser(payload.user);
    localStorage.removeItem('fitai_demo_auth');
    setAuthenticated(true);
  }

  async function saveProfile(nextProfile) {
    const { data } = await api.put('/profile', buildProfilePayload(nextProfile));
    applyUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('fitai_demo_auth');
    localStorage.removeItem('fitai_token');
    setAuthenticated(false);
    setProfileComplete(false);
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

  if (!profileComplete) {
    return <OnboardingProfile profile={profile} onComplete={applyUser} onLogout={logout} />;
  }

  return (
    <Dashboard
      profile={profile}
      setProfile={setProfile}
      recommendation={recommendation}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onLogout={logout}
      onSaveProfile={saveProfile}
    />
  );
}
