
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Shield, CreditCard, BarChart3, Users, Globe, Zap, Star, ArrowRight, Lock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'starter' | 'professional' | 'enterprise';
  planPrice: { monthly: number; yearly?: number };
  isStarter?: boolean;
}

const PaymentModal = ({ isOpen, onClose, planType, planPrice, isStarter = false }: PaymentModalProps) => {
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    password: '',
    billing_cycle: 'monthly' as 'monthly' | 'yearly'
  });
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!customerData.email || !customerData.name || !customerData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          plan_type: planType,
          billing_cycle: customerData.billing_cycle,
          customer_email: customerData.email,
          customer_name: customerData.name
        }
      });

      if (error) throw error;

      // Store user data for after payment verification
      localStorage.setItem('pending_user_data', JSON.stringify({
        email: customerData.email,
        name: customerData.name,
        password: customerData.password
      }));

      // Redirect to Flutterwave
      window.location.href = data.payment_url;

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  // For starter plan, always show trial pricing for monthly billing
  const isTrialFlow = isStarter && customerData.billing_cycle === 'monthly';
  const displayPrice = isTrialFlow ? 1.00 : planPrice[customerData.billing_cycle];
  const yearlyDiscount = planPrice.yearly ? Math.round((1 - planPrice.yearly / (planPrice.monthly * 12)) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscribe to {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
          </DialogTitle>
          <DialogDescription>
            {isTrialFlow 
              ? 'Start your 7-day trial for $1, then $9.99/month' 
              : `Get instant access to ${planType} features`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {planType !== 'starter' && planPrice.yearly && (
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select value={customerData.billing_cycle} onValueChange={(value) => setCustomerData(prev => ({ ...prev, billing_cycle: value as 'monthly' | 'yearly' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly - ${planPrice.monthly}/month</SelectItem>
                  <SelectItem value="yearly">
                    Yearly - ${planPrice.yearly}/year 
                    <Badge variant="secondary" className="ml-2">Save {yearlyDiscount}%</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show billing cycle selector for starter plan too, but with trial info */}
          {planType === 'starter' && planPrice.yearly && (
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select value={customerData.billing_cycle} onValueChange={(value) => setCustomerData(prev => ({ ...prev, billing_cycle: value as 'monthly' | 'yearly' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly - $1 trial (7 days), then $9.99/month</SelectItem>
                  <SelectItem value="yearly">
                    Yearly - ${planPrice.yearly}/year 
                    <Badge variant="secondary" className="ml-2">Save {yearlyDiscount}%</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={customerData.name}
              onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={customerData.password}
              onChange={(e) => setCustomerData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Create a secure password"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {isTrialFlow ? 'Trial Price:' : 'Total:'}
              </span>
              <span className="text-xl font-bold">${displayPrice}</span>
            </div>
            {isTrialFlow && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  🎉 7-day trial for just $1
                </p>
                <p className="text-xs text-gray-500">
                  Then $9.99/month automatically
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={handlePayment}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Processing...' : `Pay $${displayPrice} - ${isTrialFlow ? 'Start Trial' : 'Get Access'}`}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Secure payment with Flutterwave • 30-day money back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Index = () => {
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    planType: 'starter' | 'professional' | 'enterprise';
    planPrice: { monthly: number; yearly?: number };
    isStarter?: boolean;
  }>({
    isOpen: false,
    planType: 'starter',
    planPrice: { monthly: 9 },
    isStarter: false
  });

  const openPaymentModal = (planType: 'starter' | 'professional' | 'enterprise') => {
    const planPrices = {
      starter: { monthly: 9, yearly: 90 },
      professional: { monthly: 29, yearly: 290 },
      enterprise: { monthly: 99, yearly: 990 }
    };

    setPaymentModal({
      isOpen: true,
      planType,
      planPrice: planPrices[planType],
      isStarter: planType === 'starter'
    });
  };

  const features = [
    {
      icon: Shield,
      title: "Advanced File Protection",
      description: "Military-grade encryption and access controls"
    },
    {
      icon: CreditCard,
      title: "Seamless Payments",
      description: "Accept payments globally with Flutterwave"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track sales, downloads, and customer behavior"
    },
    {
      icon: Globe,
      title: "Multi-Currency Support",
      description: "Sell in 150+ currencies worldwide"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: { monthly: 9, yearly: 90 },
      trialPrice: 1,
      description: "Perfect for individuals getting started",
      features: [
        "25 protected files",
        "Basic watermarking",
        "Payment links",
        "Basic analytics",
        "Email support",
        "5% transaction fee"
      ],
      cta: "Start $1 Trial"
    },
    {
      name: "Professional",
      price: { monthly: 29, yearly: 290 },
      description: "For serious creators and small businesses",
      features: [
        "250 protected files",
        "Advanced watermarking",
        "Custom payment pages",
        "Advanced analytics",
        "Multi-currency support",
        "Priority support",
        "3% transaction fee"
      ],
      highlight: "Most Popular",
      cta: "Get Professional"
    },
    {
      name: "Enterprise",
      price: { monthly: 99, yearly: 990 },
      description: "For teams and large organizations",
      features: [
        "Unlimited files",
        "White-label features",
        "API access",
        "Team collaboration",
        "Custom integrations",
        "24/7 dedicated support",
        "1% transaction fee"
      ],
      cta: "Get Enterprise"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Lock className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PayLockr</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                Pricing
              </Button>
              <Button variant="ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Features
              </Button>
              <Button variant="ghost">
                <a href="mailto:support@paylockr.com">Support</a>
              </Button>
              <Button onClick={() => openPaymentModal('professional')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Protect. Monetize. Deliver Your
            <span className="text-blue-600"> Digital Files</span> with Confidence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The most secure platform to sell your digital content. Add watermarks, 
            control access, accept payments, and track everything with detailed analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => openPaymentModal('professional')}
            >
              Start with Professional
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => openPaymentModal('starter')}
            >
              Try $1 Starter Plan
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            💳 No setup fees • 🔒 30-day money back guarantee • 🌍 Accept payments globally
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Sell Digital Files
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features to protect, monetize, and deliver your digital content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. All plans include secure payments and file protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.highlight ? 'ring-2 ring-blue-500 shadow-xl scale-105' : ''}`}>
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    {plan.highlight}
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {plan.name === 'Starter' ? (
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          ${plan.trialPrice}
                        </div>
                        <div className="text-sm text-gray-500">
                          7-day trial, then ${plan.price.monthly}/month
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          ${plan.price.monthly}
                        </div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => openPaymentModal(plan.name.toLowerCase() as 'starter' | 'professional' | 'enterprise')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              🔒 All plans include SSL encryption, secure file delivery, and fraud protection
            </p>
            <p className="text-sm text-gray-500">
              Transaction fees apply based on your plan. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Lock className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">PayLockr</span>
              </div>
              <p className="text-gray-400">
                The most secure platform to monetize your digital content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:support@paylockr.com" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="mailto:support@paylockr.com" className="hover:text-white transition-colors">Contact</a></li>
                <li>Status</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li>About</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PayLockr. All rights reserved. | <a href="mailto:support@paylockr.com" className="hover:text-white">support@paylockr.com</a></p>
          </div>
        </div>
      </footer>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
        planType={paymentModal.planType}
        planPrice={paymentModal.planPrice}
        isStarter={paymentModal.isStarter}
      />
    </div>
  );
};

export default Index;
