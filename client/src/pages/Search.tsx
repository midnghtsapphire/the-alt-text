import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>(undefined);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: topics } = trpc.topics.list.useQuery();
  const { data: searchResults, isLoading } = trpc.qa.search.useQuery(
    { query: debouncedQuery, topicId: selectedTopicId },
    { enabled: debouncedQuery.length >= 2 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedTopicId(undefined);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-accent/30 text-accent-foreground">{part}</mark>
        : part
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Search Research</h1>
            <p className="text-lg text-muted-foreground">
              Search across all questions and answers
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search questions and answers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" disabled={searchQuery.length < 2}>
                    Search
                  </Button>
                  {debouncedQuery && (
                    <Button type="button" variant="outline" onClick={clearSearch}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Filter by topic:</label>
                  <Select
                    value={selectedTopicId?.toString() || "all"}
                    onValueChange={(val) => setSelectedTopicId(val === "all" ? undefined : parseInt(val))}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics?.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id.toString()}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {debouncedQuery.length >= 2 && (
            <div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-4">
                    {searchResults.map((qa) => (
                      <Link key={qa.id} href={`/qa/${qa.slug}`}>
                        <a>
                          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                            <CardHeader>
                              <CardTitle className="text-lg leading-snug">
                                {highlightText(qa.question, debouncedQuery)}
                              </CardTitle>
                              <CardDescription className="line-clamp-3">
                                {highlightText(qa.answer.substring(0, 250), debouncedQuery)}...
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No results found for "{debouncedQuery}"
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try different keywords or browse all topics
                    </p>
                    <Link href="/browse">
                      <Button variant="outline" className="mt-4">
                        Browse All Topics
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Initial State */}
          {!debouncedQuery && (
            <Card>
              <CardContent className="py-12 text-center">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Enter at least 2 characters to search
                </p>
                <p className="text-sm text-muted-foreground">
                  Search across all questions and answers in the research database
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
