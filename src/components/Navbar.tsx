
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isLoggedIn, onLogout }: NavbarProps) => {
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary mr-1">Contact</span>
              <span className="text-xl font-bold text-gray-800">Compass</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-primary">
              {t('nav.home')}
            </Link>
            {isLoggedIn && (
              <Link to="/dashboard" className="text-gray-600 hover:text-primary">
                {t('nav.dashboard')}
              </Link>
            )}
            <LanguageSelector />
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {isGuest && !user && (
                  <span className="text-sm text-amber-600 font-medium px-2 py-1 bg-amber-50 rounded-full">
                    Guest Mode
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {isGuest && !user ? 'Exit Guest' : t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">{t('nav.register')}</Button>
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center">
            <LanguageSelector />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              {isLoggedIn && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-primary py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
              )}
              
              {isLoggedIn ? (
                <>
                  {isGuest && !user && (
                    <div className="py-2">
                      <span className="text-sm text-amber-600 font-medium px-2 py-1 bg-amber-50 rounded-full">
                        Guest Mode
                      </span>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isGuest && !user ? 'Exit Guest' : t('nav.logout')}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="default" className="w-full">{t('nav.register')}</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
