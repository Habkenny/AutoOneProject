import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import StripePaymentForm from '../payment/StripePaymentForm';
import { apiService } from '../../lib/api';

interface CarWashService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  type: string;
}

interface CarWashBookingData {
  service: CarWashService | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  specialInstructions: string;
}

interface CarWashBookingProps {
  services: CarWashService[];
  onClose: () => void;
}

export default function CarWashBooking({ services, onClose }: CarWashBookingProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<CarWashBookingData>({
    service: null,
    customerName: '',
    phone: '',
    email: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    specialInstructions: '',
  });
  const [clientSecret, setClientSecret] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Service Selection', icon: '🧽' },
    { id: 2, title: 'Customer Details', icon: '👤' },
    { id: 3, title: 'Date & Time', icon: '📅' },
    { id: 4, title: 'Confirmation', icon: '✅' },
    { id: 5, title: 'Payment', icon: '💳' },
    { id: 6, title: 'Success', icon: '🎉' },
  ];

  const handleServiceSelect = (service: CarWashService) => {
    setBookingData(prev => ({ ...prev, service }));
    setCurrentStep(2);
  };

  const handleInputChange = (field: keyof CarWashBookingData, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!bookingData.service) return;

    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = bookingData.preferredTime.split(':').map(Number);
      const scheduledAt = new Date(bookingData.preferredDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const bookingDataForAPI = apiService.formatBookingData(
        'car_wash',
        bookingData.service.id,
        undefined, // no workshop for car wash
        scheduledAt,
        bookingData.service.price,
        {
          name: bookingData.customerName,
          phone: bookingData.phone,
          email: bookingData.email,
        },
        undefined, // no vehicle info for car wash
        {
          address: bookingData.address,
          latitude: 0, // TODO: Add geocoding
          longitude: 0,
        },
        bookingData.specialInstructions
      );

      // Create payment intent
      const paymentResult = await apiService.createPaymentIntent({
        amount: bookingData.service.price * 100, // Convert to cents
        currency: 'aed',
        bookingData: bookingDataForAPI,
      });

      if (paymentResult.success && paymentResult.clientSecret) {
        setClientSecret(paymentResult.clientSecret);
        setBookingId(paymentResult.bookingId || '');
        setCurrentStep(5); // Go to payment step
      } else {
        setPaymentError(paymentResult.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setPaymentError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step.id
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : <span>{step.icon}</span>}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${
              currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderServiceSelection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Choose Your Car Wash Service</h2>
      {services.map((service) => (
        <motion.div
          key={service.id}
          whileHover={{ scale: 1.02 }}
          className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
          onClick={() => handleServiceSelect(service)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{service.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                <span className="text-sm text-gray-500">{service.duration} minutes</span>
                <Badge variant="secondary" className="ml-2">
                  {service.type}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{service.price} AED</div>
              <Button size="sm" className="mt-2">Select</Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCustomerDetails = () => (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Customer Information</h2>

      <div>
        <Label htmlFor="customerName">Full Name</Label>
        <Input
          id="customerName"
          value={bookingData.customerName}
          onChange={(e) => handleInputChange('customerName', e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={bookingData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+971 XX XXX XXXX"
        />
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={bookingData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <Label htmlFor="address">Service Address</Label>
        <Textarea
          id="address"
          value={bookingData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter your complete address for car wash service"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
        <Textarea
          id="specialInstructions"
          value={bookingData.specialInstructions}
          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
          placeholder="Any special requests or instructions..."
          rows={2}
        />
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Select Date & Time</h2>

      <div>
        <Label htmlFor="preferredDate">Preferred Date</Label>
        <Input
          id="preferredDate"
          type="date"
          value={bookingData.preferredDate}
          onChange={(e) => handleInputChange('preferredDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <Label htmlFor="preferredTime">Preferred Time</Label>
        <select
          id="preferredTime"
          value={bookingData.preferredTime}
          onChange={(e) => handleInputChange('preferredTime', e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Select time</option>
          <option value="09:00">9:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="12:00">12:00 PM</option>
          <option value="13:00">1:00 PM</option>
          <option value="14:00">2:00 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="16:00">4:00 PM</option>
          <option value="17:00">5:00 PM</option>
          <option value="18:00">6:00 PM</option>
        </select>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Our car wash service operates from 9 AM to 6 PM.
          We'll confirm your booking and send you a notification with the exact arrival time.
        </p>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Booking Confirmation</h2>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{bookingData.service?.name}</h3>
            <p className="text-sm text-gray-600">{bookingData.service?.description}</p>
          </div>

          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{bookingData.service?.duration} minutes</span>
          </div>

          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-bold">{bookingData.service?.price} AED</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Name:</strong> {bookingData.customerName}</div>
          <div><strong>Phone:</strong> {bookingData.phone}</div>
          <div><strong>Email:</strong> {bookingData.email}</div>
          <div><strong>Address:</strong> {bookingData.address}</div>
          {bookingData.specialInstructions && (
            <div><strong>Instructions:</strong> {bookingData.specialInstructions}</div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{bookingData.preferredDate}</span>
          </div>
          <div className="flex items-center mt-2">
            <Clock className="w-4 h-4 mr-2" />
            <span>{bookingData.preferredTime}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      {clientSecret ? (
        <StripePaymentForm
          clientSecret={clientSecret}
          amount={bookingData.service?.price || 0}
          currency="aed"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Preparing payment...
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

  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-6">
        Your car wash booking has been successfully submitted. We'll send you a confirmation email and SMS with the service details.
      </p>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600">
            <p><strong>Booking ID:</strong> {bookingId}</p>
            <p><strong>Service:</strong> {bookingData.service?.name}</p>
            <p><strong>Date:</strong> {bookingData.preferredDate}</p>
            <p><strong>Time:</strong> {bookingData.preferredTime}</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onClose} className="w-full">
        Back to Services
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderServiceSelection();
      case 2: return renderCustomerDetails();
      case 3: return renderDateTimeSelection();
      case 4: return renderConfirmation();
      case 5: return renderPayment();
      case 6: return renderSuccess();
      default: return renderServiceSelection();
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    // Payment was successful, confirm the booking
    try {
      const confirmResult = await apiService.confirmBooking(bookingId, paymentIntent.id);
      if (confirmResult.success) {
        setCurrentStep(6); // Go to success step
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
      case 1: return bookingData.service !== null;
      case 2: return bookingData.customerName && bookingData.phone && bookingData.email && bookingData.address;
      case 3: return bookingData.preferredDate && bookingData.preferredTime;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Book Car Wash Service</h1>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>

          {renderStepIndicator()}

          <div className="min-h-[400px]">
            {renderCurrentStep()}
          </div>

          {currentStep < 6 && currentStep !== 5 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? onClose : handlePrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </Button>

              {currentStep < 4 && (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {currentStep === 4 && (
                <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
                  <CreditCard className="w-4 h-4 mr-1" />
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="flex justify-center mt-8">
              <Button onClick={onClose} className="px-8">
                Done
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}