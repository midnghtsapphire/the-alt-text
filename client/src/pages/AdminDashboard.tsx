import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, AlertCircle, Clock, XCircle, Link as LinkIcon, FileText, BarChart3, MapPin, Package } from "lucide-react";

export default function AdminDashboard() {
  const { data: verificationStatus, isLoading: verificationLoading } = trpc.admin.verificationStatus.useQuery();
  const { data: linkHealth, isLoading: linkLoading } = trpc.admin.linkHealth.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "needs_review":
        return "bg-orange-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "needs_review":
        return AlertCircle;
      case "failed":
        return XCircle;
      default:
        return FileText;
    }
  };

  if (verificationLoading || linkLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  const verificationPercentage = verificationStatus?.total 
    ? Math.round((verificationStatus.verified / verificationStatus.total) * 100)
    : 0;

  const linkHealthPercentage = linkHealth?.total
    ? Math.round((linkHealth.working / linkHealth.total) * 100)
    : 0;

  return (
    <Layout>
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Public Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Transparent view of content verification status, link health, and quality assurance metrics.
            No authentication required - we believe in public accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Content Items</CardDescription>
              <CardTitle className="text-3xl">{verificationStatus?.total || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Across all content types
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Verified Content</CardDescription>
              <CardTitle className="text-3xl text-green-600">{verificationStatus?.verified || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={verificationPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-2">
                {verificationPercentage}% verified
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Working Links</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{linkHealth?.working || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={linkHealthPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-2">
                {linkHealthPercentage}% healthy
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Needs Review</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{verificationStatus?.needsReview || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Requires attention
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verification">Verification Status</TabsTrigger>
            <TabsTrigger value="links">Link Health</TabsTrigger>
            <TabsTrigger value="breakdown">Content Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Overview</CardTitle>
                  <CardDescription>Status distribution across all content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { status: "verified", label: "Verified", count: verificationStatus?.verified || 0, icon: CheckCircle2 },
                    { status: "pending", label: "Pending", count: verificationStatus?.pending || 0, icon: Clock },
                    { status: "needs_review", label: "Needs Review", count: verificationStatus?.needsReview || 0, icon: AlertCircle },
                    { status: "failed", label: "Failed", count: verificationStatus?.failed || 0, icon: XCircle },
                  ].map(({ status, label, count, icon: Icon }) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${status === "verified" ? "text-green-600" : status === "pending" ? "text-yellow-600" : status === "needs_review" ? "text-orange-600" : "text-red-600"}`} />
                        <span className="font-medium">{label}</span>
                      </div>
                      <Badge className={getStatusColor(status)}>{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                  <CardDescription>Overall content quality indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Verification Rate</span>
                      <span className="text-sm text-muted-foreground">{verificationPercentage}%</span>
                    </div>
                    <Progress value={verificationPercentage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Link Health</span>
                      <span className="text-sm text-muted-foreground">{linkHealthPercentage}%</span>
                    </div>
                    <Progress value={linkHealthPercentage} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">
                        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                      </p>
                      <p>
                        All metrics are updated in real-time as content is verified and links are checked.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="links" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Link Health Status</CardTitle>
                <CardDescription>Recent link validation checks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <LinkIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{linkHealth?.total || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Links</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{linkHealth?.working || 0}</div>
                      <div className="text-sm text-muted-foreground">Working</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold">{linkHealth?.broken || 0}</div>
                      <div className="text-sm text-muted-foreground">Broken</div>
                    </div>
                  </div>
                </div>

                {linkHealth?.recentChecks && linkHealth.recentChecks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3">Recent Checks</h3>
                    {linkHealth.recentChecks.slice(0, 10).map((check: any) => (
                      <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="text-sm font-medium truncate">{check.url}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(check.lastCheckedAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge className={check.isWorking ? "bg-green-500" : "bg-red-500"}>
                          {check.isWorking ? "OK" : `Error ${check.statusCode || "Unknown"}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Type Breakdown</CardTitle>
                <CardDescription>Verification status by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { type: "qa", label: "Q&A Items", icon: FileText, count: (verificationStatus?.byType as any)?.qa || 0 },
                    { type: "statistic", label: "Statistics", icon: BarChart3, count: (verificationStatus?.byType as any)?.statistic || 0 },
                    { type: "resource", label: "Resources", icon: Package, count: (verificationStatus?.byType as any)?.resource || 0 },
                    { type: "location", label: "Locations", icon: MapPin, count: (verificationStatus?.byType as any)?.location || 0 },
                  ].map(({ type, label, icon: Icon, count }) => (
                    <div key={type} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Icon className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <div className="font-semibold">{label}</div>
                        <div className="text-sm text-muted-foreground">{count} items tracked</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
