import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ThumbsUp, Lightbulb, Bug, TrendingUp, FileText, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Suggestions() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestionType, setSuggestionType] = useState<"feature" | "bug" | "improvement" | "content">("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: allSuggestions, isLoading, refetch } = trpc.suggestions.list.useQuery({});
  const createMutation = trpc.suggestions.create.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback. We'll review it soon.");
      // Reset form
      setName("");
      setEmail("");
      setTitle("");
      setDescription("");
      setSuggestionType("feature");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const upvoteMutation = trpc.suggestions.upvote.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Your vote has been recorded.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.length < 5) {
      toast.error("Please provide a title with at least 5 characters.");
      return;
    }

    if (description.length < 10) {
      toast.error("Please provide more details (at least 10 characters).");
      return;
    }

    createMutation.mutate({
      name: name || undefined,
      email: email || undefined,
      suggestionType,
      title,
      description,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return Lightbulb;
      case "bug":
        return Bug;
      case "improvement":
        return TrendingUp;
      case "content":
        return FileText;
      default:
        return Lightbulb;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />New</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Reviewing</Badge>;
      case "planned":
        return <Badge className="bg-purple-500"><CheckCircle2 className="h-3 w-3 mr-1" />Planned</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-500"><TrendingUp className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderSuggestionList = (suggestions: any[] | undefined) => {
    if (!suggestions || suggestions.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No suggestions yet. Be the first to contribute!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const Icon = getTypeIcon(suggestion.suggestionType);
          
          return (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" />
                      <Badge variant="outline">{suggestion.suggestionType}</Badge>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {suggestion.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => upvoteMutation.mutate({ suggestionId: suggestion.id })}
                    disabled={upvoteMutation.isPending}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {suggestion.upvotes}
                  </Button>
                </div>
              </CardHeader>
              {suggestion.adminNotes && (
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Admin Response:</p>
                    <p className="text-sm text-muted-foreground">{suggestion.adminNotes}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Feature Suggestions</h1>
          <p className="text-lg text-muted-foreground">
            Help us improve the Mechatronopolis! Share your ideas, report bugs, or suggest content additions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Suggestion</CardTitle>
                <CardDescription>Your feedback helps us improve</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={suggestionType} onValueChange={(value: any) => setSuggestionType(value)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="content">Content Suggestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief summary of your suggestion"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide details about your suggestion..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Suggestion"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="planned">Planned</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  renderSuggestionList(allSuggestions)
                )}
              </TabsContent>

              <TabsContent value="new" className="mt-6">
                {renderSuggestionList(allSuggestions?.filter(s => s.status === "new"))}
              </TabsContent>

              <TabsContent value="planned" className="mt-6">
                {renderSuggestionList(allSuggestions?.filter(s => s.status === "planned" || s.status === "in_progress"))}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {renderSuggestionList(allSuggestions?.filter(s => s.status === "completed"))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
