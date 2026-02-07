import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, ExternalLink, MapPin, Search, DollarSign, Clock } from "lucide-react";

export default function Employers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");

  const { data: locations } = trpc.nomad.locations.useQuery();
  const { data: jobs, isLoading } = trpc.jobs.search.useQuery({
    locationId: selectedLocation !== "all" ? parseInt(selectedLocation) : undefined,
    experienceLevel: selectedExperience !== "all" ? selectedExperience : undefined,
    jobType: selectedJobType !== "all" ? selectedJobType : undefined,
    searchTerm: searchTerm || undefined,
  });

  const { data: employers } = trpc.employers.list.useQuery();

  const getEmployerForJob = (employerId: number) => {
    return employers?.find(e => e.id === employerId);
  };

  const getLocationForJob = (locationId: number) => {
    return locations?.find(l => l.id === locationId);
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Competitive";
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return "Competitive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Employer Directory</h1>
          <p className="text-lg text-gray-600">
            Explore tool & die job openings from top employers across the United States
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.city}, {loc.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Experience Level Filter */}
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>

              {/* Job Type Filter */}
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? "Loading..." : `${jobs?.length || 0} job openings found`}
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {jobs?.map((job) => {
            const employer = getEmployerForJob(job.employerId);
            const location = getLocationForJob(job.locationId);

            return (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{job.jobTitle}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-4 text-base">
                        {employer && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {employer.companyName}
                          </span>
                        )}
                        {location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {location.city}, {location.state}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={job.jobType === "apprenticeship" ? "default" : "secondary"}>
                        {job.jobType}
                      </Badge>
                      <Badge variant="outline">{job.experienceLevel}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                  
                  {job.requirements && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Requirements:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{job.requirements}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {employer?.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={employer.website} target="_blank" rel="noopener noreferrer">
                            <Building2 className="h-4 w-4 mr-2" />
                            Company Site
                          </a>
                        </Button>
                      )}
                      {job.applyUrl && (
                        <Button size="sm" asChild>
                          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apply Now
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!isLoading && jobs?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLocation("all");
                    setSelectedExperience("all");
                    setSelectedJobType("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Relocate?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Use our Nomad Opportunity Map to explore cities, compare costs, and track your relocation progress
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/nomad">
                  <MapPin className="h-5 w-5 mr-2" />
                  Explore Cities
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30" asChild>
                <Link href="/my-progress">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Track Progress
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
