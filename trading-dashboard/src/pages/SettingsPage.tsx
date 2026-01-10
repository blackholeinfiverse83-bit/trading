import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Settings, RefreshCw, Moon, Sun, Sparkles, Bell, Download, Trash2, Save, Palette, Monitor, Smartphone, Zap, Shield, Database } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { notificationSettingsService, NotificationSettings } from '../services/alertsService';

interface UserPreferences {
  refreshInterval: number;
  defaultHorizon: 'intraday' | 'short' | 'long';
  autoRefresh: boolean;
  showHealthStatus: boolean;
  itemsPerPage: number;
  smartNotifications: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
}

const defaultPreferences: UserPreferences = {
  refreshInterval: 120,
  defaultHorizon: 'intraday',
  autoRefresh: true,
  showHealthStatus: true,
  itemsPerPage: 20,
  smartNotifications: true,
  compactMode: false,
  animationsEnabled: true,
};

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotifications();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('user_preferences');
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
    } catch {
      // Use defaults
    }
  };

  const savePreferences = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all local data? This will remove your portfolio, watchlist, alerts, and preferences.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      preferences,
      portfolio: localStorage.getItem('portfolio_holdings'),
      watchlist: localStorage.getItem('watchlist'),
      alerts: {
        price: localStorage.getItem('price_alerts'),
        prediction: localStorage.getItem('prediction_alerts'),
      },
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  const SmartToggle = ({ checked, onChange, label, description }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{label}</p>
        <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          checked
            ? isSpace ? 'bg-purple-500 focus:ring-purple-500' : 'bg-blue-500 focus:ring-blue-500'
            : isLight ? 'bg-gray-200 focus:ring-gray-300' : 'bg-slate-600 focus:ring-slate-500'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SmartCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:shadow-lg ${
      isLight 
        ? 'bg-white/80 border-gray-200/50 hover:bg-white/90' 
        : isSpace
          ? 'bg-slate-900/60 border-purple-500/20 hover:bg-slate-900/80'
          : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80'
    } ${className}`}>
      {children}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <Settings className="w-8 h-8 inline-block mr-3" />
            Settings
          </h1>
          <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Customize your trading dashboard experience
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <SmartCard className="p-4">
              <nav className="space-y-2">
                {sections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeSection === id
                        ? isSpace
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                        : isLight
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </SmartCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <SmartCard className="p-6">
                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  <Palette className="w-6 h-6" />
                  Appearance
                </h2>
                
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <label className={`block text-sm font-medium mb-4 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}>Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'light', icon: Sun, label: 'Light', desc: 'Clean & bright' },
                        { key: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on eyes' },
                        { key: 'space', icon: Sparkles, label: 'Space', desc: 'Cosmic vibes' }
                      ].map(({ key, icon: Icon, label, desc }) => (
                        <button
                          key={key}
                          onClick={() => setTheme(key as any)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            theme === key
                              ? isSpace
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-blue-500 bg-blue-500/20'
                              : isLight
                                ? 'border-gray-200 hover:border-gray-300'
                                : 'border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${
                            theme === key
                              ? isSpace ? 'text-purple-400' : 'text-blue-500'
                              : isLight ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                          <div className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {label}
                          </div>
                          <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-4">
                    <SmartToggle
                      checked={preferences.compactMode}
                      onChange={(checked) => setPreferences({ ...preferences, compactMode: checked })}
                      label="Compact Mode"
                      description="Reduce spacing and padding for more content"
                    />
                    <SmartToggle
                      checked={preferences.animationsEnabled}
                      onChange={(checked) => setPreferences({ ...preferences, animationsEnabled: checked })}
                      label="Animations"
                      description="Enable smooth transitions and animations"
                    />
                  </div>
                </div>
              </SmartCard>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <SmartCard className="p-6">
                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  <Bell className="w-6 h-6" />
                  Notifications
                </h2>
                
                <div className="space-y-4">
                  <SmartToggle
                    checked={notificationSettings.browserNotifications}
                    onChange={(checked) => updateNotificationSettings({ browserNotifications: checked })}
                    label="Browser Notifications"
                    description="Receive browser notifications for alerts"
                  />
                  <SmartToggle
                    checked={notificationSettings.priceAlerts}
                    onChange={(checked) => updateNotificationSettings({ priceAlerts: checked })}
                    label="Price Alerts"
                    description="Notify when price alerts trigger"
                  />
                  <SmartToggle
                    checked={notificationSettings.predictionAlerts}
                    onChange={(checked) => updateNotificationSettings({ predictionAlerts: checked })}
                    label="Prediction Alerts"
                    description="Notify when prediction alerts trigger"
                  />
                  <SmartToggle
                    checked={preferences.smartNotifications}
                    onChange={(checked) => setPreferences({ ...preferences, smartNotifications: checked })}
                    label="Smart Notifications"
                    description="AI-powered notification filtering and prioritization"
                  />
                </div>
              </SmartCard>
            )}

            {/* Performance Settings */}
            {activeSection === 'performance' && (
              <SmartCard className="p-6">
                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  <Zap className="w-6 h-6" />
                  Performance
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}>Auto-Refresh Interval (seconds)</label>
                    <input
                      type="range"
                      min="30"
                      max="600"
                      step="30"
                      value={preferences.refreshInterval}
                      onChange={(e) => setPreferences({ ...preferences, refreshInterval: parseInt(e.target.value) })}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                        isLight ? 'bg-gray-200' : 'bg-slate-600'
                      }`}
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>30s</span>
                      <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {preferences.refreshInterval}s
                      </span>
                      <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>10m</span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}>Items Per Page</label>
                    <select
                      value={preferences.itemsPerPage}
                      onChange={(e) => setPreferences({ ...preferences, itemsPerPage: parseInt(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-xl border transition-colors ${
                        isLight
                          ? 'bg-gray-50 border-gray-300 text-gray-900'
                          : 'bg-slate-700 border-slate-600 text-white'
                      }`}
                    >
                      <option value={10}>10 items</option>
                      <option value={20}>20 items</option>
                      <option value={50}>50 items</option>
                      <option value={100}>100 items</option>
                    </select>
                  </div>

                  <SmartToggle
                    checked={preferences.autoRefresh}
                    onChange={(checked) => setPreferences({ ...preferences, autoRefresh: checked })}
                    label="Auto-Refresh"
                    description="Automatically refresh data at intervals"
                  />
                </div>
              </SmartCard>
            )}

            {/* Privacy & Security */}
            {activeSection === 'privacy' && (
              <SmartCard className="p-6">
                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  <Shield className="w-6 h-6" />
                  Privacy & Security
                </h2>
                
                <div className="space-y-4">
                  <SmartToggle
                    checked={preferences.showHealthStatus}
                    onChange={(checked) => setPreferences({ ...preferences, showHealthStatus: checked })}
                    label="Show Health Status"
                    description="Display system health and connection status"
                  />
                  
                  <div className={`p-4 rounded-xl border ${
                    isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-500/30'
                  }`}>
                    <h3 className={`font-medium mb-2 ${isLight ? 'text-blue-900' : 'text-blue-300'}`}>
                      Data Privacy
                    </h3>
                    <p className={`text-sm ${isLight ? 'text-blue-800' : 'text-blue-200'}`}>
                      All your data is stored locally in your browser. We don't collect or transmit personal information.
                    </p>
                  </div>
                </div>
              </SmartCard>
            )}

            {/* Data Management */}
            {activeSection === 'data' && (
              <SmartCard className="p-6">
                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  <Database className="w-6 h-6" />
                  Data Management
                </h2>
                
                <div className="space-y-4">
                  <button
                    onClick={exportData}
                    className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    Export All Data
                  </button>
                  
                  <button
                    onClick={clearAllData}
                    className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear All Data
                  </button>
                </div>
              </SmartCard>
            )}

            {/* Save Button */}
            <SmartCard className="p-6">
              <button
                onClick={savePreferences}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : isSpace
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Save className="w-5 h-5" />
                {saved ? 'Settings Saved!' : 'Save All Settings'}
              </button>
            </SmartCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;