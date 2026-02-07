import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, GraduationCap, Award, Building2, BookOpen, Sparkles } from "lucide-react";

const categoryIcons: Record<string, any> = {
  training: GraduationCap,
  certification: Award,
  government: Building2,
  free_learning: BookOpen,
  other: Sparkles,
};

const categoryLabels: Record<string, string> = {
  training: "Training Programs",
  certification: "Certifications",
  government: "Government Programs",
  free_learning: "Free Learning Resources",
  other: "Other Resources",
};

export default function Resources() {
  const { data: resources, isLoading } = trpc.resources.list.useQuery();

  const categories = ["training", "certification", "government", "free_learning", "other"];
  
  const resourcesByCategory = categories.reduce((acc, category) => {
    acc[category] = resources?.filter(r => r.category === category) || [];
    return acc;
  }, {} as Record<string, typeof resources>);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Resources Directory</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive directory of training programs, certifications, and learning resources
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex-wrap h-auto gap-2 bg-muted/50 p-2 mb-8">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Resources
            </TabsTrigger>
            {categories.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {categoryLabels[category]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="space-y-8">
                {categories.map((category) => (
                  <div key={category} className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i}>
                          <CardHeader>
                            <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                            <div className="h-4 bg-muted rounded w-full" />
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((category) => {
                  const categoryResources = resourcesByCategory[category];
                  if (!categoryResources || categoryResources.length === 0) return null;

                  const Icon = categoryIcons[category];
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">{categoryLabels[category]}</h2>
                        <Badge variant="secondary">{categoryResources.length}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryResources.map((resource) => (
                          <Card key={resource.id} className="hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-start justify-between gap-2">
                                <span>{resource.name}</span>
                                {resource.url && (
                                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                                )}
                              </CardTitle>
                              <CardDescription className="leading-relaxed">
                                {resource.description}
                              </CardDescription>
                            </CardHeader>
                            {resource.url && (
                              <CardContent>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                    Visit Resource
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const categoryResources = resourcesByCategory[category];
            
            return (
              <TabsContent key={category} value={category}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold">{categoryLabels[category]}</h2>
                  </div>
                  <p className="text-muted-foreground">
                    {category === "training" && "Comprehensive training programs and apprenticeships for manufacturing careers"}
                    {category === "certification" && "Industry-recognized certifications to validate your skills and advance your career"}
                    {category === "government" && "Federal and state programs supporting workforce development"}
                    {category === "free_learning" && "Free and low-cost resources for self-paced learning"}
                    {category === "other" && "Additional resources and tools for manufacturing professionals"}
                  </p>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-4 bg-muted rounded w-full" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : categoryResources && categoryResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryResources.map((resource) => (
                      <Card key={resource.id} className="hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start justify-between gap-2">
                            <span>{resource.name}</span>
                            {resource.url && (
                              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                            )}
                          </CardTitle>
                          <CardDescription className="leading-relaxed">
                            {resource.description}
                          </CardDescription>
                        </CardHeader>
                        {resource.url && (
                          <CardContent>
                            <Button variant="outline" size="sm" asChild className="w-full">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                                Visit Resource
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No resources found in this category.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </Layout>
  );
}
