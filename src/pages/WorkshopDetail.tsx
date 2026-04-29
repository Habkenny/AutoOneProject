import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Star, ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Workshop, WorkshopService } from '../lib/schemas';
import ServiceSelector from '../components/booking/ServiceSelector';

export default function WorkshopDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [services, setServices] = useState<WorkshopService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<WorkshopService | null>(null);
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkshopData();
    }
  }, [id]);

  const loadWorkshopData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Load workshop data
      const workshopDoc = await getDoc(doc(db, 'workshops', id));
      if (workshopDoc.exists()) {
        setWorkshop({ id: workshopDoc.id, ...workshopDoc.data() } as Workshop);
      }

      // Load services
      const servicesSnapshot = await getDocs(collection(db, 'workshops', id, 'services'));
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkshopService[];
      setServices(servicesData.filter(service => service.isActive));
    } catch (error) {
      console.error('Error loading workshop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: WorkshopService) => {
    if (!user) {
      // Redirect to sign in
      navigate('/workshops');
      return;
    }
    setSelectedService(service);
    setShowServiceSelector(true);
  };

  const getDayName = (day: string) => {
    const days = {
      monday: t('Monday'),
      tuesday: t('Tuesday'),
      wednesday: t('Wednesday'),
      thursday: t('Thursday'),
      friday: t('Friday'),
      saturday: t('Saturday'),
      sunday: t('Sunday'),
    };
    return days[day as keyof typeof days] || day;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('Workshop not found')}</h1>
          <Button onClick={() => navigate('/workshops')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Back to Workshops')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/workshops')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Workshops')}
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{workshop.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{workshop.address}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{workshop.rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({workshop.reviewCount} reviews)</span>
              </div>
              <Badge variant="secondary">{t('Verified Workshop')}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Description */}
          {workshop.description && (
            <Card>
              <CardHeader>
                <CardTitle>{t('About')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{workshop.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Contact Information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                <span>{workshop.phone}</span>
              </div>
              {workshop.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span>{workshop.email}</span>
                </div>
              )}
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                <span>{workshop.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Services')}</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('No services available')}</p>
              ) : (
                <div className="grid gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{service.duration} minutes</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{service.price} AED</div>
                        <Button
                          onClick={() => handleBookService(service)}
                          className="mt-2"
                          size="sm"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {t('Book Now')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {t('Working Hours')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Object.entries(workshop.workingHours) as [keyof Workshop['workingHours'], Workshop['workingHours'][keyof Workshop['workingHours']]][]).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{getDayName(day)}</span>
                    <span className={`text-sm ${hours.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                      {hours.isOpen ? `${hours.open} - ${hours.close}` : t('Closed')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Quick Actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => window.open(`tel:${workshop.phone}`)}
              >
                <Phone className="w-4 h-4 mr-2" />
                {t('Call Now')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(workshop.address)}`)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('Get Directions')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Selector Modal */}
      {showServiceSelector && selectedService && (
        <ServiceSelector
          service={selectedService}
          workshop={workshop}
          onClose={() => {
            setShowServiceSelector(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}