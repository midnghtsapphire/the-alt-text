import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, TrendingUp, DollarSign, Home, Briefcase, ArrowRight, Filter, BarChart3 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons based on opportunity score
const getMarkerIcon = (opportunityScore: number) => {
  const color = opportunityScore >= 90 ? "#10b981" : // green
                opportunityScore >= 80 ? "#3b82f6" : // blue
                opportunityScore >= 70 ? "#f59e0b" : // yellow
                "#ef4444"; // red
  
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${opportunityScore}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 5);
  return null;
}

export default function Nomad() {
  const { data: locations, isLoading } = trpc.nomad.locations.useQuery();
  const [selectedDemand, setSelectedDemand] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Center of US

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    
    return locations.filter(loc => {
      const demandMatch = selectedDemand === "all" || loc.demandLevel === selectedDemand;
      const regionMatch = selectedRegion === "all" || loc.region === selectedRegion;
      return demandMatch && regionMatch;
    });
  }, [locations, selectedDemand, selectedRegion]);

  const regions = useMemo(() => {
    if (!locations) return [];
    return Array.from(new Set(locations.map(loc => loc.region).filter(Boolean)));
  }, [locations]);

  const getDemandBadgeVariant = (level: string) => {
    switch (level) {
      case "very_high": return "default";
      case "high": return "secondary";
      case "medium": return "outline";
      default: return "outline";
    }
  };

  const getDemandLabel = (level: string) => {
    return level.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading opportunity map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nomad Opportunity Map
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-6">
              Discover the best locations for tool & die professionals. Get step-by-step relocation guides, 
              cost analysis, and job probability calculations to make informed decisions about your career move.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#map">
                <Button size="lg" variant="secondary">
                  <MapPin className="mr-2 h-5 w-5" />
                  Explore Map
                </Button>
              </Link>
              <Link href="/nomad/compare">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Compare Cities
                </Button>
              </Link>
              <Link href="#calculator">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Calculate Your Chances
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <Tabs defaultValue="map" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="map">Interactive Map</TabsTrigger>
            <TabsTrigger value="list">City List</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Opportunities
              </CardTitle>
              <CardDescription>
                Narrow down locations by demand level and region
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Demand Level</label>
                <Select value={selectedDemand} onValueChange={setSelectedDemand}>
                  <SelectTrigger>
                    <SelectValue placeholder="All demand levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Demand Levels</SelectItem>
                    <SelectItem value="very_high">Very High</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region || ""}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedDemand("all");
                    setSelectedRegion("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="map" id="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Zones Map</CardTitle>
                <CardDescription>
                  Click on markers to view city details. Marker color indicates opportunity score: 
                  <span className="inline-flex items-center gap-2 ml-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> 90+
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-2"></span> 80-89
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 ml-2"></span> 70-79
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-2"></span> &lt;70
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-lg overflow-hidden border">
                  <MapContainer
                    center={mapCenter}
                    zoom={5}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController center={mapCenter} />
                    {filteredLocations.map(location => {
                      const lat = parseFloat(location.latitude || "0");
                      const lng = parseFloat(location.longitude || "0");
                      if (!lat || !lng) return null;

                      return (
                        <Marker
                          key={location.id}
                          position={[lat, lng]}
                          icon={getMarkerIcon(location.opportunityScore)}
                        >
                          <Popup>
                            <div className="p-2 min-w-[250px]">
                              <h3 className="font-bold text-lg mb-2">{location.city}, {location.state}</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Opportunity Score:</span>
                                  <span className="font-semibold">{location.opportunityScore}/100</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Demand:</span>
                                  <Badge variant={getDemandBadgeVariant(location.demandLevel)}>
                                    {getDemandLabel(location.demandLevel)}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avg Salary:</span>
                                  <span className="font-semibold">${location.averageSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Job Openings:</span>
                                  <span className="font-semibold">{location.jobOpenings}</span>
                                </div>
                                <Link href={`/nomad/${location.slug}`}>
                                  <Button size="sm" className="w-full mt-2">
                                    View Details
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredLocations.map(location => {
                const employers = location.majorEmployers ? JSON.parse(location.majorEmployers) : [];
                
                return (
                  <Card key={location.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">{location.city}, {location.state}</CardTitle>
                          <CardDescription className="mt-1">{location.region}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">{location.opportunityScore}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{location.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">${location.averageSalary?.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Avg Salary</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">${location.medianRent?.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Median Rent</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{location.jobOpenings}</div>
                            <div className="text-xs text-muted-foreground">Job Openings</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <Badge variant={getDemandBadgeVariant(location.demandLevel)}>
                              {getDemandLabel(location.demandLevel)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {employers.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Major Employers:</div>
                          <div className="flex flex-wrap gap-1">
                            {employers.slice(0, 3).map((employer: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {employer}
                              </Badge>
                            ))}
                            {employers.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{employers.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Link href={`/nomad/${location.slug}`}>
                        <Button className="w-full">
                          View Full Details & Relocation Guide
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4 mt-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredLocations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Cities tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Opportunity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredLocations.length > 0 
                  ? Math.round(filteredLocations.reduce((sum, loc) => sum + loc.opportunityScore, 0) / filteredLocations.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Job Openings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredLocations.reduce((sum, loc) => sum + (loc.jobOpenings || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all cities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${filteredLocations.length > 0 
                  ? Math.round(filteredLocations.reduce((sum, loc) => sum + (loc.averageSalary || 0), 0) / filteredLocations.length).toLocaleString()
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Annual average</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
