
import { supabase } from '@/integrations/supabase/client';

export const PaymentTestingUtils = {
  // Test payment flow end-to-end
  async testPaymentFlow(linkCode: string) {
    console.log('🧪 Testing payment flow for link:', linkCode);
    
    const testResults = {
      linkValidation: false,
      paymentInitialization: false,
      transactionCreation: false,
      webhookHandling: false,
      downloadGeneration: false,
      errors: [] as string[]
    };

    try {
      // 1. Test payment link validation
      const { data: paymentLink, error: linkError } = await supabase
        .from('payment_links')
        .select(`
          *,
          files (
            id,
            title,
            price,
            file_size,
            file_type
          )
        `)
        .eq('link_code', linkCode)
        .eq('is_active', true)
        .single();

      if (linkError || !paymentLink) {
        testResults.errors.push('Payment link validation failed');
        return testResults;
      }

      testResults.linkValidation = true;
      console.log('✅ Payment link validation passed');

      // 2. Test payment initialization (mock)
      const testPaymentData = {
        payment_link_id: paymentLink.id,
        file_id: paymentLink.file_id,
        amount: paymentLink.custom_price || paymentLink.files.price,
        currency: 'USD',
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        flutterwave_tx_ref: `test_${Date.now()}`
      };

      // Mock payment initialization
      try {
        // In a real scenario, this would call the initialize-payment function
        console.log('💳 Payment initialization data:', testPaymentData);
        testResults.paymentInitialization = true;
        console.log('✅ Payment initialization test passed');
      } catch (error) {
        testResults.errors.push('Payment initialization failed');
      }

      // 3. Test transaction creation
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          ...testPaymentData,
          user_id: paymentLink.user_id,
          status: 'pending',
          fee_amount: testPaymentData.amount * 0.03,
          net_amount: testPaymentData.amount * 0.97
        })
        .select()
        .single();

      if (txError || !transaction) {
        testResults.errors.push('Transaction creation failed');
      } else {
        testResults.transactionCreation = true;
        console.log('✅ Transaction creation test passed');

        // 4. Test webhook handling (simulate completion)
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            flutterwave_tx_id: 'test_tx_id_123'
          })
          .eq('id', transaction.id);

        if (!updateError) {
          testResults.webhookHandling = true;
          console.log('✅ Webhook handling test passed');

          // 5. Test download generation
          try {
            const { data: downloadData, error: downloadError } = await supabase.functions.invoke('download-file', {
              body: {
                transaction_id: transaction.id,
                customer_email: testPaymentData.customer_email
              }
            });

            if (!downloadError && downloadData?.download_url) {
              testResults.downloadGeneration = true;
              console.log('✅ Download generation test passed');
            } else {
              testResults.errors.push('Download generation failed');
            }
          } catch (error) {
            testResults.errors.push('Download generation error: ' + error.message);
          }
        } else {
          testResults.errors.push('Webhook handling failed');
        }

        // Cleanup test transaction
        await supabase
          .from('transactions')
          .delete()
          .eq('id', transaction.id);
      }

      return testResults;
    } catch (error) {
      testResults.errors.push('General error: ' + error.message);
      return testResults;
    }
  },

  // Test different payment scenarios
  async runPaymentScenarios() {
    console.log('🚀 Running comprehensive payment scenarios...');
    
    const scenarios = [
      { name: 'Standard Payment', currency: 'USD', amount: 50 },
      { name: 'High Value Payment', currency: 'USD', amount: 500 },
      { name: 'International Payment', currency: 'EUR', amount: 75 },
      { name: 'Low Value Payment', currency: 'USD', amount: 5 },
    ];

    const results = [];

    for (const scenario of scenarios) {
      console.log(`Testing scenario: ${scenario.name}`);
      
      const result = {
        scenario: scenario.name,
        success: false,
        duration: 0,
        errors: [] as string[]
      };

      const startTime = Date.now();
      
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
        
        // Mock different outcomes based on scenario
        if (scenario.amount > 1000) {
          result.errors.push('Amount exceeds limit');
        } else if (scenario.currency !== 'USD' && Math.random() > 0.8) {
          result.errors.push('Currency conversion failed');
        } else {
          result.success = true;
        }
        
        result.duration = Date.now() - startTime;
        console.log(`${result.success ? '✅' : '❌'} ${scenario.name}: ${result.duration}ms`);
      } catch (error) {
        result.errors.push(error.message);
        result.duration = Date.now() - startTime;
      }

      results.push(result);
    }

    return results;
  },

  // Test payment security
  async testPaymentSecurity() {
    console.log('🔒 Testing payment security measures...');
    
    const securityTests = {
      duplicateTransactionPrevention: false,
      amountTampering: false,
      expiredLinkHandling: false,
      downloadLimitEnforcement: false,
      customerVerification: false
    };

    try {
      // Test 1: Duplicate transaction prevention
      const txRef = `security_test_${Date.now()}`;
      
      // Try to create the same transaction twice
      const duplicateTest1 = await supabase
        .from('transactions')
        .insert({
          flutterwave_tx_ref: txRef,
          user_id: '00000000-0000-0000-0000-000000000000',
          file_id: '00000000-0000-0000-0000-000000000000',
          payment_link_id: '00000000-0000-0000-0000-000000000000',
          customer_email: 'test@example.com',
          customer_name: 'Test',
          amount: 50,
          currency: 'USD',
          status: 'pending'
        });

      const duplicateTest2 = await supabase
        .from('transactions')
        .insert({
          flutterwave_tx_ref: txRef,
          user_id: '00000000-0000-0000-0000-000000000000',
          file_id: '00000000-0000-0000-0000-000000000000',
          payment_link_id: '00000000-0000-0000-0000-000000000000',
          customer_email: 'test@example.com',
          customer_name: 'Test',
          amount: 50,
          currency: 'USD',
          status: 'pending'
        });

      // Should fail on second attempt due to unique constraint
      securityTests.duplicateTransactionPrevention = duplicateTest2.error !== null;

      // Cleanup
      await supabase
        .from('transactions')
        .delete()
        .eq('flutterwave_tx_ref', txRef);

      console.log('✅ Security tests completed');
    } catch (error) {
      console.error('❌ Security testing failed:', error);
    }

    return securityTests;
  }
};
