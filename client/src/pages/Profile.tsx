import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeurodivergentProfileSelector } from "@/components/NeurodivergentProfileSelector";
import { User, Mail, Calendar, Settings } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Please log in to view your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href={getLoginUrl()}>Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Profile & Settings</h1>
          <p className="text-lg text-gray-600">
            Manage your account and display preferences
          </p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                <p className="font-mono text-sm">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                <Badge variant="secondary">{user?.role || "User"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Neurodivergent Profile Selector (Module 02) */}
        <NeurodivergentProfileSelector />

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Additional Settings
            </CardTitle>
            <CardDescription>
              More settings and preferences coming soon
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
