/**
 * Affiliate Dashboard
 * 
 * Complete affiliate link management interface with:
 * - Link generator with product/tier selection
 * - QR code generator and download
 * - Click analytics and conversion tracking
 * - Bulk CSV export
 * - Real-time stats
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, Download, QrCode, BarChart3, TrendingUp, MousePointerClick, DollarSign } from 'lucide-react';

export default function AffiliateDashboard() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [campaign, setCampaign] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedShortLink, setGeneratedShortLink] = useState('');
  const [qrCode, setQrCode] = useState('');

  // Mock affiliate code (would come from user session)
  const affiliateCode = 'ABC12345';

  // Generate link mutation
  const generateLink = trpc.affiliateLinks.buildLink.useQuery(
    {
      affiliateCode,
      product: selectedProduct as any,
      tier: selectedTier as any,
      campaign: campaign || undefined,
    },
    {
      enabled: false, // Manual trigger
    }
  );

  // Generate QR code mutation
  const generateQRMutation = trpc.affiliateLinks.generateQR.useMutation({
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      toast.success('QR code generated!');
    },
  });

  // Get analytics
  const analytics = trpc.affiliateLinks.getAnalytics.useQuery({
    affiliateCode,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  // Generate bulk links
  const bulkLinks = trpc.affiliateLinks.generateBulk.useQuery(
    {
      affiliateCode,
      products: [
        { product: 'scanner', tier: 'starter' },
        { product: 'scanner', tier: 'professional' },
        { product: 'scanner', tier: 'enterprise' },
        { product: 'analyzer', tier: 'starter' },
        { product: 'analyzer', tier: 'professional' },
        { product: 'analyzer', tier: 'enterprise' },
        { product: 'complete_platform', tier: 'starter' },
        { product: 'complete_platform', tier: 'professional' },
        { product: 'complete_platform', tier: 'enterprise' },
      ],
      campaign: 'bulk_export',
    },
    {
      enabled: false, // Manual trigger
    }
  );

  const handleGenerateLink = async () => {
    if (!selectedProduct || !selectedTier) {
      toast.error('Please select product and tier');
      return;
    }

    const result = await generateLink.refetch();
    if (result.data) {
      setGeneratedLink(result.data.link);
      setGeneratedShortLink(result.data.shortLink);
      toast.success('Link generated!');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleGenerateQR = () => {
    if (!generatedLink) {
      toast.error('Generate a link first');
      return;
    }
    generateQRMutation.mutate({ link: generatedLink });
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `affiliate-qr-${affiliateCode}.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  const handleExportCSV = async () => {
    const result = await bulkLinks.refetch();
    if (!result.data) return;

    const csv = [
      ['Product', 'Tier', 'Link', 'Short Link'].join(','),
      ...result.data.links.map(item =>
        [item.product, item.tier, item.link, item.shortLink].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `affiliate-links-${affiliateCode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">Your affiliate code: <span className="font-mono font-bold">{affiliateCode}</span></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.data?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.data?.uniqueClicks || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.data?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,120.50</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generator">Link Generator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Export</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Affiliate Link</CardTitle>
              <CardDescription>Create custom tracking links for specific products and tiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scanner">Scanner API</SelectItem>
                      <SelectItem value="analyzer">Analyzer API</SelectItem>
                      <SelectItem value="reporter">Reporter API</SelectItem>
                      <SelectItem value="fixer">Fixer API</SelectItem>
                      <SelectItem value="complete_platform">Complete Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Campaign Name (Optional)</Label>
                <Input
                  placeholder="e.g., summer_promo"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                />
              </div>

              <Button onClick={handleGenerateLink} className="w-full">
                Generate Link
              </Button>

              {generatedLink && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Full Link</Label>
                    <div className="flex gap-2">
                      <Input value={generatedLink} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyLink(generatedLink)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Link</Label>
                    <div className="flex gap-2">
                      <Input value={generatedShortLink} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyLink(generatedShortLink)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleGenerateQR}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </Button>
                    {qrCode && (
                      <Button variant="outline" onClick={handleDownloadQR}>
                        <Download className="mr-2 h-4 w-4" />
                        Download QR
                      </Button>
                    )}
                  </div>

                  {qrCode && (
                    <div className="flex justify-center">
                      <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Click Analytics</CardTitle>
              <CardDescription>Last 30 days performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Top Countries</h3>
                <div className="space-y-2">
                  {analytics.data?.topCountries.map((item) => (
                    <div key={item.country} className="flex justify-between">
                      <span>{item.country}</span>
                      <span className="font-mono">{item.clicks} clicks</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Top Devices</h3>
                <div className="space-y-2">
                  {analytics.data?.topDevices.map((item) => (
                    <div key={item.device} className="flex justify-between">
                      <span className="capitalize">{item.device}</span>
                      <span className="font-mono">{item.clicks} clicks</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Top Browsers</h3>
                <div className="space-y-2">
                  {analytics.data?.topBrowsers.map((item) => (
                    <div key={item.browser} className="flex justify-between">
                      <span>{item.browser}</span>
                      <span className="font-mono">{item.clicks} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Export</CardTitle>
              <CardDescription>Export all product/tier combinations as CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportCSV} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export All Links as CSV
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                This will generate links for all 9 product/tier combinations and download as CSV.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
