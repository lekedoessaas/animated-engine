import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Lock, Clock, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PaymentPreview } from '@/components/PaymentPreview';
import { CurrencySelector } from '@/components/CurrencySelector';
import { CurrencyService } from '@/services/currencyService';
import { trackEvent, trackPurchase } from '@/components/Analytics';

interface PaymentLinkData {
  id: string;
  file_id: string;
  custom_price?: number;
  custom_message?: string;
  expires_at?: string;
  max_downloads: number;
  current_downloads: number;
  is_active: boolean;
  files: {
    id: string;
    title: string;
    description: string;
    price: number;
    file_size: number;
    file_type: string;
    user_id: string;
  };
}

interface UserProfile {
  id: string;
  subscription_tier?: string;
}

const PaymentPage = () => {
  const { linkCode } = useParams<{ linkCode: string }>();
  const navigate = useNavigate();
  const [paymentLink, setPaymentLink] = useState<PaymentLinkData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (linkCode) {
      fetchPaymentLink();
    }
  }, [linkCode]);

  const fetchPaymentLink = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching payment link for code:', linkCode);

      const { data, error } = await supabase
        .from('payment_links')
        .select(`
          *,
          files (
            id,
            title,
            description,
            price,
            file_size,
            file_type,
            user_id
          )
        `)
        .eq('link_code', linkCode)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching payment link:', error);
        throw new Error('Payment link not found or inactive');
      }

      console.log('Payment link data:', data);

      // Check if link has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('This payment link has expired');
      }

      // Check if download limit reached
      if (data.current_downloads >= data.max_downloads) {
        throw new Error('This payment link has reached its download limit');
      }

      setPaymentLink(data as PaymentLinkData);

      // Fetch user profile to determine plan
      if (data.files.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, plan_type')
          .eq('id', data.files.user_id)
          .single();

        setUserProfile({
          id: data.files.user_id,
          subscription_tier: profile?.plan_type || 'professional'
        });
      }
    } catch (error: any) {
      console.error('Error fetching payment link:', error);
      setError(error.message || 'Failed to load payment link');
      toast({
        title: "Error",
        description: error.message || 'Failed to load payment link',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!customerData.email || !customerData.name) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!customerData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (customerData.name.trim().length < 2) {
      setError('Please enter a valid full name');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!paymentLink) {
      setError('Payment link data not available');
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Initializing payment...');
      
      const baseAmount = paymentLink.custom_price || paymentLink.files.price;
      const convertedAmount = await CurrencyService.convertAmount(baseAmount, 'USD', selectedCurrency);
      const userPlan = (userProfile?.subscription_tier as 'starter' | 'professional' | 'enterprise') || 'professional';
      const platformFee = CurrencyService.calculatePlatformFee(convertedAmount, userPlan);
      const totalAmount = convertedAmount + platformFee;
      
      const txRef = `tx_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      console.log('Payment details:', {
        baseAmount,
        convertedAmount,
        platformFee,
        totalAmount,
        selectedCurrency,
        userPlan
      });

      // Track payment initiation
      trackEvent('begin_checkout', {
        value: totalAmount,
        currency: selectedCurrency,
        content_type: 'digital_file',
        file_title: paymentLink.files.title
      });

      // Call edge function to initialize payment
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          payment_link_id: paymentLink.id,
          file_id: paymentLink.file_id,
          amount: totalAmount,
          currency: selectedCurrency,
          original_amount: baseAmount,
          original_currency: 'USD',
          platform_fee: platformFee,
          customer_email: customerData.email,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          tx_ref: txRef
        }
      });

      if (error) {
        console.error('Payment initialization error:', error);
        throw new Error(error.message || 'Failed to initialize payment');
      }

      console.log('Payment initialized successfully:', data);

      if (data?.payment_url) {
        // Track payment redirect
        trackEvent('payment_redirect', {
          payment_method: 'flutterwave',
          value: totalAmount,
          currency: selectedCurrency
        });

        // Redirect to Flutterwave
        window.location.href = data.payment_url;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      const errorMessage = error.message || 'Unable to initialize payment. Please try again.';
      setError(errorMessage);
      
      // Track payment error
      trackEvent('payment_error', {
        error_message: errorMessage,
        step: 'initialization'
      });
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchPaymentLink();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payment details...</span>
        </div>
      </div>
    );
  }

  if (error && !paymentLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Payment Link</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Link Not Found</h3>
            <p className="text-muted-foreground">This payment link is not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const basePrice = paymentLink.custom_price || paymentLink.files.price;
  const userPlan = (userProfile?.subscription_tier as 'starter' | 'professional' | 'enterprise') || 'professional';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure File Purchase</h1>
          <p className="text-gray-600">Complete your purchase to download the file</p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{paymentLink.files.title}</h3>
                {paymentLink.files.description && (
                  <p className="text-muted-foreground mt-1">{paymentLink.files.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File Size:</span>
                  <p className="font-medium">{formatFileSize(paymentLink.files.file_size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Type:</span>
                  <p className="font-medium">{paymentLink.files.file_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{paymentLink.max_downloads - paymentLink.current_downloads} downloads left</span>
                </div>
                {paymentLink.expires_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Expires {new Date(paymentLink.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Customer Information Form */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Customer Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      disabled={processing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      disabled={processing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    disabled={processing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Payment Currency</Label>
                  <CurrencySelector
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                    disabled={processing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Preview */}
          <div className="space-y-6">
            <PaymentPreview
              baseAmount={basePrice}
              baseCurrency="USD"
              userPlan={userPlan}
              selectedCurrency={selectedCurrency}
              customMessage={paymentLink.custom_message}
            />

            <Button 
              onClick={handlePayment}
              disabled={processing || !customerData.email || !customerData.name}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Complete Payment'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Secure payment with multi-currency support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
