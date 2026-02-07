import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link2, Plus, Save, Trash2, ExternalLink, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const PARTNER_TYPES = [
  { value: "security_training", label: "Security Training" },
  { value: "phishing_simulation", label: "Phishing Simulation" },
  { value: "compliance_platform", label: "Compliance Platform" },
  { value: "training_provider", label: "Training Provider" },
  { value: "certification_body", label: "Certification Body" },
  { value: "software_vendor", label: "Software Vendor" },
  { value: "apprenticeship_program", label: "Apprenticeship Program" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "grant_provider", label: "Grant Provider" },
  { value: "industry_org", label: "Industry Organization" },
];

const SUGGESTED_PARTNERS = [
  { name: "KnowBe4", type: "security_training", website: "https://www.knowbe4.com" },
  { name: "Curricula", type: "security_training", website: "https://www.getcurricula.com" },
  { name: "PhishLabs", type: "phishing_simulation", website: "https://www.phishlabs.com" },
  { name: "FAME USA", type: "apprenticeship_program", website: "https://fame-usa.com" },
  { name: "SME", type: "training_provider", website: "https://www.sme.org" },
  { name: "Siemens", type: "training_provider", website: "https://www.siemens.com" },
  { name: "NIMS", type: "certification_body", website: "https://www.nims-skills.org" },
  { name: "AWS Training", type: "training_provider", website: "https://aws.amazon.com/training" },
  { name: "Coursera", type: "training_provider", website: "https://www.coursera.org" },
  { name: "Udemy", type: "training_provider", website: "https://www.udemy.com" },
];

export default function AffiliateCredentials() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    partnerType: "",
    companyName: "",
    website: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
    commissionRate: "",
    notes: "",
  });

  const { data: partners, isLoading, refetch } = trpc.headhunter.partners.list.useQuery();

  const createPartner = trpc.headhunter.partners.create.useMutation({
    onSuccess: () => {
      toast.success("Partner added successfully!");
      refetch();
      setShowAddForm(false);
      setFormData({
        partnerType: "",
        companyName: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
        description: "",
        commissionRate: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to add partner: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.partnerType || !formData.companyName) {
      toast.error("Partner type and company name are required");
      return;
    }

    createPartner.mutate({
      partnerType: formData.partnerType as any,
      companyName: formData.companyName,
      website: formData.website || undefined,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      description: formData.description || undefined,
      commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const fillSuggestedPartner = (partner: typeof SUGGESTED_PARTNERS[0]) => {
    setFormData({
      ...formData,
      partnerType: partner.type,
      companyName: partner.name,
      website: partner.website,
    });
    setShowAddForm(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-card/30 py-12">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Badge className="mb-4 text-base px-4 py-2 bg-gradient-to-r from-primary to-accent text-white border-0">
              <Link2 className="h-4 w-4 mr-2 inline" />
              Affiliate Management
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Affiliate Credentials & Partners</h1>
            <p className="text-xl text-muted-foreground">
              Manage affiliate partnerships for all training tools, security platforms, and career resources.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Partners</p>
                    <p className="text-3xl font-bold text-primary">{partners?.length || 0}</p>
                  </div>
                  <Link2 className="h-10 w-10 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Commission</p>
                    <p className="text-3xl font-bold text-accent">
                      {partners && partners.length > 0
                        ? `${(partners.reduce((sum, p) => sum + (parseFloat(p.commissionRate || "0")), 0) / partners.length).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-accent opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Partnerships</p>
                    <p className="text-3xl font-bold text-primary">
                      {partners?.filter(p => p.partnershipStatus === "active").length || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggested Partners */}
          {!showAddForm && (
            <Card className="mb-8 border-2 border-accent/20">
              <CardHeader>
                <CardTitle>Suggested Partners to Add</CardTitle>
                <CardDescription>
                  Quick-add popular security, training, and certification platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SUGGESTED_PARTNERS.map((partner) => (
                    <button
                      key={partner.name}
                      onClick={() => fillSuggestedPartner(partner)}
                      className="p-4 rounded-lg border-2 border-border hover:border-primary transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {partner.name}
                        </h3>
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {PARTNER_TYPES.find(t => t.value === partner.type)?.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Partner Form */}
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              className="mb-8 bg-gradient-to-r from-primary to-accent"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Custom Partner
            </Button>
          ) : (
            <Card className="mb-8 border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Add New Partner</CardTitle>
                <CardDescription>
                  Enter affiliate credentials and partnership details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partnerType">Partner Type *</Label>
                    <Select
                      value={formData.partnerType}
                      onValueChange={(value) => setFormData({ ...formData, partnerType: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select partner type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTNER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g., KnowBe4"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.01"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                      placeholder="e.g., 25.00"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="partner@example.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the partner and their services..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Affiliate Notes (Tracking IDs, API Keys, etc.)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Affiliate ID: ABC123&#10;Tracking Code: XYZ789&#10;API Key: ..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={createPartner.isPending}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createPartner.isPending ? "Saving..." : "Save Partner"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={createPartner.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Partners List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Current Partners</h2>
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Loading partners...
                </CardContent>
              </Card>
            ) : partners && partners.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {partners.map((partner) => (
                  <Card key={partner.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{partner.companyName}</h3>
                            <Badge variant="outline">
                              {PARTNER_TYPES.find(t => t.value === partner.partnerType)?.label}
                            </Badge>
                            <Badge
                              variant={partner.partnershipStatus === "active" ? "default" : "secondary"}
                            >
                              {partner.partnershipStatus}
                            </Badge>
                          </div>
                          {partner.description && (
                            <p className="text-sm text-muted-foreground mb-3">{partner.description}</p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {partner.website && (
                              <div>
                                <span className="text-muted-foreground">Website:</span>{" "}
                                <a
                                  href={partner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  Visit <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                            {partner.contactEmail && (
                              <div>
                                <span className="text-muted-foreground">Email:</span>{" "}
                                <a href={`mailto:${partner.contactEmail}`} className="text-primary hover:underline">
                                  {partner.contactEmail}
                                </a>
                              </div>
                            )}
                            {partner.commissionRate && (
                              <div>
                                <span className="text-muted-foreground">Commission:</span>{" "}
                                <span className="font-semibold text-accent">{partner.commissionRate}%</span>
                              </div>
                            )}
                          </div>
                          {partner.notes && (
                            <details className="mt-3">
                              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                                View Affiliate Details
                              </summary>
                              <pre className="mt-2 p-3 bg-muted rounded text-xs whitespace-pre-wrap">
                                {partner.notes}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No partners added yet</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Partner
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
