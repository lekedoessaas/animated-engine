
import { supabase } from '@/integrations/supabase/client';

export const TestDataGenerator = {
  // Generate test files with various configurations
  async generateTestFiles(userId: string, count: number = 10) {
    const testFiles = [];
    
    for (let i = 0; i < count; i++) {
      const file = {
        user_id: userId,
        title: `Test File ${i + 1}`,
        description: `This is a test file for scenario ${i + 1}`,
        price: Math.random() * 100 + 5, // Random price between $5-$105
        file_type: ['pdf', 'docx', 'jpg', 'png', 'mp4'][Math.floor(Math.random() * 5)],
        file_size: Math.floor(Math.random() * 10000000) + 1000000, // 1MB to 10MB
        file_path: `test-files/test-file-${i + 1}.${['pdf', 'docx', 'jpg', 'png', 'mp4'][Math.floor(Math.random() * 5)]}`,
        watermark_enabled: Math.random() > 0.5,
        download_limit: Math.floor(Math.random() * 10) + 1,
        access_duration: [7, 14, 30, 60][Math.floor(Math.random() * 4)],
        device_restrictions: Math.random() > 0.7,
        password_protection: Math.random() > 0.8 ? 'test123' : null,
      };
      testFiles.push(file);
    }

    const { data, error } = await supabase
      .from('files')
      .insert(testFiles)
      .select();

    if (error) {
      console.error('Error generating test files:', error);
      return [];
    }

    console.log(`Generated ${testFiles.length} test files`);
    return data;
  },

  // Generate test payment links
  async generateTestPaymentLinks(fileIds: string[], userId: string) {
    const paymentLinks = fileIds.map((fileId, index) => ({
      file_id: fileId,
      user_id: userId,
      link_code: `test-link-${Date.now()}-${index}`,
      custom_price: Math.random() > 0.5 ? Math.random() * 50 + 10 : null,
      max_downloads: Math.floor(Math.random() * 20) + 1,
      expires_at: Math.random() > 0.5 ? new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000).toISOString() : null,
      custom_message: Math.random() > 0.5 ? `Custom message for test link ${index + 1}` : null,
    }));

    const { data, error } = await supabase
      .from('payment_links')
      .insert(paymentLinks)
      .select();

    if (error) {
      console.error('Error generating test payment links:', error);
      return [];
    }

    console.log(`Generated ${paymentLinks.length} test payment links`);
    return data;
  },

  // Generate test transactions
  async generateTestTransactions(fileIds: string[], userId: string, count: number = 50) {
    const transactions = [];
    const customers = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Bob Johnson', email: 'bob@example.com' },
      { name: 'Alice Brown', email: 'alice@example.com' },
      { name: 'Charlie Wilson', email: 'charlie@example.com' },
    ];

    for (let i = 0; i < count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const fileId = fileIds[Math.floor(Math.random() * fileIds.length)];
      const amount = Math.random() * 100 + 5;
      const feeRate = [0.01, 0.03, 0.05][Math.floor(Math.random() * 3)];
      const feeAmount = amount * feeRate;
      
      const transaction = {
        user_id: userId,
        file_id: fileId,
        payment_link_id: fileId, // Simplified for testing
        customer_name: customer.name,
        customer_email: customer.email,
        amount: amount,
        currency: ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
        fee_amount: feeAmount,
        net_amount: amount - feeAmount,
        status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
        flutterwave_tx_ref: `test-tx-${Date.now()}-${i}`,
        payment_method: ['card', 'bank_transfer', 'mobile_money'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      transactions.push(transaction);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (error) {
      console.error('Error generating test transactions:', error);
      return [];
    }

    console.log(`Generated ${transactions.length} test transactions`);
    return data;
  },

  // Generate test analytics events
  async generateTestAnalytics(fileIds: string[], userId: string, count: number = 100) {
    const events = [];
    const eventTypes = ['file_viewed', 'file_downloaded', 'payment_completed', 'link_shared'];

    for (let i = 0; i < count; i++) {
      const event = {
        user_id: userId,
        file_id: fileIds[Math.floor(Math.random() * fileIds.length)],
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        metadata: {
          user_agent: 'Test Browser',
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
          referrer: 'https://example.com',
          session_id: `test-session-${Math.floor(Math.random() * 1000)}`,
        },
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      events.push(event);
    }

    const { data, error } = await supabase
      .from('analytics_events')
      .insert(events)
      .select();

    if (error) {
      console.error('Error generating test analytics:', error);
      return [];
    }

    console.log(`Generated ${events.length} test analytics events`);
    return data;
  },

  // Generate complete test scenario
  async generateCompleteTestScenario(userId: string) {
    console.log('🚀 Generating comprehensive test scenario...');
    
    try {
      // 1. Generate test files
      const files = await this.generateTestFiles(userId, 15);
      if (!files || files.length === 0) return null;

      const fileIds = files.map(f => f.id);

      // 2. Generate payment links
      await this.generateTestPaymentLinks(fileIds, userId);

      // 3. Generate transactions
      await this.generateTestTransactions(fileIds, userId, 75);

      // 4. Generate analytics
      await this.generateTestAnalytics(fileIds, userId, 200);

      // 5. Generate notifications
      await this.generateTestNotifications(userId, 20);

      console.log('✅ Complete test scenario generated successfully!');
      return {
        filesCount: files.length,
        message: 'Test scenario generated with files, payment links, transactions, and analytics'
      };
    } catch (error) {
      console.error('❌ Error generating test scenario:', error);
      throw error;
    }
  },

  // Generate test notifications
  async generateTestNotifications(userId: string, count: number = 20) {
    const notifications = [];
    const types = ['payment', 'download', 'system', 'security'];
    const titles = {
      payment: ['Payment Received!', 'New Sale!', 'Payment Pending'],
      download: ['File Downloaded', 'New Download', 'Popular File'],
      system: ['Account Update', 'New Feature', 'Maintenance Notice'],
      security: ['Login Alert', 'Password Changed', 'Security Update']
    };

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const titleOptions = titles[type];
      
      const notification = {
        user_id: userId,
        type: type,
        title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
        message: `Test notification message ${i + 1}`,
        read: Math.random() > 0.3,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          test: true,
          priority: Math.random() > 0.8 ? 'high' : 'normal'
        }
      };
      notifications.push(notification);
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error generating test notifications:', error);
      return [];
    }

    console.log(`Generated ${notifications.length} test notifications`);
    return data;
  },

  // Clean up test data
  async cleanupTestData(userId: string) {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Delete in reverse order to respect foreign key constraints
      await supabase.from('analytics_events').delete().eq('user_id', userId);
      await supabase.from('transactions').delete().eq('user_id', userId);
      await supabase.from('payment_links').delete().eq('user_id', userId);
      await supabase.from('files').delete().eq('user_id', userId);
      await supabase.from('notifications').delete().eq('user_id', userId);
      
      console.log('✅ Test data cleaned up successfully!');
    } catch (error) {
      console.error('❌ Error cleaning up test data:', error);
      throw error;
    }
  }
};
