import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bookmark, BookmarkCheck, Share2, Eye, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Badge } from "@/components/ui/badge";

export default function QADetail() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const { data: qaItem, isLoading } = trpc.qa.bySlug.useQuery({ slug: params.slug || "" });
  const { data: topic } = trpc.topics.bySlug.useQuery(
    { slug: "" }, 
    { enabled: false }
  );
  const { data: relatedQuestions } = trpc.qa.related.useQuery(
    { qaItemId: qaItem?.id || 0 },
    { enabled: !!qaItem?.id }
  );
  const { data: isBookmarked, refetch: refetchBookmark } = trpc.bookmarks.isBookmarked.useQuery(
    { qaItemId: qaItem?.id || 0 },
    { enabled: isAuthenticated && !!qaItem?.id }
  );

  const addBookmarkMutation = trpc.bookmarks.add.useMutation();
  const removeBookmarkMutation = trpc.bookmarks.remove.useMutation();

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to bookmark questions");
      return;
    }

    if (!qaItem) return;

    try {
      if (isBookmarked) {
        await removeBookmarkMutation.mutateAsync({ qaItemId: qaItem.id });
        toast.success("Bookmark removed");
      } else {
        await addBookmarkMutation.mutateAsync({ qaItemId: qaItem.id });
        toast.success("Bookmarked successfully");
      }
      refetchBookmark();
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-1/4 mb-8" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!qaItem) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Question Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The question you're looking for doesn't exist.
              </p>
              <Button onClick={() => setLocation("/browse")}>
                Browse All Questions
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => setLocation("/browse")} className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>

          {/* Main Q&A Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight flex-1">
                  {qaItem.question}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {qaItem.viewCount} views
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  className="gap-2"
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      Bookmark
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose-elegant max-w-none">
                <Streamdown>{qaItem.answer}</Streamdown>
              </div>
            </CardContent>
          </Card>

          {/* Related Questions */}
          {relatedQuestions && relatedQuestions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Related Questions</h2>
              <div className="grid grid-cols-1 gap-4">
                {relatedQuestions.map((related) => (
                  <Link key={related.id} href={`/qa/${related.slug}`}>
                    <a>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg leading-snug">
                            {related.question}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {related.answer.substring(0, 150)}...
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
