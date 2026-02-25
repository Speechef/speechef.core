'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

type Tab = 'account' | 'notifications' | 'privacy' | 'danger';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile: { image: string; current_streak: number; longest_streak: number };
}

// Notification types that can be toggled
const NOTIF_TYPES = [
  { key: 'streak_risk',       label: 'Streak at risk',        desc: 'Remind me to practice before I lose my streak', emoji: '🔥' },
  { key: 'review_ready',      label: 'Review delivered',      desc: 'When an expert finishes reviewing my speech', emoji: '🎓' },
  { key: 'job_match',         label: 'New job matches',       desc: 'Jobs that match my communication score', emoji: '💼' },
  { key: 'score_improvement', label: 'Score improvement',     desc: 'When my communication score improves', emoji: '📈' },
  { key: 'badge_earned',      label: 'Badge earned',          desc: 'When I unlock a new achievement badge', emoji: '🏅' },
  { key: 'general',           label: 'General updates',       desc: 'Platform news and announcements', emoji: '🔔' },
];

const NOTIF_PREFS_KEY = 'speechef_notif_prefs';

function loadNotifPrefs(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveNotifPrefs(prefs: Record<string, boolean>) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold" style={{ color: '#141c52' }}>{title}</h2>
      {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
    </div>
  );
}

// ── Success/error banner ────────────────────────────────────────────────────────
function Banner({ type, msg, onClose }: { type: 'success' | 'error'; msg: string; onClose: () => void }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm mb-5"
      style={{
        backgroundColor: type === 'success' ? '#dcfce7' : '#fee2e2',
        color: type === 'success' ? '#166534' : '#991b1b',
      }}
    >
      <span className="text-base">{type === 'success' ? '✓' : '✕'}</span>
      <p className="flex-1">{msg}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 text-base leading-none">×</button>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ backgroundColor: checked ? '#fe9940' : '#d1d5db' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(1.25rem)' : 'translateX(0.25rem)' }}
      />
    </button>
  );
}

// ── Account tab ────────────────────────────────────────────────────────────────
function AccountTab({ user }: { user: UserProfile }) {
  const qc = useQueryClient();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail]       = useState(user.email);
  const [banner, setBanner]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [curPw, setCurPw]   = useState('');
  const [newPw, setNewPw]   = useState('');
  const [confPw, setConfPw] = useState('');
  const [pwBanner, setPwBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const profileMutation = useMutation({
    mutationFn: (data: { username: string; email: string }) =>
      api.patch('/auth/profile/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      setBanner({ type: 'success', msg: 'Account details updated successfully.' });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update. Please try again.';
      setBanner({ type: 'error', msg });
    },
  });

  const pwMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.post('/auth/change-password/', data),
    onSuccess: () => {
      setCurPw(''); setNewPw(''); setConfPw('');
      setPwBanner({ type: 'success', msg: 'Password changed successfully. Please log in again if prompted.' });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to change password.';
      setPwBanner({ type: 'error', msg });
    },
  });

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    profileMutation.mutate({ username, email });
  }

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwBanner(null);
    if (newPw !== confPw) {
      setPwBanner({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setPwBanner({ type: 'error', msg: 'Password must be at least 8 characters.' });
      return;
    }
    pwMutation.mutate({ current_password: curPw, new_password: newPw });
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FADB43] focus:border-transparent transition-shadow';
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide';

  return (
    <div className="space-y-8">
      {/* Profile section */}
      <div>
        <SectionHead title="Profile" desc="Update your display name and email address." />
        {banner && <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner(null)} />}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className={labelCls}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="your_username"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="px-5 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="border-t border-gray-100 pt-8">
        <SectionHead title="Change Password" desc="Choose a strong password of at least 8 characters." />
        {pwBanner && <Banner type={pwBanner.type} msg={pwBanner.msg} onClose={() => setPwBanner(null)} />}
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
              className={inputCls}
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className={labelCls}>New password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className={inputCls}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Confirm new password</label>
            <input
              type="password"
              value={confPw}
              onChange={(e) => setConfPw(e.target.value)}
              className={inputCls}
              placeholder="Repeat new password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pwMutation.isPending}
            className="px-5 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' }}
          >
            {pwMutation.isPending ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Notifications tab ──────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadNotifPrefs();
    const defaults: Record<string, boolean> = {};
    for (const t of NOTIF_TYPES) {
      defaults[t.key] = stored[t.key] !== undefined ? stored[t.key] : true;
    }
    setPrefs(defaults);
  }, []);

  function toggle(key: string, val: boolean) {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    saveNotifPrefs(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <SectionHead
        title="Notification Preferences"
        desc="Choose which notifications you receive. Changes are saved instantly."
      />
      {saved && (
        <div className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-4 inline-block">
          Preferences saved
        </div>
      )}
      <div className="space-y-3">
        {NOTIF_TYPES.map((t) => (
          <div
            key={t.key}
            className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{t.emoji}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#141c52' }}>{t.label}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </div>
            </div>
            <Toggle checked={prefs[t.key] ?? true} onChange={(v) => toggle(t.key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Privacy tab ────────────────────────────────────────────────────────────────
function PrivacyTab() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [showScore, setShowScore]         = useState(true);
  const [showStreak, setShowStreak]       = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicProfile(localStorage.getItem('speechef_public_profile') !== 'false');
      setShowScore(localStorage.getItem('speechef_show_score') !== 'false');
      setShowStreak(localStorage.getItem('speechef_show_streak') !== 'false');
    }
  }, []);

  function update(key: string, val: boolean, setter: (v: boolean) => void) {
    setter(val);
    localStorage.setItem(key, String(val));
  }

  return (
    <div>
      <SectionHead
        title="Privacy"
        desc="Control what others can see on your public profile."
      />
      <div className="space-y-3">
        {[
          {
            key: 'speechef_public_profile',
            label: 'Public profile',
            desc: 'Allow anyone to view your profile at speechef.com/u/username',
            value: publicProfile,
            setter: setPublicProfile,
            emoji: '👤',
          },
          {
            key: 'speechef_show_score',
            label: 'Show communication score',
            desc: 'Display your latest speech analysis score on your public profile',
            value: showScore,
            setter: setShowScore,
            emoji: '📊',
          },
          {
            key: 'speechef_show_streak',
            label: 'Show streak',
            desc: 'Display your practice streak on your public profile',
            value: showStreak,
            setter: setShowStreak,
            emoji: '🔥',
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#141c52' }}>{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
            <Toggle
              checked={item.value}
              onChange={(v) => update(item.key, v, item.setter)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Danger zone tab ───────────────────────────────────────────────────────────
function DangerTab() {
  const [confirming, setConfirming] = useState(false);
  const [inputVal, setInputVal]     = useState('');
  const expected = 'DELETE MY ACCOUNT';

  return (
    <div>
      <SectionHead title="Danger Zone" desc="These actions are permanent and cannot be undone." />
      <div className="border border-red-200 rounded-xl p-5 bg-red-50">
        <div className="flex items-start gap-4">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <p className="font-bold text-red-800 text-sm mb-1">Delete Account</p>
            <p className="text-xs text-red-600 mb-4">
              Permanently delete your Speechef account, all analyses, game history, and profile data.
              This action cannot be reversed.
            </p>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                Delete my account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-red-700 font-medium">
                  Type <span className="font-mono font-bold">{expected}</span> to confirm:
                </p>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  placeholder={expected}
                />
                <div className="flex gap-2">
                  <button
                    disabled={inputVal !== expected}
                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => {
                      // TODO: call delete account endpoint when available
                      alert('Account deletion is not yet available. Please contact support.');
                      setConfirming(false);
                      setInputVal('');
                    }}
                  >
                    Permanently delete
                  </button>
                  <button
                    onClick={() => { setConfirming(false); setInputVal(''); }}
                    className="text-sm font-medium px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/profile/').then((r) => r.data),
  });

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'account',       label: 'Account',       emoji: '👤' },
    { key: 'notifications', label: 'Notifications',  emoji: '🔔' },
    { key: 'privacy',       label: 'Privacy',        emoji: '🔒' },
    { key: 'danger',        label: 'Danger Zone',    emoji: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#141c52' }}>Settings</h1>
          <p className="text-gray-500 text-sm">Manage your account, notifications, and privacy.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <nav className="sm:w-44 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left ${
                    activeTab === t.key
                      ? 'font-semibold'
                      : 'text-gray-500 hover:bg-gray-50'
                  } ${t.key === 'danger' ? 'text-red-600 hover:bg-red-50' : activeTab === t.key ? '' : ''}`}
                  style={activeTab === t.key && t.key !== 'danger'
                    ? { backgroundColor: 'rgba(20,28,82,0.06)', color: '#141c52' }
                    : {}}
                >
                  <span className="text-base">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content panel */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : user ? (
              <>
                {activeTab === 'account'       && <AccountTab user={user} />}
                {activeTab === 'notifications' && <NotificationsTab />}
                {activeTab === 'privacy'       && <PrivacyTab />}
                {activeTab === 'danger'        && <DangerTab />}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
