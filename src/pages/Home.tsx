import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, MapPin, Calendar, Car, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3566&auto=format&fit=crop" 
            alt="Hero Car" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            {t("Welcome to Auto One")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-10"
          >
            {t("The all-in-one app for car services in the Middle East.")}
          </motion.p>
          
          {/* Main Search/Action Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-4xl text-slate-900"
          >
            <div className={`flex flex-col md:flex-row gap-4 ${isRtl ? 'md:space-x-reverse' : ''}`}>
              <div className="relative flex-grow">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 h-5 w-5 text-slate-400`} />
                <Input placeholder="What service do you need?" className={`pl-10 ${isRtl ? 'pr-10 pl-3' : ''} h-12 text-lg`} />
              </div>
              <div className="relative md:w-64">
                <MapPin className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 h-5 w-5 text-slate-400`} />
                <Input placeholder="Location" className={`pl-10 ${isRtl ? 'pr-10 pl-3' : ''} h-12 text-lg`} />
              </div>
              <Button size="lg" className="h-12 px-8 text-lg">{t("Find Services")}</Button>
            </div>
            
            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 border-t pt-6">
              {[
                { name: t("Workshops"), path: "/workshops", icon: <Wrench className="w-5 h-5" /> },
                { name: t("Car Wash"), path: "/carwash", icon: <Droplets className="w-5 h-5" /> },
                { name: t("Rentals"), path: "/rentals", icon: <Key className="w-5 h-5" /> },
                { name: t("Imports"), path: "/imports", icon: <Plane className="w-5 h-5" /> },
              ].map((link, idx) => (
                <Link key={idx} to={link.path}>
                  <Button variant="secondary" className="flex items-center space-x-2">
                    {link.icon}
                    <span>{link.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why choose Auto One?</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">We bring all your automotive needs into one unified experience powered by AI.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted Partners</h3>
              <p className="text-slate-600">All our workshops and rental agencies are strictly vetted for quality and reliability.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-6">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Cost Estimation</h3>
              <p className="text-slate-600">Get instant AI-driven estimates for repairs, rentals, and imports before you book.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Time</h3>
              <p className="text-slate-600">Book at-home car washes or fast-track imports directly from your phone.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Temporary inline icons until we fix imports
function Wrench(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
function Droplets(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> }
function Key(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg> }
function Plane(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> }
