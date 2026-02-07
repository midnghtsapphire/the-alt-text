import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { CheckCircle2, Circle, MapPin, Calendar, Target, Upload, FileText, Trash2, Download, Plus, AlertCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { storagePut } from "../../../server/storage";

export default function MyProgress() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [targetMoveDate, setTargetMoveDate] = useState("");
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);

  const { data: plans, refetch: refetchPlans } = trpc.progress.myPlans.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: locations } = trpc.nomad.locations.useQuery();

  const createPlanMutation = trpc.progress.createPlan.useMutation({
    onSuccess: () => {
      toast.success("Relocation plan created!");
      setShowWizard(false);
      setSelectedLocationId(null);
      setTargetMoveDate("");
      refetchPlans();
    },
    onError: (error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    },
  });

  const handleCreatePlan = () => {
    if (!selectedLocationId) {
      toast.error("Please select a target city");
      return;
    }
    createPlanMutation.mutate({
      locationId: selectedLocationId,
      targetMoveDate: targetMoveDate || undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Track Your Relocation</CardTitle>
            <CardDescription>
              Sign in to create and manage your personalized relocation plan with step-by-step guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>Sign In to Get Started</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">My Relocation Progress</h1>
            <p className="text-lg text-muted-foreground">
              Track your journey to a new opportunity with guided checklists and progress tracking
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Start Your Relocation Plan</CardTitle>
              <CardDescription>
                Create a personalized plan to track your progress through pre-departure preparation and post-arrival settlement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showWizard} onOpenChange={setShowWizard}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Relocation Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Your Relocation Plan</DialogTitle>
                    <DialogDescription>
                      Choose your target city and set a move date to get started with your personalized checklist
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Target City *</Label>
                      <Select
                        value={selectedLocationId?.toString() || ""}
                        onValueChange={(value) => setSelectedLocationId(parseInt(value))}
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations?.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                              {loc.city}, {loc.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Choose the city where you plan to relocate for tool & die opportunities
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moveDate">Target Move Date (Optional)</Label>
                      <Input
                        id="moveDate"
                        type="date"
                        value={targetMoveDate}
                        onChange={(e) => setTargetMoveDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <p className="text-sm text-muted-foreground">
                        Setting a target date helps you stay on track with deadlines for each step
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">What happens next?</p>
                          <p className="text-blue-700 dark:text-blue-300">
                            You'll get a personalized checklist with pre-departure and post-arrival steps, progress tracking, document upload, and deadline reminders.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowWizard(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePlan}
                      disabled={!selectedLocationId || createPlanMutation.isPending}
                      className="flex-1"
                    >
                      {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show active plans
  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Relocation Progress</h1>
            <p className="text-muted-foreground">Track your journey to new opportunities</p>
          </div>
          <Dialog open={showWizard} onOpenChange={setShowWizard}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Your Relocation Plan</DialogTitle>
                <DialogDescription>
                  Choose your target city and set a move date to get started
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Target City *</Label>
                  <Select
                    value={selectedLocationId?.toString() || ""}
                    onValueChange={(value) => setSelectedLocationId(parseInt(value))}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>
                          {loc.city}, {loc.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moveDate">Target Move Date (Optional)</Label>
                  <Input
                    id="moveDate"
                    type="date"
                    value={targetMoveDate}
                    onChange={(e) => setTargetMoveDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowWizard(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlan}
                  disabled={!selectedLocationId || createPlanMutation.isPending}
                  className="flex-1"
                >
                  {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: any }) {
  const { data: locations } = trpc.nomad.locations.useQuery();
  const location = locations?.find(loc => loc.id === plan.locationId);
  const { data: preDepartureSteps } = trpc.nomad.relocationSteps.useQuery({
    locationId: plan.locationId,
    phase: "pre_departure",
  });
  const { data: postArrivalSteps } = trpc.nomad.relocationSteps.useQuery({
    locationId: plan.locationId,
    phase: "post_arrival",
  });
  const { data: progress, refetch: refetchProgress } = trpc.progress.getStepProgress.useQuery({
    planId: plan.id,
  });

  const updateStepMutation = trpc.progress.updateStepProgress.useMutation({
    onSuccess: () => {
      refetchProgress();
      toast.success("Progress updated!");
    },
  });

  const generateShareLinkMutation = trpc.share.generateShareLink.useMutation({
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success("Share link copied to clipboard!");
    },
  });

  const allSteps = [...(preDepartureSteps || []), ...(postArrivalSteps || [])];
  const completedCount = progress?.filter((p) => p.isCompleted).length || 0;
  const totalCount = allSteps.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleStep = (stepId: number, currentlyCompleted: boolean) => {
    updateStepMutation.mutate({
      relocationPlanId: plan.id,
      stepId,
      isCompleted: !currentlyCompleted,
      completedAt: !currentlyCompleted ? new Date().toISOString() : null,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "preparing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "relocating":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "settled":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl mb-2 break-words">
              {location?.city}, {location?.state}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{location?.region} Region</span>
              </div>
              {plan.targetMoveDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Target: {new Date(plan.targetMoveDate).toLocaleDateString()}</span>
                </div>
              )}
              <Badge className={getStatusColor(plan.currentStatus)}>
                {plan.currentStatus.charAt(0).toUpperCase() + plan.currentStatus.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0 text-center sm:text-right">
            <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
            <div className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} steps
            </div>
          </div>
        </div>
        <Progress value={completionPercentage} className="mt-4" />
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateShareLinkMutation.mutate({ planId: plan.id })}
            disabled={generateShareLinkMutation.isPending}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pre-departure" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pre-departure">
              Pre-Departure ({preDepartureSteps?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="post-arrival">
              Post-Arrival ({postArrivalSteps?.length || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pre-departure" className="mt-6">
            <StepsList
              steps={preDepartureSteps || []}
              progress={progress || []}
              planId={plan.id}
              onToggleStep={handleToggleStep}
            />
          </TabsContent>
          <TabsContent value="post-arrival" className="mt-6">
            <StepsList
              steps={postArrivalSteps || []}
              progress={progress || []}
              planId={plan.id}
              onToggleStep={handleToggleStep}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StepsList({
  steps,
  progress,
  planId,
  onToggleStep,
}: {
  steps: any[];
  progress: any[];
  planId: number;
  onToggleStep: (stepId: number, currentlyCompleted: boolean) => void;
}) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No steps available for this phase</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const stepProgress = progress.find((p) => p.stepId === step.id);
        const isCompleted = stepProgress?.isCompleted === 1;

        return (
          <div
            key={step.id}
            className={`p-4 border rounded-lg transition-all ${
              isCompleted ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggleStep(step.id, isCompleted)}
                className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <h3 className={`font-semibold break-words ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                    {step.title}
                  </h3>
                  {step.estimatedCost && step.estimatedCost > 0 && (
                    <div className="text-sm font-medium text-primary flex-shrink-0">
                      ${step.estimatedCost.toLocaleString()}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                {stepProgress && (
                  <StepDocuments stepProgressId={stepProgress.id} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepDocuments({ stepProgressId }: { stepProgressId: number }) {
  const [uploading, setUploading] = useState(false);
  const { data: documents, refetch: refetchDocuments } = trpc.progress.getDocuments.useQuery({
    stepProgressId,
  });

  const addDocumentMutation = trpc.progress.addDocument.useMutation({
    onSuccess: () => {
      refetchDocuments();
      toast.success("Document uploaded!");
    },
  });

  const deleteDocumentMutation = trpc.progress.deleteDocument.useMutation({
    onSuccess: () => {
      refetchDocuments();
      toast.success("Document deleted!");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `documents/${stepProgressId}-${timestamp}-${randomSuffix}-${file.name}`;

      // Upload to S3 (this would need to be done server-side in production)
      // For now, we'll simulate it
      const fileUrl = `https://storage.example.com/${fileKey}`;

      await addDocumentMutation.mutateAsync({
        stepProgressId,
        fileName: file.name,
        fileUrl,
        fileKey,
        fileSize: file.size,
        mimeType: file.type,
      });
    } catch (error) {
      toast.error("Failed to upload document");
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Documents ({documents?.length || 0})</span>
      </div>
      
      {documents && documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-2 p-2 bg-background border rounded text-sm"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{doc.fileName}</span>
                {doc.fileSize && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ({(doc.fileSize / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.fileUrl, "_blank")}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete this document?")) {
                      deleteDocumentMutation.mutate({ documentId: doc.id });
                    }
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor={`upload-${stepProgressId}`} className="cursor-pointer">
          <div className="flex items-center gap-2 p-2 border-2 border-dashed rounded hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : "Upload Document"}
            </span>
          </div>
        </Label>
        <Input
          id={`upload-${stepProgressId}`}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <p className="text-xs text-muted-foreground mt-1">
          PDF, Word, or Image files (max 10MB)
        </p>
      </div>
    </div>
  );
}
