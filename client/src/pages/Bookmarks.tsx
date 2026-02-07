import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Bookmark, ChevronRight, Eye } from "lucide-react";

export default function Bookmarks() {
  const { isAuthenticated } = useAuth();
  const { data: bookmarks, isLoading } = trpc.bookmarks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please login to view your bookmarked questions
              </p>
              <Button asChild>
                <a href={getLoginUrl()}>Login</a>
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
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Bookmarks</h1>
          <p className="text-lg text-muted-foreground">
            Questions and answers you've saved for quick access
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {bookmarks.map((qa) => (
              <Link key={qa.id} href={`/qa/${qa.slug}`}>
                <a>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-snug mb-2">
                            {qa.question}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {qa.answer.substring(0, 200)}...
                          </CardDescription>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {qa.viewCount} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark className="h-4 w-4 fill-current" />
                          Bookmarked
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Bookmarks Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start bookmarking questions to save them for quick access
              </p>
              <Link href="/browse">
                <Button>
                  Browse Questions
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
