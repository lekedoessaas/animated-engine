import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, CreditCard, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  bio: string | null;
  website: string | null;
  notification_preferences: {
    email_notifications: boolean;
    payment_alerts: boolean;
    file_downloads: boolean;
    weekly_reports: boolean;
  };
  security_settings: {
    two_factor_enabled: boolean;
    login_notifications: boolean;
  };
  created_at: string;
  updated_at: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile();
        } else {
          throw error;
        }
      } else {
        // Safely handle JSON fields with fallbacks
        const notification_preferences = data.notification_preferences ? 
          (typeof data.notification_preferences === 'object' ? data.notification_preferences : 
           JSON.parse(data.notification_preferences as string)) : {
            email_notifications: true,
            payment_alerts: true,
            file_downloads: false,
            weekly_reports: true
          };

        const security_settings = data.security_settings ?
          (typeof data.security_settings === 'object' ? data.security_settings :
           JSON.parse(data.security_settings as string)) : {
            two_factor_enabled: false,
            login_notifications: true
          };

        const typedProfile: UserProfile = {
          id: data.id,
          full_name: data.full_name,
          company_name: data.company_name,
          bio: data.bio,
          website: data.website,
          notification_preferences,
          security_settings,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setProfile(typedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const newProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        notification_preferences: {
          email_notifications: true,
          payment_alerts: true,
          file_downloads: false,
          weekly_reports: true
        },
        security_settings: {
          two_factor_enabled: false,
          login_notifications: true
        }
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        notification_preferences: newProfile.notification_preferences,
        security_settings: newProfile.security_settings
      } as UserProfile);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBasicInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateProfile({
      full_name: formData.get('full_name') as string,
      company_name: formData.get('company_name') as string,
      bio: formData.get('bio') as string,
      website: formData.get('website') as string
    });
  };

  const updateNotificationPreference = (key: keyof UserProfile['notification_preferences'], value: boolean) => {
    if (!profile) return;
    
    const updatedPreferences = {
      ...profile.notification_preferences,
      [key]: value
    };
    
    updateProfile({
      notification_preferences: updatedPreferences
    });
  };

  const updateSecuritySetting = (key: keyof UserProfile['security_settings'], value: boolean) => {
    if (!profile) return;
    
    const updatedSettings = {
      ...profile.security_settings,
      [key]: value
    };
    
    updateProfile({
      security_settings: updatedSettings
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-gray-600">Failed to load profile settings</p>
            <Button onClick={fetchProfile} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your personal information and profile details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={profile.full_name || ''}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        defaultValue={profile.company_name || ''}
                        placeholder="Enter your company name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      defaultValue={profile.website || ''}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={profile.bio || ''}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.email_notifications}
                    onCheckedChange={(checked) => updateNotificationPreference('email_notifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive payments
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.payment_alerts}
                    onCheckedChange={(checked) => updateNotificationPreference('payment_alerts', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>File Downloads</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications when your files are downloaded
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.file_downloads}
                    onCheckedChange={(checked) => updateNotificationPreference('file_downloads', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of your account activity
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.weekly_reports}
                    onCheckedChange={(checked) => updateNotificationPreference('weekly_reports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={profile.security_settings.two_factor_enabled}
                    onCheckedChange={(checked) => updateSecuritySetting('two_factor_enabled', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <Switch
                    checked={profile.security_settings.login_notifications}
                    onCheckedChange={(checked) => updateSecuritySetting('login_notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your billing information and subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Management</h3>
                  <p className="text-gray-500 mb-4">
                    Billing and subscription management will be available soon
                  </p>
                  <Button disabled>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
