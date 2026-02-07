import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Download, Eye, Key, CreditCard } from "lucide-react";

export default function AltTextDashboard() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scanType, setScanType] = useState<"full" | "single_page" | "custom">("full");

  // Fetch user's scans
  const { data: scans, isLoading: scansLoading } = trpc.alttext.listScans.useQuery({ limit: 10, offset: 0 });
  
  // Fetch subscription info
  const { data: subscription } = trpc.alttext.getSubscription.useQuery();
  
  // Fetch API keys
  // const { data: apiKeys } = trpc.alttext.listApiKeys.useQuery(); // TODO: Add listApiKeys procedure
  const apiKeys: any[] = [];

  // Start scan mutation
  const startScan = trpc.alttext.startScan.useMutation({
    onSuccess: () => {
      setWebsiteUrl("");
      // Refresh scans list
    },
  });

  const handleStartScan = () => {
    if (!websiteUrl) return;
    
    startScan.mutate({
      websiteUrl,
      scanType,
      maxPages: 100,
      includeSubdomains: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                The Alt Text Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your accessibility compliance scans
              </p>
            </div>
            
            {subscription && (
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Plan</p>
                    <p className="text-lg font-bold text-blue-600">
                      {subscription.plan === "starter" && "Starter"}
                      {subscription.plan === "professional" && "Professional"}
                      {subscription.plan === "enterprise" && "Enterprise"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Scans Used</p>
                    <p className="text-lg font-bold">
                      {subscription.scansUsedThisMonth} / {subscription.maxScansPerMonth === -1 ? "∞" : subscription.maxScansPerMonth}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="scans" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="scans">Scans</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Scans Tab */}
          <TabsContent value="scans" className="space-y-6">
            {/* Start New Scan */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Start New Scan</h2>
              <div className="flex gap-4">
                <Input
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value as any)}
                  className="px-4 py-2 border rounded-md"
                >
                  <option value="full">Full Website</option>
                  <option value="single_page">Single Page</option>
                  <option value="custom">Custom URLs</option>
                </select>
                <Button
                  onClick={handleStartScan}
                  disabled={!websiteUrl || startScan.isPending}
                >
                  {startScan.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Scans List */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Recent Scans</h2>
              
              {scansLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : scans && scans.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans?.map((scan: any) => (                      <TableRow key={scan.id}>
                        <TableCell className="font-medium">
                          {scan.websiteUrl}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              scan.status === "completed"
                                ? "default"
                                : scan.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {scan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {scan.status === "in_progress" && (
                            <div className="space-y-1">
                              <Progress value={scan.progress || 0} className="w-24" />
                              <p className="text-xs text-gray-600">
                                {scan.progress || 0}%
                              </p>
                            </div>
                          )}
                          {scan.status === "completed" && (
                            <span className="text-sm text-gray-600">Complete</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {scan.violationsFound !== null && (
                            <span className="text-red-600 font-semibold">
                              {scan.violationsFound}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {scan.complianceScore !== null && (
                            <span
                              className={`font-semibold ${
                                scan.complianceScore >= 90
                                  ? "text-green-600"
                                  : scan.complianceScore >= 70
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {scan.complianceScore}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(scan.startedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Scan Details</DialogTitle>
                                  <DialogDescription>
                                    {scan.websiteUrl}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600">Status</p>
                                      <p className="font-semibold">{scan.status}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Pages Scanned</p>
                                      <p className="font-semibold">{scan.pagesScanned}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Images Found</p>
                                      <p className="font-semibold">{scan.imagesFound}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Violations</p>
                                      <p className="font-semibold text-red-600">
                                        {scan.violationsFound}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {scan.status === "completed" && (
                                    <Button className="w-full">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download Full Report
                                    </Button>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {scan.status === "completed" && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scans yet. Start your first scan above!</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Generated Reports</h2>
              <p className="text-gray-600">
                View and download your accessibility compliance reports.
              </p>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">API Keys</h2>
                <Button>
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
              
              {apiKeys && apiKeys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                   {apiKeys?.map((key: any) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {key.apiKey.substring(0, 20)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.status === "active" ? "default" : "secondary"}>
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys yet. Generate your first key to get started!</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Billing & Subscription</h2>
              
              {subscription && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Plan</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {subscription.plan === "starter" && "Starter"}
                        {subscription.plan === "professional" && "Professional"}
                        {subscription.plan === "enterprise" && "Enterprise"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Cost</p>
                      <p className="text-2xl font-bold">
                        ${subscription.plan === "starter" ? "99" : subscription.plan === "professional" ? "299" : "999"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Billing Date</p>
                      <p className="text-lg font-semibold">
                        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button>Upgrade Plan</Button>
                    <Button variant="outline">Update Payment Method</Button>
                    <Button variant="outline">View Invoices</Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Attribution Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="container py-6 text-center text-sm text-gray-600">
          <p>Accessibility analysis provided by free sources and APIs</p>
          <p className="mt-2">
            Powered by OpenRouter Vision, Playwright, Puppeteer, and CodeRabbit
          </p>
        </div>
      </footer>
    </div>
  );
}
