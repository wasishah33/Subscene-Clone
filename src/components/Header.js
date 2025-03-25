import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthModal from './AuthModal';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login');
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setUser(userData);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkAuth();
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        router.push('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Open auth modal with specified view
  const openAuthModal = (view) => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Subscene</span>
            </Link>
            <nav className="ml-8 hidden md:flex">
              <ul className="flex space-x-6">
                <li>
                  <Link 
                    href="/" 
                    className={`text-gray-700 hover:text-blue-600 ${
                      router.pathname === '/' ? 'font-semibold text-blue-600' : ''
                    }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/browse" 
                    className={`text-gray-700 hover:text-blue-600 ${
                      router.pathname === '/browse' ? 'font-semibold text-blue-600' : ''
                    }`}
                  >
                    Browse
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/movie-search" 
                    className={`text-gray-700 hover:text-blue-600 ${
                      router.pathname === '/movie-search' ? 'font-semibold text-blue-600' : ''
                    }`}
                  >
                    Movies & TV
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/search" 
                    className={`text-gray-700 hover:text-blue-600 ${
                      router.pathname === '/search' ? 'font-semibold text-blue-600' : ''
                    }`}
                  >
                    Search
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className={`text-gray-700 hover:text-blue-600 ${
                      router.pathname === '/about' ? 'font-semibold text-blue-600' : ''
                    }`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/subtitles/upload" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Subtitle
                </Link>
                <div className="relative group">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="mr-1">{user?.username || 'Account'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Account
                    </Link>
                    <Link href="/my-uploads" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Uploads
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuthModal('register')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView}
      />
    </header>
  );
} 