
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Download, AlertCircle, Loader2, RefreshCw, Clock, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TransactionData {
  id: string;
  status: string;
  amount: number;
  currency: string;
  customer_email: string;
  customer_name: string;
  files: {
    title: string;
    file_path: string;
  };
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  
  const txRef = searchParams.get('tx_ref');

  useEffect(() => {
    if (txRef) {
      verifyPayment();
    } else {
      setLoading(false);
      setError('Missing transaction reference');
    }
  }, [txRef]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Verifying payment:', txRef);

      // Call edge function to verify payment
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { tx_ref: txRef }
      });

      if (error) {
        console.error('Payment verification error:', error);
        throw new Error(error.message || 'Failed to verify payment');
      }

      if (data?.transaction) {
        setTransaction(data.transaction);
        console.log('Payment verified successfully:', data.transaction);
        
        toast({
          title: "Payment Verified!",
          description: "Your payment has been confirmed. You can now download your file.",
        });
      } else {
        throw new Error('Transaction data not found');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      const errorMessage = error.message || 'Unable to verify payment';
      setError(errorMessage);
      
      if (retryCount < 3) {
        toast({
          title: "Verification Issue",
          description: "Retrying payment verification...",
          variant: "destructive"
        });
        
        // Auto-retry after 3 seconds
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          verifyPayment();
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!transaction) return;

    setDownloading(true);
    try {
      console.log('Generating secure download link for transaction:', transaction.id);

      // Call edge function to get secure download URL
      const { data, error } = await supabase.functions.invoke('download-file', {
        body: { 
          transaction_id: transaction.id,
          customer_email: transaction.customer_email
        }
      });

      if (error) {
        console.error('Download error:', error);
        throw new Error(error.message || 'Failed to generate download link');
      }

      if (data?.download_url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = data.file_name || transaction.files.title;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadCompleted(true);

        toast({
          title: "Download Started",
          description: `Your file "${transaction.files.title}" download has started successfully.`
        });
      } else {
        throw new Error('Download URL not received');
      }

    } catch (error: any) {
      console.error('Download error:', error);
      const errorMessage = error.message || 'Unable to download file';
      toast({
        title: "Download Error",
        description: `${errorMessage}. Please contact support if this persists.`,
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    verifyPayment();
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Payment Verification Issue');
    const body = encodeURIComponent(
      `Transaction Reference: ${txRef}\n` +
      `Error: ${error}\n` +
      `Customer Email: ${transaction?.customer_email || 'N/A'}\n` +
      `Please help me access my purchased file.`
    );
    window.location.href = `mailto:support@paylockr.com?subject=${subject}&body=${body}`;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium mb-2">Verifying Payment</h3>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
              {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Payment Verification Issue</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-left">
                Don't worry - if you completed a payment, it was processed successfully. 
                We're just having trouble verifying it right now.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full" disabled={retryCount >= 5}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {retryCount >= 5 ? 'Max Retries Reached' : 'Retry Verification'}
              </Button>
              <Button onClick={handleContactSupport} variant="outline" className="w-full">
                Contact Support
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                Go Home
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center mt-4">
              <p>Transaction Reference: {txRef}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Payment Not Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find your payment. Please check your email or contact support.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (transaction.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Payment Processing</h3>
            <p className="text-muted-foreground mb-4">
              Your payment is still being processed. Please check back in a few minutes.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
              <Button onClick={handleContactSupport} variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your file is ready for download.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Purchase Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File:</span>
                  <p className="font-medium">{transaction.files.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{transaction.customer_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{transaction.customer_email}</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              {!downloadCompleted ? (
                <Button 
                  onClick={handleDownload}
                  disabled={downloading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Secure Download...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Your File
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    <span className="font-medium">Download Completed!</span>
                  </div>
                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Again
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                A receipt has been sent to your email address. 
                Your download link is secure and expires in 1 hour.
              </p>
              <p>
                If you have any issues, please contact our support team with your transaction reference: 
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded ml-1">{txRef}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
