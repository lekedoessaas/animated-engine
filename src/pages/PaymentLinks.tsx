
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Link as LinkIcon, Copy, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaymentLink {
  id: string;
  link_code: string;
  file_id: string;
  custom_price: number;
  custom_message: string;
  expires_at: string;
  max_downloads: number;
  current_downloads: number;
  is_active: boolean;
  created_at: string;
  files: {
    title: string;
    price: number;
  };
}

interface FileOption {
  id: string;
  title: string;
  price: number;
}

const PaymentLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [files, setFiles] = useState<FileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({
    file_id: '',
    custom_price: '',
    custom_message: '',
    expires_at: '',
    max_downloads: '1'
  });

  useEffect(() => {
    if (user) {
      fetchPaymentLinks();
      fetchFiles();
    }
  }, [user]);

  const fetchPaymentLinks = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('payment_links')
        .select(`
          *,
          files!inner(title, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPaymentLinks(data);
      }
    } catch (error) {
      console.error('Error fetching payment links:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('files')
        .select('id, title, price')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (data) {
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const generateLinkCode = () => {
    return Math.random().toString(36).substring(2, 12);
  };

  const createPaymentLink = async () => {
    if (!user || !linkForm.file_id) return;

    try {
      const linkCode = generateLinkCode();
      
      const { error } = await supabase
        .from('payment_links')
        .insert({
          user_id: user.id,
          file_id: linkForm.file_id,
          link_code: linkCode,
          custom_price: linkForm.custom_price ? parseFloat(linkForm.custom_price) : null,
          custom_message: linkForm.custom_message || null,
          expires_at: linkForm.expires_at || null,
          max_downloads: parseInt(linkForm.max_downloads),
          current_downloads: 0,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment link created successfully'
      });

      setIsCreateDialogOpen(false);
      setLinkForm({
        file_id: '',
        custom_price: '',
        custom_message: '',
        expires_at: '',
        max_downloads: '1'
      });
      fetchPaymentLinks();
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment link',
        variant: 'destructive'
      });
    }
  };

  const copyLinkToClipboard = (linkCode: string) => {
    const url = `${window.location.origin}/pay/${linkCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'Payment link copied to clipboard'
    });
  };

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_links')
        .update({ is_active: !currentStatus })
        .eq('id', linkId);

      if (error) throw error;

      setPaymentLinks(prev =>
        prev.map(link =>
          link.id === linkId ? { ...link, is_active: !currentStatus } : link
        )
      );

      toast({
        title: 'Success',
        description: `Payment link ${!currentStatus ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error updating payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment link',
        variant: 'destructive'
      });
    }
  };

  const deletePaymentLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setPaymentLinks(prev => prev.filter(link => link.id !== linkId));

      toast({
        title: 'Success',
        description: 'Payment link deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment link',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Links</h1>
            <p className="text-gray-600 mt-2">Create and manage payment links for your files</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Payment Link</DialogTitle>
                <DialogDescription>
                  Generate a secure payment link for file access
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file" className="text-right">
                    File *
                  </Label>
                  <Select
                    value={linkForm.file_id}
                    onValueChange={(value) => setLinkForm({ ...linkForm, file_id: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a file" />
                    </SelectTrigger>
                    <SelectContent>
                      {files.map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.title} - {formatCurrency(file.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="custom_price" className="text-right">
                    Custom Price
                  </Label>
                  <Input
                    id="custom_price"
                    type="number"
                    step="0.01"
                    value={linkForm.custom_price}
                    onChange={(e) => setLinkForm({ ...linkForm, custom_price: e.target.value })}
                    className="col-span-3"
                    placeholder="Leave empty to use file price"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="max_downloads" className="text-right">
                    Max Downloads
                  </Label>
                  <Input
                    id="max_downloads"
                    type="number"
                    min="1"
                    value={linkForm.max_downloads}
                    onChange={(e) => setLinkForm({ ...linkForm, max_downloads: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expires_at" className="text-right">
                    Expires At
                  </Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={linkForm.expires_at}
                    onChange={(e) => setLinkForm({ ...linkForm, expires_at: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="custom_message" className="text-right">
                    Custom Message
                  </Label>
                  <Textarea
                    id="custom_message"
                    value={linkForm.custom_message}
                    onChange={(e) => setLinkForm({ ...linkForm, custom_message: e.target.value })}
                    className="col-span-3"
                    placeholder="Optional message for customers"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createPaymentLink}>Create Payment Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Links</CardTitle>
            <CardDescription>Manage all your payment links</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentLinks.length === 0 ? (
              <div className="text-center py-12">
                <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment links yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first payment link to start selling your files
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Link
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{link.files.title}</p>
                          <p className="text-sm text-gray-500">
                            /pay/{link.link_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(link.custom_price || link.files.price)}
                      </TableCell>
                      <TableCell>
                        {link.current_downloads} / {link.max_downloads}
                      </TableCell>
                      <TableCell>
                        {formatDate(link.expires_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={link.is_active ? 'default' : 'secondary'}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyLinkToClipboard(link.link_code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/pay/${link.link_code}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLinkStatus(link.id, link.is_active)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePaymentLink(link.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentLinks;
