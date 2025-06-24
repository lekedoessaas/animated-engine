
import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TestingControlPanel } from '@/components/TestingControlPanel';
import { MonitoringDashboard } from '@/components/MonitoringDashboard';
import { ProductionMonitoring } from '@/components/ProductionMonitoring';
import { TestingPanel } from '@/components/TestingPanel';
import { LaunchReadinessChecker } from '@/components/LaunchReadinessChecker';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Monitor, Bug, Zap, Rocket, Settings, AlertTriangle } from 'lucide-react';
import { ProductionSetupGuide } from '@/utils/productionSetupGuide';

const TestingPage = () => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <TestTube className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Testing Features</h3>
              <p className="text-muted-foreground">
                Testing features are only available in development mode
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Testing & Quality Assurance</h1>
                <p className="text-gray-600 mt-2">Comprehensive testing tools and production setup</p>
              </div>
              <Badge variant="outline" className="flex items-center">
                <Zap className="mr-1 h-3 w-3" />
                Development Mode
              </Badge>
            </div>
          </div>

          {/* Production Setup Alert */}
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Ready for Production?</strong> Complete the setup guide in the "Production Setup" tab before launching.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="launch" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="launch" className="flex items-center">
                <Rocket className="mr-2 h-4 w-4" />
                Launch Ready
              </TabsTrigger>
              <TabsTrigger value="production" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Production Setup
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center">
                <Monitor className="mr-2 h-4 w-4" />
                Live Monitoring
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center">
                <TestTube className="mr-2 h-4 w-4" />
                Testing Suite
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex items-center">
                <Bug className="mr-2 h-4 w-4" />
                Debug Panel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="launch">
              <LaunchReadinessChecker />
            </TabsContent>

            <TabsContent value="production">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Production Setup Guide</CardTitle>
                    <CardDescription>
                      Complete these steps to prepare PayLockr for production launch
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Flutterwave Setup */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                          {ProductionSetupGuide.flutterwaveProduction.title}
                        </h3>
                        <div className="space-y-3 ml-8">
                          {ProductionSetupGuide.flutterwaveProduction.steps.map((step, index) => (
                            <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                              <h4 className="font-medium">{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              {step.action && <p className="text-sm bg-blue-50 p-2 rounded mt-2">{step.action}</p>}
                              {step.secrets && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">Update these Supabase secrets:</p>
                                  <ul className="text-sm text-muted-foreground">
                                    {step.secrets.map(secret => <li key={secret}>• {secret}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Analytics Setup */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                          {ProductionSetupGuide.analyticsSetup.title}
                        </h3>
                        <div className="space-y-3 ml-8">
                          {ProductionSetupGuide.analyticsSetup.steps.map((step, index) => (
                            <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                              <h4 className="font-medium">{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              {step.action && <p className="text-sm bg-green-50 p-2 rounded mt-2">{step.action}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Support Email Setup */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-yellow-100 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                          {ProductionSetupGuide.supportEmailSetup.title}
                        </h3>
                        <div className="space-y-3 ml-8">
                          {ProductionSetupGuide.supportEmailSetup.steps.map((step, index) => (
                            <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                              <h4 className="font-medium">{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              {step.template && (
                                <div className="mt-2 p-3 bg-yellow-50 rounded text-sm">
                                  <strong>Suggested auto-response:</strong><br />
                                  {step.template}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Critical Testing */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">4</span>
                          {ProductionSetupGuide.paymentTesting.title}
                        </h3>
                        <div className="space-y-3 ml-8">
                          {ProductionSetupGuide.paymentTesting.criticalTests.map((test, index) => (
                            <div key={index} className="border border-red-200 rounded p-3">
                              <h4 className="font-medium text-red-800">{test.test}</h4>
                              <p className="text-sm text-muted-foreground">{test.description}</p>
                              <p className="text-sm bg-red-50 p-2 rounded mt-2">
                                <strong>Expected:</strong> {test.expectedOutcome}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monitoring">
              <ProductionMonitoring />
            </TabsContent>

            <TabsContent value="testing">
              <TestingControlPanel />
            </TabsContent>

            <TabsContent value="debug">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Debug Information</CardTitle>
                    <CardDescription>
                      Real-time debugging tools and system information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TestingPanel />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Environment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Node Environment:</span>
                        <p className="text-muted-foreground">{process.env.NODE_ENV}</p>
                      </div>
                      <div>
                        <span className="font-medium">Build Time:</span>
                        <p className="text-muted-foreground">{new Date().toISOString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">User Agent:</span>
                        <p className="text-muted-foreground">{navigator.userAgent.substring(0, 50)}...</p>
                      </div>
                      <div>
                        <span className="font-medium">Screen Size:</span>
                        <p className="text-muted-foreground">{window.screen.width}x{window.screen.height}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default TestingPage;
