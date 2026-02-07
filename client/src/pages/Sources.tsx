import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sources() {
  const { data: sources, isLoading } = trpc.sources.list.useQuery();

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Research Sources</h1>
          <p className="text-lg text-muted-foreground">
            This research is based on 238 industry sources covering semiconductor manufacturing, 
            workforce development, and strategic industry analysis
          </p>
        </div>

        <Card className="mb-8 bg-muted/30">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Source Attribution</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All research presented on this platform is compiled from publicly available sources including 
                  government reports, industry publications, academic papers, and official company documentation. 
                  The insights and analysis represent a comprehensive review of the U.S. Tool and Die industry 
                  landscape as of 2026.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="h-4 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sources && sources.length > 0 ? (
          <div>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {sources.length} source{sources.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <Card key={source.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <span className="text-sm font-semibold text-muted-foreground flex-shrink-0 mt-0.5">
                        [{index + 1}]
                      </span>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{source.citation}</p>
                        {source.url && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2"
                            asChild
                          >
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Source
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No sources available at this time.
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <h3 className="font-semibold text-lg mb-2">Citation Guidelines</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When citing information from this research platform, please reference: 
              "Mechatronopolis - Interdisciplinary Engineering Hub (2026). Based on analysis of 238 industry sources."
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
