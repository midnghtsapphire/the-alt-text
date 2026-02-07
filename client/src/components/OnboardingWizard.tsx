import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

type ProfileType = "none" | "adhd" | "autism" | "anxiety";

interface CustomSettings {
  uiComplexity: "simplified" | "standard" | "advanced";
  languageTone: "gentle" | "standard" | "direct";
  colorScheme: "high-contrast" | "soft-colors" | "standard";
  animationsEnabled: boolean;
}

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState<ProfileType>("none");
  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    uiComplexity: "standard",
    languageTone: "standard",
    colorScheme: "standard",
    animationsEnabled: true,
  });

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProfile = trpc.neurodivergent.upsertProfile.useMutation();

  const handleComplete = async () => {
    try {
      await createProfile.mutateAsync({
        profileType,
        uiComplexity: customSettings.uiComplexity as "minimal" | "standard" | "detailed",
        languageTone: customSettings.languageTone === "standard" ? "professional" : customSettings.languageTone as "simple" | "professional" | "technical",
        colorScheme: customSettings.colorScheme === "standard" ? "auto" : customSettings.colorScheme as "light" | "dark" | "auto",
        reducedAnimations: !customSettings.animationsEnabled,
      });

      toast({
        title: "Welcome to Mechatropolis!",
        description: "Your preferences have been saved.",
      });

      onComplete();
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Mechatropolis!
          </h1>
          <p className="text-gray-600">
            Let's personalize your experience. This will only take a minute.
          </p>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Do you have any accessibility needs?
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                We can adapt the interface to work better for you. Select the option that best describes you:
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
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Interface Preferences
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Customize how information is displayed
              </p>

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
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Visual Preferences
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Adjust colors and animations for comfort
              </p>

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
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleComplete} disabled={createProfile.isPending}>
                {createProfile.isPending ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
