import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Globe, Car, Wrench, Droplets, Key, Plane, LogOut } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, signInWithGoogle, signOut, isAdmin } = useAuth();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  return (
    <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl tracking-tight text-slate-900">{t("Auto One")}</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/workshops" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                <Wrench className="h-4 w-4" />
                <span>{t("Workshops")}</span>
              </Link>
              <Link to="/carwash" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                <Droplets className="h-4 w-4" />
                <span>{t("Car Wash")}</span>
              </Link>
              <Link to="/rentals" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                <Key className="h-4 w-4" />
                <span>{t("Rentals")}</span>
              </Link>
              <Link to="/imports" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1">
                <Plane className="h-4 w-4" />
                <span>{t("Imports")}</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  {t("Dashboard")}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{i18n.language.toUpperCase()}</span>
              </Button>
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">English</button>
                <button onClick={() => changeLanguage('ar')} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">العربية</button>
                <button onClick={() => changeLanguage('de')} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">Deutsch</button>
              </div>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 hidden md:block">{user.displayName || user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut} className="flex items-center space-x-1">
                  <LogOut className="h-4 w-4" />
                  <span>{t("Sign Out")}</span>
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={signInWithGoogle}>
                {t("Sign In")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
