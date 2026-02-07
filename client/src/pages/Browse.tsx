import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Eye } from "lucide-react";

export default function Browse() {
  const params = useParams<{ topicSlug?: string }>();
  const { data: topics } = trpc.topics.list.useQuery();
  const { data: allQAItems } = trpc.qa.list.useQuery();
  
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  // Find topic by slug if provided in URL
  const urlTopic = useMemo(() => {
    if (!params.topicSlug || !topics) return null;
    return topics.find(t => t.slug === params.topicSlug);
  }, [params.topicSlug, topics]);

  // Set selected topic from URL
  useMemo(() => {
    if (urlTopic) {
      setSelectedTopicId(urlTopic.id);
    }
  }, [urlTopic]);

  // Filter Q&A items by selected topic
  const filteredQAItems = useMemo(() => {
    if (!allQAItems) return [];
    if (!selectedTopicId) return allQAItems;
    return allQAItems.filter(qa => qa.topicId === selectedTopicId);
  }, [allQAItems, selectedTopicId]);

  // Group Q&A items by topic for "All Topics" view
  const groupedQAItems = useMemo(() => {
    if (!allQAItems || !topics) return {};
    const grouped: Record<number, typeof allQAItems> = {};
    allQAItems.forEach(qa => {
      if (!grouped[qa.topicId]) {
        grouped[qa.topicId] = [];
      }
      grouped[qa.topicId].push(qa);
    });
    return grouped;
  }, [allQAItems, topics]);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Research</h1>
          <p className="text-lg text-muted-foreground">
            Explore comprehensive Q&A across all research topics
          </p>
        </div>

        <Tabs value={selectedTopicId?.toString() || "all"} onValueChange={(val) => setSelectedTopicId(val === "all" ? null : parseInt(val))}>
          <TabsList className="flex-wrap h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Topics
            </TabsTrigger>
            {topics?.map((topic) => (
              <TabsTrigger 
                key={topic.id} 
                value={topic.id.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {topic.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-8">
            {topics?.map((topic) => {
              const topicQAs = groupedQAItems[topic.id] || [];
              if (topicQAs.length === 0) return null;
              
              return (
                <div key={topic.id} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{topic.name}</h2>
                      <p className="text-muted-foreground">{topic.description}</p>
                    </div>
                    <Badge variant="secondary">{topicQAs.length} questions</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {topicQAs.map((qa) => (
                      <Link key={qa.id} href={`/qa/${qa.slug}`}>
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
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {topics?.map((topic) => (
            <TabsContent key={topic.id} value={topic.id.toString()} className="mt-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{topic.name}</h2>
                <p className="text-lg text-muted-foreground">{topic.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredQAItems.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No questions found for this topic.
                    </CardContent>
                  </Card>
                ) : (
                  filteredQAItems.map((qa) => (
                    <Link key={qa.id} href={`/qa/${qa.slug}`}>
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
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
