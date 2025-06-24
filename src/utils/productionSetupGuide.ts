
export const ProductionSetupGuide = {
  flutterwaveProduction: {
    title: "Production Flutterwave Setup",
    steps: [
      {
        step: 1,
        title: "Switch to Live Mode",
        description: "Log into your Flutterwave dashboard and toggle to 'Live' mode",
        action: "Visit https://dashboard.flutterwave.com and click the 'Live' toggle in the top navigation"
      },
      {
        step: 2,
        title: "Get Live API Keys",
        description: "Generate your live secret and public keys",
        action: "Go to Settings > API Keys > Live Keys and copy your Secret Key and Public Key"
      },
      {
        step: 3,
        title: "Update Supabase Secrets",
        description: "Replace test keys with live keys in your Supabase project",
        secrets: [
          "FLUTTERWAVE_SECRET_KEY",
          "FLUTTERWAVE_PUBLIC_KEY"
        ]
      },
      {
        step: 4,
        title: "Configure Webhook",
        description: "Set up webhook endpoint for payment notifications",
        webhookUrl: "https://mwmsrrammjgumscexuxh.supabase.co/functions/v1/flutterwave-webhook",
        events: ["charge.completed", "transfer.completed"]
      },
      {
        step: 5,
        title: "Test with Small Amounts",
        description: "Conduct real payment tests with small amounts ($0.50 - $1.00)",
        action: "Create test payment links and complete real transactions"
      }
    ]
  },

  supportEmailSetup: {
    title: "Support Email Configuration",
    steps: [
      {
        step: 1,
        title: "Domain Setup",
        description: "Ensure you own the paylockr.com domain or use a subdomain you control",
        alternatives: ["Use your existing domain", "Set up forwarding from your current email"]
      },
      {
        step: 2,
        title: "Email Service Configuration",
        description: "Set up support@paylockr.com with your email provider",
        providers: [
          "Google Workspace (recommended for business)",
          "Microsoft 365",
          "Email forwarding to personal email"
        ]
      },
      {
        step: 3,
        title: "Auto-Responder Setup",
        description: "Configure automatic responses for customer inquiries",
        template: `Thank you for contacting PayLockr support. We've received your message and will respond within 24 hours. For urgent payment issues, please include your transaction reference number.`
      }
    ]
  },

  analyticsSetup: {
    title: "Analytics Configuration",
    steps: [
      {
        step: 1,
        title: "Google Analytics 4",
        description: "Create a GA4 property for PayLockr",
        action: "Visit https://analytics.google.com and create a new property"
      },
      {
        step: 2,
        title: "Facebook Pixel",
        description: "Set up Facebook Pixel for ad tracking",
        action: "Visit https://business.facebook.com/events_manager and create a pixel"
      },
      {
        step: 3,
        title: "Update Tracking IDs",
        description: "Replace placeholder IDs in the Analytics component",
        files: ["src/components/Analytics.tsx"]
      }
    ]
  },

  paymentTesting: {
    title: "Real Payment Flow Testing",
    criticalTests: [
      {
        test: "Small Amount Payment",
        description: "Test $0.50 payment with real card",
        expectedOutcome: "Payment completes, file downloads, webhook processes"
      },
      {
        test: "Failed Payment Handling",
        description: "Test with insufficient funds or declined card",
        expectedOutcome: "User sees error message, no file access granted"
      },
      {
        test: "Multi-Currency Payment",
        description: "Test payment in EUR, GBP, or other supported currencies",
        expectedOutcome: "Currency conversion works, payment completes"
      },
      {
        test: "Mobile Payment Flow",
        description: "Complete payment process on mobile device",
        expectedOutcome: "Responsive design works, payment succeeds"
      },
      {
        test: "Email Notifications",
        description: "Verify customer and owner receive appropriate emails",
        expectedOutcome: "Purchase confirmation and payment notification sent"
      }
    ]
  },

  launchChecklist: {
    title: "Pre-Launch Critical Checklist",
    items: [
      { item: "Live Flutterwave keys configured", critical: true },
      { item: "Webhook endpoint responding correctly", critical: true },
      { item: "Payment flows tested with real money", critical: true },
      { item: "Support email active and monitored", critical: true },
      { item: "Analytics tracking implemented", critical: false },
      { item: "Terms of Service and Privacy Policy live", critical: true },
      { item: "SSL certificate valid", critical: true },
      { item: "Domain properly configured", critical: true },
      { item: "Error handling and logging in place", critical: true },
      { item: "Backup and recovery procedures documented", critical: false }
    ]
  }
};

export const getSetupProgress = () => {
  // This would check actual configuration status
  return {
    flutterwave: {
      completed: false,
      issues: ["Live API keys not configured", "Webhook URL needs setup"]
    },
    analytics: {
      completed: false,
      issues: ["GA4 tracking ID needed", "Facebook Pixel ID needed"]
    },
    support: {
      completed: true,
      issues: []
    },
    testing: {
      completed: false,
      issues: ["No real payment tests conducted"]
    }
  };
};
