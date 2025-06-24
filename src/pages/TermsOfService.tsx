
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - PayLockr</title>
        <meta name="description" content="PayLockr's terms of service governing the use of our secure file monetization platform and services." />
        <meta name="keywords" content="terms of service, user agreement, PayLockr, file sharing, legal" />
        <meta property="og:title" content="Terms of Service - PayLockr" />
        <meta property="og:description" content="Read PayLockr's terms of service and user agreement." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/terms-of-service" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "PayLockr's terms of service",
            "url": "/terms-of-service",
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
                  Terms of Service
                </CardTitle>
                <p className="text-muted-foreground mt-4">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
                  <p className="mb-4">
                    By accessing and using PayLockr, you accept and agree to be bound by the terms 
                    and provision of this agreement.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Use License</h2>
                  <p className="mb-4">
                    Permission is granted to temporarily use PayLockr for personal, 
                    non-commercial transitory viewing only.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for commercial purposes</li>
                    <li>Attempt to reverse engineer any software</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
                  <p className="mb-4">
                    Users are responsible for maintaining the confidentiality of their account 
                    and password and for restricting access to their computer.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                  <p>
                    For questions about these Terms of Service, please contact us at legal@paylockr.com
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

export default TermsOfService;
