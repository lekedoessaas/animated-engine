
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - PayLockr</title>
        <meta name="description" content="PayLockr's privacy policy outlines how we collect, use, and protect your personal information when using our secure file monetization platform." />
        <meta name="keywords" content="privacy policy, data protection, PayLockr, file sharing, security" />
        <meta property="og:title" content="Privacy Policy - PayLockr" />
        <meta property="og:description" content="Learn about PayLockr's commitment to protecting your privacy and personal data." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/privacy-policy" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "PayLockr's privacy policy",
            "url": "/privacy-policy",
            "publisher": {
              "@type": "Organization",
              "name": "PayLockr"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Privacy Policy
                </CardTitle>
                <p className="text-muted-foreground mt-4">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                  <p className="mb-4">
                    We collect information you provide directly to us, such as when you create an account, 
                    upload files, or contact us for support.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (name, email, payment details)</li>
                    <li>File metadata and transaction history</li>
                    <li>Usage analytics and performance data</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                  <p className="mb-4">
                    We use the information we collect to provide, maintain, and improve our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                  <p className="mb-4">
                    We implement appropriate security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p>
                    If you have questions about this Privacy Policy, please contact us at privacy@paylockr.com
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
