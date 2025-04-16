// AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Hardcoded test credentials for researchers
  const validResearchers = [
    { email: 'teams@platlas.com', password: 'Teams@Platlas' },
    // Add more test accounts as needed
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isValidResearcher = validResearchers.some(
      researcher => researcher.email === email && researcher.password === password
    );

    if (isValidResearcher) {
      // Set authentication status in localStorage or your preferred state management
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'researcher');
      navigate('/platlas'); // Redirect to main application
    } else {
      setError('Invalid credentials. This is a testing phase - please contact admin for access.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Researcher Access</h2>
          <p className="text-gray-600 mt-2">Testing Phase - Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          This is a restricted access platform for authorized researchers during the testing phase.
          <br />
          Contact administrator for access credentials.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;