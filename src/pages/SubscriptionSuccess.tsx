
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verificationState, setVerificationState] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const txRef = searchParams.get('tx_ref');
  const status = searchParams.get('status');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (!txRef || status !== 'successful' || !transactionId) {
      setVerificationState('error');
      setError('Invalid payment parameters. Please contact support if you completed a payment.');
      return;
    }

    verifySubscription();
  }, [txRef, status, transactionId]);

  const verifySubscription = async () => {
    try {
      setVerificationState('verifying');
      setError('');
      
      console.log('Verifying subscription...', { txRef, transactionId });

      // Call the verification edge function with URL parameters
      const { data, error } = await supabase.functions.invoke('verify-subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Verification error:', error);
        throw new Error(error.message || 'Failed to verify subscription');
      }

      if (data?.success) {
        console.log('Verification successful:', data);
        setSubscriptionData(data);
        setVerificationState('success');
        
        // Try to sign in the user if we have pending data
        const pendingUserData = localStorage.getItem('pending_user_data');
        if (pendingUserData) {
          try {
            const userData = JSON.parse(pendingUserData);
            console.log('Attempting auto sign-in...');
            
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.password
            });

            if (!signInError) {
              localStorage.removeItem('pending_user_data');
              toast({
                title: "Welcome to PayLockr!",
                description: "Your subscription has been activated and you're now signed in.",
              });
            } else {
              console.warn('Auto sign-in failed:', signInError);
              toast({
                title: "Subscription Activated",
                description: "Please sign in manually to access your account.",
              });
            }
          } catch (err) {
            console.error('Auto sign-in error:', err);
          }
        }
      } else {
        throw new Error(data?.error || 'Subscription verification failed');
      }
    } catch (err: any) {
      console.error('Verification request failed:', err);
      const errorMessage = err.message || 'Failed to verify subscription. Please try again.';
      setError(errorMessage);
      setVerificationState('error');
      
      // Show user-friendly error message
      if (retryCount < 3) {
        toast({
          title: "Verification Issue",
          description: "We're having trouble verifying your payment. Retrying automatically...",
          variant: "destructive"
        });
      }
    }
  };

  const handleContinue = () => {
    window.location.href = '/dashboard';
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError('');
    verifySubscription();
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Subscription Verification Issue');
    const body = encodeURIComponent(`Transaction Reference: ${txRef}\nTransaction ID: ${transactionId}\nError: ${error}`);
    window.location.href = `mailto:support@paylockr.com?subject=${subject}&body=${body}`;
  };

  if (!txRef) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {verificationState === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <CardTitle>Verifying Your Subscription</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment and set up your account...
                {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
              </CardDescription>
            </>
          )}

          {verificationState === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-600">Subscription Activated!</CardTitle>
              <CardDescription>
                {subscriptionData?.is_trial 
                  ? `Your ${subscriptionData.plan_type} plan trial has started! You have 7 days to explore all features.`
                  : `Your ${subscriptionData.plan_type} plan is now active. Welcome to PayLockr!`
                }
              </CardDescription>
            </>
          )}

          {verificationState === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-red-600">Verification Issue</CardTitle>
              <CardDescription>
                We're having trouble verifying your subscription. Don't worry - your payment was processed.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {verificationState === 'success' && subscriptionData && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Subscription Details:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Plan:</strong> {subscriptionData.plan_type?.charAt(0).toUpperCase() + subscriptionData.plan_type?.slice(1)}</p>
                  <p><strong>Status:</strong> {subscriptionData.is_trial ? 'Trial Active' : 'Active'}</p>
                  <p><strong>Transaction ID:</strong> {txRef}</p>
                </div>
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to Dashboard
              </Button>
            </div>
          )}

          {verificationState === 'error' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full" variant="outline" disabled={retryCount >= 5}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {retryCount >= 5 ? 'Max Retries Reached' : 'Retry Verification'}
                </Button>
                
                <Button onClick={handleContactSupport} className="w-full">
                  Contact Support
                </Button>
                
                <Button onClick={() => window.location.href = '/'} variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>Transaction Reference: {txRef}</p>
                {transactionId && <p>Transaction ID: {transactionId}</p>}
              </div>
            </div>
          )}

          {verificationState === 'verifying' && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                This may take a few moments. Please don't close this page.
              </p>
              
              {retryCount > 2 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Taking longer than expected?</p>
                  <Button variant="outline" size="sm" onClick={handleContactSupport}>
                    Contact Support
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
