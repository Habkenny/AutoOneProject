import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { MapPin, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Workshops() {
  const { t } = useTranslation();

  const mockWorkshops = [
    { id: '1', name: "Al Futtaim Auto Center", address: "Dubai Festival City, Dubai", rating: 4.8, type: "General Repair" },
    { id: '2', name: "Dyno Tuning Services", address: "Al Quoz, Dubai", rating: 4.5, type: "Performance & Tuning" },
    { id: '3', name: "Quick Lane Auto Center", address: "Sheikh Zayed Road", rating: 4.2, type: "Oil & Filter, Tires" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t("Workshops")}</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWorkshops.map((workshop) => (
          <motion.div 
            key={workshop.id}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-2">{workshop.name}</h3>
            <div className="flex items-center text-slate-500 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{workshop.address}</span>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{workshop.type}</span>
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="font-medium text-slate-700">{workshop.rating}</span>
              </div>
            </div>
            
            <Link to={`/workshops/${workshop.id}`}>
              <Button className="w-full">{t("View Details")}</Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
