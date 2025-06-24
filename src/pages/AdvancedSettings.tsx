
import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TeamCollaboration } from '@/components/TeamCollaboration';
import { APIAccessManagement } from '@/components/APIAccessManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Key, Settings, Zap } from 'lucide-react';

const AdvancedSettings = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Settings</h1>
              <p className="text-gray-600 mt-2">Configure team collaboration, API access, and enterprise features</p>
            </div>
            <Badge variant="outline" className="flex items-center">
              <Zap className="mr-1 h-3 w-3" />
              Enterprise Features
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="team" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Team Collaboration
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center">
              <Key className="mr-2 h-4 w-4" />
              API Access
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <TeamCollaboration />
          </TabsContent>

          <TabsContent value="api">
            <APIAccessManagement />
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise Features</CardTitle>
                  <CardDescription>
                    Advanced features available for enterprise users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">White-label Solution</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Customize the platform with your own branding
                      </p>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Advanced Analytics</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Detailed insights and custom reporting
                      </p>
                      <Badge variant="default">Available</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Priority Support</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        24/7 dedicated support channel
                      </p>
                      <Badge variant="default">Available</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Custom Integrations</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Build custom integrations with our API
                      </p>
                      <Badge variant="default">Available</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Advanced security configuration options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Badge variant="outline">Configure</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">IP Whitelisting</h4>
                        <p className="text-sm text-muted-foreground">
                          Restrict access to specific IP addresses
                        </p>
                      </div>
                      <Badge variant="outline">Configure</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Audit Logs</h4>
                        <p className="text-sm text-muted-foreground">
                          Track all account activities and changes
                        </p>
                      </div>
                      <Badge variant="default">View Logs</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdvancedSettings;
