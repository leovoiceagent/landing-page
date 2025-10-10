import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * OAuth Callback Component
 * Handles the redirect after Google OAuth authentication
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setErrorMessage('Authentication failed. Please try again.');
          return;
        }

        if (data.session) {
          setStatus('success');
          // Redirect to app dashboard after successful authentication
          setTimeout(() => {
            navigate('/app', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage('No session found. Please try signing in again.');
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#38BDF8] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
            Completing sign in...
          </h2>
          <p className="text-[#64748B]">
            Please wait while we finish setting up your account.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
            Sign in successful!
          </h2>
          <p className="text-[#64748B]">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
          Authentication Error
        </h2>
        <p className="text-[#64748B] mb-6">
          {errorMessage}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#F7EF00] text-[#1E293B] px-6 py-2 rounded-xl font-semibold hover:bg-[#F7EF00]/90 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default AuthCallback;