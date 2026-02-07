import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface ProfileType {
  type: string;
  name: string;
  description: string;
  icon: string;
}

const PROFILE_TYPES: ProfileType[] = [
  { type: "adhd", name: "ADHD", description: "Attention-focused interface with minimal distractions", icon: "🎯" },
  { type: "autism", name: "Autism", description: "Structured, predictable interface with clear patterns", icon: "🧩" },
  { type: "anxiety", name: "Anxiety", description: "Calm, reassuring interface with gentle transitions", icon: "🌊" },
  { type: "dyslexia", name: "Dyslexia", description: "Enhanced readability with optimized fonts and spacing", icon: "📖" },
  { type: "none", name: "Standard", description: "Default interface without special adaptations", icon: "⚙️" },
];

export function NeurodivergentProfileSelector() {
  const utils = trpc.useUtils();
  
  const { data: currentProfile, isLoading: loadingProfile } = trpc.neurodivergent.getProfile.useQuery();
  
  const setProfileMutation = trpc.neurodivergent.upsertProfile.useMutation({
    onSuccess: () => {
      utils.neurodivergent.getProfile.invalidate();
      toast.success("Profile Updated", {
        description: "Your display preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.message || "Failed to update profile",
      });
    },
  });

  const [selectedType, setSelectedType] = useState<string>(currentProfile?.profileType || "none");

  const handleSelectProfile = (type: string) => {
    setSelectedType(type);
    setProfileMutation.mutate({
      profileType: type as "none" | "adhd" | "autism" | "vampire" | "dyslexia" | "anxiety",
    });
  };

  if (loadingProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Preferences</CardTitle>
        <CardDescription>
          Choose how the app presents information to you based on your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROFILE_TYPES.map((profile: ProfileType) => {
            const isSelected = selectedType === profile.type;
            const isCurrent = currentProfile?.profileType === profile.type;
            
            return (
              <button
                key={profile.type}
                onClick={() => handleSelectProfile(profile.type)}
                disabled={setProfileMutation.isPending}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }
                  ${setProfileMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isCurrent && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                
                <div className="text-3xl mb-2">{profile.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.description}</p>
              </button>
            );
          })}
        </div>

        {currentProfile?.profileType && currentProfile.profileType !== "none" && (
          <div className="mt-6 p-4 bg-accent/20 rounded-lg">
            <h4 className="font-semibold mb-2">Current Adaptations:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentProfile.profileType === "adhd" && (
                <>
                  <li>• Shorter text blocks with clear headings</li>
                  <li>• Reduced animations and distractions</li>
                  <li>• Progress indicators for tasks</li>
                </>
              )}
              {currentProfile.profileType === "autism" && (
                <>
                  <li>• Structured layouts with predictable navigation</li>
                  <li>• Detailed instructions and tooltips</li>
                  <li>• Reduced sensory overload</li>
                </>
              )}
              {currentProfile.profileType === "vampire" && (
                <>
                  <li>• True dark theme optimized for night viewing</li>
                  <li>• Reduced blue light emission</li>
                  <li>• Night-friendly color palette</li>
                </>
              )}
              {currentProfile.profileType === "dyslexia" && (
                <>
                  <li>• Dyslexia-friendly fonts and spacing</li>
                  <li>• Increased text size and contrast</li>
                  <li>• Enhanced readability features</li>
                </>
              )}
              {currentProfile.profileType === "anxiety" && (
                <>
                  <li>• Calm, muted color palette</li>
                  <li>• Minimal animations and transitions</li>
                  <li>• Reduced visual complexity</li>
                </>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
