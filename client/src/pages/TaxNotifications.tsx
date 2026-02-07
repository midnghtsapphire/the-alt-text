import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bell, CheckCircle2, DollarSign, TrendingUp, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function TaxNotifications() {
  const { data: notifications = [], refetch } = trpc.tax.listNotifications.useQuery({ unreadOnly: false });
  const { data: unreadCount = 0 } = trpc.tax.getUnreadCount.useQuery();

  const markAsRead = trpc.tax.markNotificationAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Notification marked as read");
    },
  });

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const getIcon = (type: string, severity: string) => {
    if (type === "anomaly") return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    if (type === "duplicate") return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (type === "large_purchase") return <DollarSign className="w-5 h-5 text-blue-500" />;
    if (type === "budget_warning") return <TrendingUp className="w-5 h-5 text-red-500" />;
    return <Info className="w-5 h-5 text-slate-500" />;
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === "critical") return <Badge variant="destructive">Critical</Badge>;
    if (severity === "warning") return <Badge className="bg-orange-500">Warning</Badge>;
    return <Badge variant="secondary">Info</Badge>;
  };

  const renderNotificationCard = (notification: any) => (
    <Card key={notification.id} className={notification.isRead ? "opacity-60" : "border-blue-200 bg-blue-50/30"}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getIcon(notification.type, notification.severity)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">{notification.title}</h3>
              <div className="flex items-center gap-2">
                {getSeverityBadge(notification.severity)}
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead.mutate({ id: notification.id })}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
              {notification.relatedExpenseId && (
                <span className="text-blue-600">Related to expense #{notification.relatedExpenseId}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              Notifications
            </h1>
            <p className="text-slate-600 mt-1">Spending alerts and expense notifications</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="text-lg px-4 py-2 bg-blue-600">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="space-y-4 mt-6">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
                  <p className="text-slate-600">You have no unread notifications</p>
                </CardContent>
              </Card>
            ) : (
              unreadNotifications.map(renderNotificationCard)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications yet</h3>
                  <p className="text-slate-600">You'll see spending alerts and notifications here</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {unreadNotifications.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                      Unread
                    </h2>
                    <div className="space-y-3">
                      {unreadNotifications.map(renderNotificationCard)}
                    </div>
                  </div>
                )}
                {readNotifications.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                      Read
                    </h2>
                    <div className="space-y-3">
                      {readNotifications.map(renderNotificationCard)}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Notification Types Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Types</CardTitle>
            <CardDescription>What each notification means</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Anomaly Detected</p>
                <p className="text-xs text-slate-600">
                  Unusual spending pattern compared to your history
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Possible Duplicate</p>
                <p className="text-xs text-slate-600">
                  Similar expense found on the same date
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Large Purchase</p>
                <p className="text-xs text-slate-600">
                  Expense over $500 recorded
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Budget Warning</p>
                <p className="text-xs text-slate-600">
                  Approaching or exceeded budget threshold
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
