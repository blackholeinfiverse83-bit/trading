import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Settings, Wallet, TrendingUp, Activity, CreditCard, IndianRupee } from 'lucide-react';
import { formatUSDToINR } from '../utils/currencyConverter';

const UserProfilePage = () => {
  const { user, userProfile, updateUserProfile, updateUserPreferences, logout } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: userProfile?.email || '',
    accountBalance: userProfile?.accountBalance || 0,
  });

  const [preferences, setPreferences] = useState({
    theme: userProfile?.preferences.theme || 'dark',
    defaultHorizon: userProfile?.preferences.defaultHorizon || 'intraday',
    riskTolerance: userProfile?.preferences.riskTolerance || 'moderate',
    currency: userProfile?.preferences.currency || 'INR',
    notifications: userProfile?.preferences.notifications || true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: val }));
    } else {
      setPreferences(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Update profile
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        accountBalance: formData.accountBalance,
      });

      // Update preferences
      await updateUserPreferences(preferences);

      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setMessage('Error updating profile: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!userProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2 ${isLight ? 'bg-blue-100' : 'bg-blue-500/20'} rounded-lg`}>
            <User className={`w-6 h-6 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              User Profile
            </h1>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${isLight 
            ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
            : isSpace 
              ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
              : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
          } rounded-lg p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Wallet className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Account Balance</h3>
            </div>
            <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {formatUSDToINR(userProfile.accountBalance || 0)}
            </p>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>Available balance</p>
          </div>

          <div className={`${isLight 
            ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
            : isSpace 
              ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
              : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
          } rounded-lg p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={`w-5 h-5 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Portfolio Value</h3>
            </div>
            <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {formatUSDToINR(userProfile.portfolioValue || 0)}
            </p>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>Current value</p>
          </div>

          <div className={`${isLight 
            ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
            : isSpace 
              ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
              : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
          } rounded-lg p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Activity className={`w-5 h-5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Risk Tolerance</h3>
            </div>
            <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {userProfile.preferences.riskTolerance}
            </p>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>Current setting</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className={`${isLight 
          ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
          : isSpace 
            ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
            : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
        } rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
              <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Account Settings
              </h2>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('success') 
                ? (isLight ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-400 border border-green-500/30')
                : (isLight ? 'bg-red-100 text-red-800' : 'bg-red-900/30 text-red-400 border border-red-500/30')
            }`}>
              {message}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isLight
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-slate-700 border-slate-600 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isLight
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-slate-700 border-slate-600 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isLight
                        ? 'bg-gray-50 border-gray-300 text-gray-900'
                        : 'bg-slate-700 border-slate-600 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                    Account Balance
                  </label>
                  <div className="relative">
                    <IndianRupee className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="number"
                      name="accountBalance"
                      value={formData.accountBalance}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        isLight
                          ? 'bg-gray-50 border-gray-300 text-gray-900'
                          : 'bg-slate-700 border-slate-600 text-white'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-md font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4`}>
                  Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                      Theme
                    </label>
                    <select
                      name="theme"
                      value={preferences.theme}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isLight
                          ? 'bg-gray-50 border-gray-300 text-gray-900'
                          : 'bg-slate-700 border-slate-600 text-white'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="space">Space</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                      Default Horizon
                    </label>
                    <select
                      name="defaultHorizon"
                      value={preferences.defaultHorizon}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isLight
                          ? 'bg-gray-50 border-gray-300 text-gray-900'
                          : 'bg-slate-700 border-slate-600 text-white'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="intraday">Intraday</option>
                      <option value="short">Short-term</option>
                      <option value="long">Long-term</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                      Risk Tolerance
                    </label>
                    <select
                      name="riskTolerance"
                      value={preferences.riskTolerance}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isLight
                          ? 'bg-gray-50 border-gray-300 text-gray-900'
                          : 'bg-slate-700 border-slate-600 text-white'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="low">Low Risk</option>
                      <option value="moderate">Moderate Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={preferences.currency}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isLight
                          ? 'bg-gray-50 border-gray-300 text-gray-900'
                          : 'bg-slate-700 border-slate-600 text-white'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="notifications"
                        checked={preferences.notifications}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className={`${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                        Enable notifications
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={`px-6 py-3 ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-slate-700 hover:bg-slate-600 text-white'} rounded-lg font-semibold transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>First Name</p>
                  <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{userProfile.firstName}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Last Name</p>
                  <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{userProfile.lastName}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Email</p>
                  <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{userProfile.email}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Account Balance</p>
                  <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{formatUSDToINR(userProfile.accountBalance || 0)}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-md font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4`}>
                  Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Theme</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{userProfile.preferences.theme}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Default Horizon</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{userProfile.preferences.defaultHorizon}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Risk Tolerance</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{userProfile.preferences.riskTolerance}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Currency</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>{userProfile.preferences.currency}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className={`text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>Notifications</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {userProfile.preferences.notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className={`${isLight 
          ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
          : isSpace 
            ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
            : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
        } rounded-lg p-6`}>
          <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4`}>
            Account Actions
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;