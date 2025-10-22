import { supabase } from './supabase';
import { sendNewUserNotification } from './email';
import type { User, AuthError } from '@supabase/supabase-js';

// Types for authentication
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User | null;
  error?: string;
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

// Error message mapping for user-friendly messages
const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link before signing in.';
    case 'User already registered':
      return 'An account with this email already exists. Please sign in instead.';
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.';
    case 'Signup requires a valid password':
      return 'Please enter a valid password.';
    case 'Unable to validate email address: invalid format':
      return 'Please enter a valid email address.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Sign up a new user with email, password, and full name
 * Stores full name as display_name in user metadata
 */
export const signUp = async ({ email, password, fullName }: SignUpData): Promise<AuthResponse> => {
  try {
    // Validate input data
    if (!email || !password || !fullName) {
      return { success: false, error: 'All fields are required' };
    }

    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.message };
    }

    if (fullName.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters long' };
    }

    // Attempt to sign up user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        // Store full name in user metadata in multiple formats for compatibility
        data: {
          display_name: fullName.trim(),
          full_name: fullName.trim(),
          first_name: fullName.trim().split(' ')[0] || '',
          last_name: fullName.trim().split(' ').slice(1).join(' ') || '',
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }

    // Check if user was created successfully
    if (!data.user) {
      return { success: false, error: 'Failed to create account. Please try again.' };
    }

    // Send notification email to admin (non-blocking)
    sendNewUserNotification(data.user.email || email, fullName).catch(error => {
      console.error('Failed to send notification email, but user was created successfully:', error);
    });

    return { 
      success: true, 
      user: data.user,
    };

  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred during signup. Please try again.' 
    };
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async ({ email, password }: SignInData): Promise<AuthResponse> => {
  try {
    // Validate input data
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Attempt to sign in user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }

    // Check if user signed in successfully
    if (!data.user) {
      return { success: false, error: 'Failed to sign in. Please try again.' };
    }

    return { 
      success: true, 
      user: data.user,
    };

  } catch (error) {
    console.error('Unexpected signin error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred during sign in. Please try again.' 
    };
  }
};

/**
 * Sign in with Google OAuth
 * Handles Google SSO authentication flow
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect URL after successful authentication
        redirectTo: `${window.location.origin}/auth/callback`,
        // Request additional scopes if needed
        scopes: 'email profile',
        // Query parameters for OAuth flow
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google signin error:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }

    // OAuth flow initiated successfully
    // User will be redirected to Google for authentication
    return { success: true };

  } catch (error) {
    console.error('Unexpected Google signin error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred during Google sign in. Please try again.' 
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error);
      return { success: false, error: 'Failed to sign out. Please try again.' };
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected signout error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred during sign out. Please try again.' 
    };
  }
};

/**
 * Get the current user session
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected get user error:', error);
    return null;
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    // Validate input data
    if (!email) {
      return { success: false, error: 'Email address is required' };
    }

    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected password reset error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred while sending reset email. Please try again.' 
    };
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
};