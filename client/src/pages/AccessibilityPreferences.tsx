import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type ProfileType = "none" | "adhd" | "autism" | "anxiety";

interface CustomSettings {
  uiComplexity: "minimal" | "standard" | "detailed";
  languageTone: "simple" | "professional" | "technical";
  colorScheme: "light" | "dark" | "auto";
  animationsEnabled: boolean;
}

export default function AccessibilityPreferences() {
  const { data: profile, isLoading } = trpc.neurodivergent.getProfile.useQuery();
  const updateProfile = trpc.neurodivergent.upsertProfile.useMutation();
  const { toast } = useToast();

  const [profileType, setProfileType] = useState<ProfileType>("none");
  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    uiComplexity: "standard",
    languageTone: "professional",
    colorScheme: "auto",
    animationsEnabled: true,
  });

  useEffect(() => {
    if (profile) {
      setProfileType(profile.profileType as ProfileType);
      setCustomSettings({
        uiComplexity: profile.uiComplexity,
        languageTone: profile.languageTone,
        colorScheme: profile.colorScheme,
        animationsEnabled: !profile.reducedAnimations,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        profileType,
        uiComplexity: customSettings.uiComplexity as "minimal" | "standard" | "detailed",
        languageTone: customSettings.languageTone as "simple" | "professional" | "technical",
        colorScheme: customSettings.colorScheme as "light" | "dark" | "auto",
        reducedAnimations: !customSettings.animationsEnabled,
      });

      toast({
        title: "Preferences saved",
        description: "Your accessibility preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accessibility Preferences
          </h1>
          <p className="text-gray-600">
            Customize the interface to work better for your needs
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Accessibility Profile</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the profile that best describes your needs. This will adjust the interface automatically.
            </p>

            <RadioGroup value={profileType} onValueChange={(v) => setProfileType(v as ProfileType)}>
              <div className="space-y-3">
                <Label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="none" className="mt-1" />
                  <div>
                    <div className="font-medium">No specific needs</div>
                    <div className="text-sm text-gray-600">Standard interface works great for me</div>
                  </div>
                </Label>

                <Label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="adhd" className="mt-1" />
                  <div>
                    <div className="font-medium">ADHD</div>
                    <div className="text-sm text-gray-600">
                      Simplified layouts, clear focus, reduced distractions
                    </div>
                  </div>
                </Label>

                <Label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="autism" className="mt-1" />
                  <div>
                    <div className="font-medium">Autism</div>
                    <div className="text-sm text-gray-600">
                      Predictable patterns, clear expectations, consistent layouts
                    </div>
                  </div>
                </Label>

                <Label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="anxiety" className="mt-1" />
                  <div>
                    <div className="font-medium">Anxiety</div>
                    <div className="text-sm text-gray-600">
                      Gentle language, reassuring messages, no pressure
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Interface Preferences</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">UI Complexity</Label>
                <RadioGroup
                  value={customSettings.uiComplexity}
                  onValueChange={(v) =>
                    setCustomSettings({ ...customSettings, uiComplexity: v as any })
                  }
                >
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="simplified" />
                      <div>
                        <div className="font-medium">Simplified</div>
                        <div className="text-sm text-gray-600">Fewer options, larger text, more spacing</div>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="standard" />
                      <div>
                        <div className="font-medium">Standard</div>
                        <div className="text-sm text-gray-600">Balanced interface for most users</div>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="advanced" />
                      <div>
                        <div className="font-medium">Advanced</div>
                        <div className="text-sm text-gray-600">More features, compact layout</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Language Tone</Label>
                <RadioGroup
                  value={customSettings.languageTone}
                  onValueChange={(v) =>
                    setCustomSettings({ ...customSettings, languageTone: v as any })
                  }
                >
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="gentle" />
                      <div>
                        <div className="font-medium">Gentle</div>
                        <div className="text-sm text-gray-600">Supportive, encouraging messages</div>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="standard" />
                      <div>
                        <div className="font-medium">Standard</div>
                        <div className="text-sm text-gray-600">Neutral, professional tone</div>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="direct" />
                      <div>
                        <div className="font-medium">Direct</div>
                        <div className="text-sm text-gray-600">Concise, to-the-point communication</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Visual Preferences</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Color Scheme</Label>
                <RadioGroup
                  value={customSettings.colorScheme}
                  onValueChange={(v) =>
                    setCustomSettings({ ...customSettings, colorScheme: v as any })
                  }
                >
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="standard" />
                      <div>
                        <div className="font-medium">Standard</div>
                        <div className="text-sm text-gray-600">Default color palette</div>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="high-contrast" />
                      <div>
                        <div className="font-medium">High Contrast</div>
                        <div className="text-sm text-gray-600">Stronger colors for better visibility</div>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="soft-colors" />
                      <div>
                        <div className="font-medium">Soft Colors</div>
                        <div className="text-sm text-gray-600">Muted tones, easier on the eyes</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Animations</Label>
                <RadioGroup
                  value={customSettings.animationsEnabled ? "enabled" : "disabled"}
                  onValueChange={(v) =>
                    setCustomSettings({ ...customSettings, animationsEnabled: v === "enabled" })
                  }
                >
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="enabled" />
                      <div>
                        <div className="font-medium">Enabled</div>
                        <div className="text-sm text-gray-600">Smooth transitions and effects</div>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="disabled" />
                      <div>
                        <div className="font-medium">Reduced Motion</div>
                        <div className="text-sm text-gray-600">Minimal animations, better for focus</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
