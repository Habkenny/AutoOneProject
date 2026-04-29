import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Droplets, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import CarWashBooking from '../components/booking/CarWashBooking';

export default function CarWash() {
  const { t } = useTranslation();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const services = [
    {
      id: 'express',
      name: "Express Wash",
      price: 40,
      duration: 30,
      type: "express",
      desc: "Exterior wash and tire shine - perfect for a quick clean."
    },
    {
      id: 'standard',
      name: "Standard Wash",
      price: 80,
      duration: 60,
      type: "standard",
      desc: "Exterior wash, interior vacuuming, and dashboard cleaning."
    },
    {
      id: 'premium',
      name: "Premium Detailing",
      price: 150,
      duration: 120,
      type: "premium",
      desc: "Full interior and exterior detail with wax protection."
    },
  ];

  const handleBookNow = (service: any) => {
    setSelectedService(service);
    setShowBooking(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t("Car Wash")} - At Home or Station</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="space-y-6">
            {services.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div>
                  <div className="flex items-center mb-2">
                    <Droplets className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                  </div>
                  <p className="text-slate-600 mb-2">{service.desc}</p>
                  <div className="flex items-center text-sm text-slate-500">
                    <Clock className="w-4 h-4 mr-1" /> {service.duration} minutes
                  </div>
                </div>

                <div className="mt-4 md:mt-0 text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                  <span className="text-xl font-bold text-slate-900">{service.price} AED</span>
                  <Button
                    className="mt-2 md:w-full"
                    onClick={() => handleBookNow(service)}
                  >
                    {t("Book Now")}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Location Check</h3>
            <p className="text-sm text-blue-800 mb-4">We provide on-demand car wash services to your home or office in select areas.</p>
            <div className="relative mb-4">
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-blue-400" />
              <input type="text" placeholder="Enter your area" className="w-full h-10 pl-10 pr-3 rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button className="w-full">Check Availability</Button>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mt-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">Why Choose Us?</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ Professional mobile service</li>
              <li>✓ Eco-friendly products</li>
              <li>✓ Fully insured technicians</li>
              <li>✓ Satisfaction guarantee</li>
              <li>✓ Real-time tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {showBooking && selectedService && (
        <CarWashBooking
          services={[selectedService]}
          onClose={() => {
            setShowBooking(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}
