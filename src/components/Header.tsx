import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, User, LogOut, Home } from 'lucide-react';
// import { openVoiceChat } from '../lib/chatWidget';
import LeoLogo from '../assets/Leo_logo_round.png';
import { getCurrentUser, signOut } from '../lib/auth';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  onStartVoiceDemo?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStartVoiceDemo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to handle navigation with hash scrolling
  const handleHashNavigation = (hash: string) => {
    if (isHomePage) {
      // Already on home page, just scroll
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home first, then scroll after a brief delay
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check when route changes

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.display_name || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'User';
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <img
              src={LeoLogo}
              alt="Leo AI Voice Agent Logo"
              className="w-10 h-10 rounded-full"
            />
            <h1 className="text-xl font-bold text-[#1E293B]">Leo Voice Agent</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleHashNavigation('#benefits')}
              className="text-[#1E293B] hover:text-[#38BDF8] transition-colors"
            >
              Benefits
            </button>

            <button
              onClick={() => handleHashNavigation('#how-it-works')}
              className="text-[#1E293B] hover:text-[#38BDF8] transition-colors"
            >
              How Leo Works
            </button>

            <button
              onClick={() => handleHashNavigation('#faq')}
              className="text-[#1E293B] hover:text-[#38BDF8] transition-colors"
            >
              FAQ
            </button>

            <Link to="/roi-calculator" className="text-[#1E293B] hover:text-[#38BDF8] transition-colors">
              Impact Calculator
            </Link>

            {/* Show different options based on auth status */}
            {isLoading ? (
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link to="/app" className="text-[#1E293B] hover:text-[#38BDF8] transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 px-3 py-1 bg-[#F5F3EF] rounded-lg">
                  <User className="w-4 h-4 text-[#64748B]" />
                  <span className="text-sm text-[#1E293B] font-medium">{getDisplayName()}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-[#64748B] hover:text-red-600 transition-colors flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-[#1E293B] hover:text-[#38BDF8] transition-colors">
                Login
              </Link>
            )}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onStartVoiceDemo || (() => alert('Voice demo not available'))}
              className="bg-[#F7EF00] text-[#1E293B] px-6 py-2 rounded-full font-semibold hover:bg-[#F7EF00]/90 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Try Leo Free</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onStartVoiceDemo || (() => alert('Voice demo not available'))}
              className="bg-[#F7EF00] text-[#1E293B] px-3 py-2 rounded-full font-semibold hover:bg-[#F7EF00]/90 transition-all duration-200 flex items-center space-x-1 text-sm"
            >
              <Phone className="w-3 h-3" />
              <span>Try Free</span>
            </button>
            <button
              onClick={toggleMobileMenu}
              className="text-[#1E293B] hover:text-[#38BDF8] transition-colors p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 pt-4">
              <button
                onClick={() => {
                  handleHashNavigation('#benefits');
                  closeMobileMenu();
                }}
                className="text-[#1E293B] hover:text-[#38BDF8] transition-colors py-2 text-left"
              >
                Benefits
              </button>

              <button
                onClick={() => {
                  handleHashNavigation('#how-it-works');
                  closeMobileMenu();
                }}
                className="text-[#1E293B] hover:text-[#38BDF8] transition-colors py-2 text-left"
              >
                How Leo Works
              </button>

              <button
                onClick={() => {
                  handleHashNavigation('#faq');
                  closeMobileMenu();
                }}
                className="text-[#1E293B] hover:text-[#38BDF8] transition-colors py-2 text-left"
              >
                FAQ
              </button>

              <Link
                to="/roi-calculator"
                className="text-[#1E293B] hover:text-[#38BDF8] transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Impact Calculator
              </Link>
              
              {/* Show different options based on auth status in mobile menu */}
              {isLoading ? (
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <>
                  <Link 
                    to="/app" 
                    className="text-[#1E293B] hover:text-[#38BDF8] transition-colors py-2 font-semibold"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-[#F5F3EF] rounded-lg">
                    <User className="w-4 h-4 text-[#64748B]" />
                    <span className="text-sm text-[#1E293B] font-medium">{getDisplayName()}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      closeMobileMenu();
                    }}
                    className="text-[#64748B] hover:text-red-600 transition-colors py-2 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="text-[#1E293B] hover:text-[#38BDF8] transition-colors py-2 font-semibold"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;