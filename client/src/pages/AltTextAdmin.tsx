import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Users,
  Activity,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function AltTextAdmin() {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Fetch admin data
  // const { data: stats } = trpc.alttext.adminGetStats.useQuery(); // TODO: Verify procedure name
  const stats: any = { totalUsers: 0, activeScans: 0, monthlyRevenue: 0, pendingReviews: 0 };
  // const { data: pendingReviews } = trpc.alttext.getPendingReviews.useQuery(); // TODO: Add procedure
  const pendingReviews: any[] = [];
  // const { data: users } = trpc.alttext.getAllUsers.useQuery(); // TODO: Add procedure
  const users: any[] = [];
  // const { data: systemHealth } = trpc.alttext.getSystemHealth.useQuery(); // TODO: Add procedure
  const systemHealth: any = null;

  // Mutations
  // const approveAltText = trpc.alttext.approveAltText.useMutation(); // TODO: Add procedure
  // const rejectAltText = trpc.alttext.rejectAltText.useMutation(); // TODO: Add procedure

  const handleApprove = (imageId: number) => {
    // approveAltText.mutate({ imageId });
    console.log('Approve:', imageId);
  };

  const handleReject = (imageId: number, reason: string) => {
    // rejectAltText.mutate({ imageId, reason });
    console.log('Reject:', imageId, reason);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                The Alt Text Platform Management
              </p>
            </div>

            <Button variant="outline">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4 mr-2"
              />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Scans</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.activeScans || 0}
                </p>
              </div>
              <Activity className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${stats?.monthlyRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.pendingReviews || 0}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="reviews">AI Reviews</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* AI Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Pending AI-Generated Alt Text Reviews
              </h2>

              {pendingReviews && pendingReviews.length > 0 ? (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Image Preview */}
                        <div>
                          <img
                            src={review.imageUrl}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg border"
                          />
                          <div className="mt-4 space-y-2">
                            <div>
                              <p className="text-sm text-gray-600">Page Context</p>
                              <p className="font-medium">{review.pageContext}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Surrounding Text
                              </p>
                              <p className="text-sm">{review.surroundingText}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Image Type</p>
                              <Badge>{review.imageType}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Review Details */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">Current Alt Text</p>
                            <p className="font-medium text-red-600">
                              {review.currentAltText || "(empty)"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">
                              AI-Generated Alt Text
                            </p>
                            <p className="font-medium text-green-600">
                              {review.generatedAltText}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">Confidence Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${review.confidence}%` }}
                                />
                              </div>
                              <span className="font-bold">{review.confidence}%</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">OCR Text Detected</p>
                            <p className="text-sm">
                              {review.ocrText || "(none)"}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              className="flex-1"
                              onClick={() => handleApprove(review.id)}
                              disabled={false}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() =>
                                handleReject(review.id, "Needs improvement")
                              }
                              disabled={false}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>

                          <Input
                            placeholder="Optional: Edit alt text before approving"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending reviews. All AI-generated alt text is approved!</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">User Management</h2>

              {users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Scans Used</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge>{user.planType}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.scansUsed} / {user.scansLimit}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${user.totalRevenue}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No users yet.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">System Health Monitor</h2>

              {systemHealth && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">API Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            systemHealth.apiStatus === "healthy"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="font-semibold">
                          {systemHealth.apiStatus}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Database</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            systemHealth.databaseStatus === "healthy"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="font-semibold">
                          {systemHealth.databaseStatus}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Job Queue</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            systemHealth.queueStatus === "healthy"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="font-semibold">
                          {systemHealth.queueStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">External APIs</h3>
                    <div className="space-y-2">
                      {systemHealth.externalApis?.map((api: any) => (
                        <div
                          key={api.name}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">{api.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              {api.responseTime}ms
                            </span>
                            <Badge
                              variant={
                                api.status === "healthy" ? "default" : "destructive"
                              }
                            >
                              {api.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">Error Logs (Last 24h)</h3>
                    <div className="space-y-2">
                      {systemHealth.recentErrors?.map((error: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <p className="font-medium text-red-800">
                            {error.message}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(error.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Platform Analytics</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-2">Revenue Growth</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600">Chart placeholder</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">User Growth</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600">Chart placeholder</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">API Usage</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600">Chart placeholder</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Scan Volume</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600">Chart placeholder</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Attribution Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="container py-6 text-center text-sm text-gray-600">
          <p>Admin panel for The Alt Text platform</p>
          <p className="mt-2">
            Code review provided by CodeRabbit (free, open-source)
          </p>
        </div>
      </footer>
    </div>
  );
}
