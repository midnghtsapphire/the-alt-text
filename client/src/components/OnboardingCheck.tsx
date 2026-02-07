import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingWizard } from "./OnboardingWizard";
import { Loader2 } from "lucide-react";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = trpc.neurodivergent.getProfile.useQuery(undefined, {
    enabled: !!user, // Only fetch if user is logged in
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if user is logged in but has no profile
    if (user && !profileLoading && !profile) {
      setShowOnboarding(true);
    }
  }, [user, profile, profileLoading]);

  // Show loading while checking auth and profile
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show onboarding wizard if needed
  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
  }

  // Show normal app
  return <>{children}</>;
}
