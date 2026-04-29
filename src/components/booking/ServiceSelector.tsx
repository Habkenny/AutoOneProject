import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User, Car, MapPin, CreditCard, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { Workshop, WorkshopService } from '../../lib/schemas';
import { apiService } from '../../lib/api';
import StripePaymentForm from '../payment/StripePaymentForm';

interface ServiceSelectorProps {
  service: WorkshopService;
  workshop: Workshop;
  onClose: () => void;
}

type BookingStep = 'details' | 'datetime' | 'confirmation' | 'payment' | 'success';

export default function ServiceSelector({ service, workshop, onClose }: ServiceSelectorProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<BookingStep>('details');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.displayName || '',
    phone: '',
    email: user?.email || '',
  });

  // Vehicle information
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
  });

  const [notes, setNotes] = useState('');
  const [bookingId, setBookingId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');

  useEffect(() => {
    if (currentStep === 'datetime' && selectedDate) {
      loadAvailableSlots();
    }
  }, [currentStep, selectedDate]);

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const result = await apiService.getAvailableSlots(
        apiService.formatAvailableSlotsData('workshop', service.id, selectedDate, workshop.id)
      );

      if (result.success && result.availableSlots) {
        setAvailableSlots(result.availableSlots);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (currentStep === 'details') {
      setCurrentStep('datetime');
    } else if (currentStep === 'datetime' && selectedDate && selectedTime) {
      setCurrentStep('confirmation');
    } else if (currentStep === 'confirmation') {
      handleCreateBooking();
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const bookingData = apiService.formatBookingData(
        'workshop',
        service.id,
        workshop.id,
        scheduledAt,
        service.price,
        customerInfo,
        vehicleInfo,
        undefined, // location (not needed for workshops)
        notes
      );

      // Create payment intent first
      const paymentResult = await apiService.createPaymentIntent({
        amount: service.price * 100, // Convert to cents
        currency: 'aed',
        bookingData,
      });

      if (paymentResult.success && paymentResult.clientSecret) {
        setClientSecret(paymentResult.clientSecret);
        setBookingId(paymentResult.bookingId || '');
        setCurrentStep('payment');
      } else {
        console.error('Error creating payment intent:', paymentResult.error);
        // Handle error (show toast, etc.)
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    // Payment was successful, confirm the booking
    try {
      const confirmResult = await apiService.confirmBooking(bookingId, paymentIntent.id);
      if (confirmResult.success) {
        setCurrentStep('success');
      } else {
        setPaymentError('Failed to confirm booking. Please contact support.');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      setPaymentError('Failed to confirm booking. Please contact support.');
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'details':
        return customerInfo.name && customerInfo.phone && customerInfo.email;
      case 'datetime':
        return selectedDate && selectedTime;
      case 'confirmation':
        return true;
      case 'payment':
        return true;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details':
        return t('Customer Information');
      case 'datetime':
        return t('Select Date & Time');
      case 'confirmation':
        return t('Confirm Booking');
      case 'payment':
        return t('Payment');
      case 'success':
        return t('Booking Confirmed');
      default:
        return '';
    }
  };

  const renderStepIndicator = () => {
    const steps: BookingStep[] = ['details', 'datetime', 'confirmation', 'payment', 'success'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 ${
                  index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{t('Full Name')} *</Label>
          <Input
            id="name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
            placeholder={t('Enter your full name')}
          />
        </div>
        <div>
          <Label htmlFor="phone">{t('Phone Number')} *</Label>
          <Input
            id="phone"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            placeholder={t('Enter your phone number')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">{t('Email Address')} *</Label>
        <Input
          id="email"
          type="email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
          placeholder={t('Enter your email address')}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">{t('Vehicle Information')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="make">{t('Make')}</Label>
            <Input
              id="make"
              value={vehicleInfo.make}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
              placeholder={t('e.g., Toyota')}
            />
          </div>
          <div>
            <Label htmlFor="model">{t('Model')}</Label>
            <Input
              id="model"
              value={vehicleInfo.model}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
              placeholder={t('e.g., Camry')}
            />
          </div>
          <div>
            <Label htmlFor="year">{t('Year')}</Label>
            <Input
              id="year"
              type="number"
              value={vehicleInfo.year}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: parseInt(e.target.value) || new Date().getFullYear() })}
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div>
            <Label htmlFor="licensePlate">{t('License Plate')}</Label>
            <Input
              id="licensePlate"
              value={vehicleInfo.licensePlate}
              onChange={(e) => setVehicleInfo({ ...vehicleInfo, licensePlate: e.target.value })}
              placeholder={t('Optional')}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">{t('Additional Notes')}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('Any special requests or notes for the workshop')}
          rows={3}
        />
      </div>
    </div>
  );

  const renderDateTimeStep = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return (
      <div className="space-y-6">
        {/* Date Selection */}
        <div>
          <h3 className="text-lg font-medium mb-4">{t('Select Date')}</h3>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => (
              <Button
                key={date.toISOString()}
                variant={selectedDate?.toDateString() === date.toDateString() ? 'default' : 'outline'}
                className="h-12"
                onClick={() => handleDateSelect(date)}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-medium">
                    {date.getDate()}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <h3 className="text-lg font-medium mb-4">{t('Select Time')}</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">{t('Loading available times...')}</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('No available times for this date')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    onClick={() => handleTimeSelect(time)}
                    className="h-10"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderConfirmationStep = () => {
    if (!selectedDate || !selectedTime) return null;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Booking Summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">{t('Service')}:</span>
              <span>{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('Workshop')}:</span>
              <span>{workshop.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('Date & Time')}:</span>
              <span>{scheduledAt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('Duration')}:</span>
              <span>{service.duration} minutes</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>{t('Total')}:</span>
              <span>{service.price} AED</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Customer Information')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>{t('Name')}:</span>
              <span>{customerInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Phone')}:</span>
              <span>{customerInfo.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Email')}:</span>
              <span>{customerInfo.email}</span>
            </div>
          </CardContent>
        </Card>

        {vehicleInfo.make && (
          <Card>
            <CardHeader>
              <CardTitle>{t('Vehicle Information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>{t('Vehicle')}:</span>
                <span>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</span>
              </div>
              {vehicleInfo.licensePlate && (
                <div className="flex justify-between">
                  <span>{t('License Plate')}:</span>
                  <span>{vehicleInfo.licensePlate}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {notes && (
          <Card>
            <CardHeader>
              <CardTitle>{t('Notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {clientSecret ? (
        <StripePaymentForm
          clientSecret={clientSecret}
          amount={service.price}
          currency="aed"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              {t('Payment Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {t('Preparing payment...')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{paymentError}</p>
        </div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Booking Confirmed!')}</h2>
        <p className="text-gray-600">
          {t('Your booking has been successfully created. You will receive a confirmation email shortly.')}
        </p>
      </div>
      {bookingId && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">{t('Booking ID')}</p>
          <p className="font-mono text-lg font-medium">{bookingId}</p>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        return renderDetailsStep();
      case 'datetime':
        return renderDateTimeStep();
      case 'confirmation':
        return renderConfirmationStep();
      case 'payment':
        return renderPaymentStep();
      case 'success':
        return renderSuccessStep();
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {currentStep !== 'success' && renderStepIndicator()}
            {renderCurrentStep()}
          </div>

          {currentStep !== 'success' && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={onClose}>
                {t('Cancel')}
              </Button>
              {currentStep !== 'payment' && currentStep !== 'success' && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                >
                  {loading ? t('Loading...') : currentStep === 'confirmation' ? t('Confirm Booking') : t('Next')}
                </Button>
              )}
            </div>
          )}

          {currentStep === 'success' && (
            <div className="flex justify-center p-6 border-t bg-gray-50">
              <Button onClick={onClose} className="px-8">
                {t('Done')}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}