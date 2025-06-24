
export const TestingHelpers = {
  // Test complete subscription flow
  async testSubscriptionFlow() {
    console.log('🧪 Testing Subscription Flow...');
    
    const testResults = {
      landingPageAccess: false,
      authenticationFlow: false,
      subscriptionCreation: false,
      dashboardAccess: false,
      profileCreation: false
    };

    try {
      // Test 1: Landing page accessibility
      testResults.landingPageAccess = window.location.pathname === '/';
      console.log('✅ Landing page accessible:', testResults.landingPageAccess);

      // Test 2: Check if auth components are loaded (properly check for element existence)
      const authElements = document.querySelector('[data-testid="auth-form"]');
      const formElements = document.querySelector('form');
      testResults.authenticationFlow = !!(authElements || formElements);
      console.log('✅ Authentication components loaded:', testResults.authenticationFlow);

      return testResults;
    } catch (error) {
      console.error('❌ Subscription flow test failed:', error);
      return testResults;
    }
  },

  // Test file upload functionality
  async testFileUpload() {
    console.log('🧪 Testing File Upload...');
    
    const testResults = {
      dropzoneReady: false,
      validationWorking: false,
      storageConnected: false
    };

    try {
      // Check if file upload components are rendered
      const fileUploadElement = document.querySelector('[data-testid="file-upload"]') || 
                               document.querySelector('input[type="file"]');
      testResults.dropzoneReady = !!fileUploadElement;
      
      console.log('✅ File upload components ready:', testResults.dropzoneReady);
      return testResults;
    } catch (error) {
      console.error('❌ File upload test failed:', error);
      return testResults;
    }
  },

  // Test payment link generation
  async testPaymentLinks() {
    console.log('🧪 Testing Payment Link Generation...');
    
    const testResults = {
      linkGenerationReady: false,
      currencyConversionWorking: false,
      previewComponentReady: false
    };

    try {
      // Check if payment preview components exist
      const paymentPreview = document.querySelector('[data-testid="payment-preview"]');
      testResults.previewComponentReady = !!paymentPreview;
      
      console.log('✅ Payment preview ready:', testResults.previewComponentReady);
      return testResults;
    } catch (error) {
      console.error('❌ Payment link test failed:', error);
      return testResults;
    }
  },

  // Test currency conversion
  async testCurrencyConversion() {
    console.log('🧪 Testing Currency Conversion...');
    
    try {
      // Test currency service directly
      const { CurrencyService } = await import('@/services/currencyService');
      
      // Test basic conversion
      const rate = await CurrencyService.getExchangeRate('USD', 'EUR');
      const converted = await CurrencyService.convertAmount(100, 'USD', 'EUR');
      
      console.log('✅ Exchange rate USD->EUR:', rate);
      console.log('✅ Converted amount (100 USD):', converted);
      
      return { rate, converted, success: true };
    } catch (error) {
      console.error('❌ Currency conversion test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Testing Suite...\n');
    
    const results = {
      subscriptionFlow: await this.testSubscriptionFlow(),
      fileUpload: await this.testFileUpload(),
      paymentLinks: await this.testPaymentLinks(),
      currencyConversion: await this.testCurrencyConversion(),
      timestamp: new Date().toISOString()
    };

    console.log('\n📊 Test Results Summary:', results);
    return results;
  }
};

// Make testing helpers available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).PayLockrTesting = TestingHelpers;
}
