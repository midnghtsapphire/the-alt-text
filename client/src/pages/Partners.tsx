import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, DollarSign, CheckCircle2, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Partner {
  name: string;
  description: string;
  url: string;
  affiliateUrl?: string;
  commission?: string;
  isFree?: boolean;
  category: string;
  priority?: "high" | "medium" | "low";
}

const partners: Partner[] = [
  // Security & Compliance
  { name: "KnowBe4", description: "Security awareness training & phishing simulation", url: "https://www.knowbe4.com", affiliateUrl: "https://www.knowbe4.com/partners", commission: "Contact", category: "Security", priority: "high" },
  { name: "Curricula", description: "Security training platform", url: "https://www.getcurricula.com", commission: "Contact", category: "Security", priority: "high" },
  { name: "PhishLabs", description: "Phishing simulation & threat intelligence", url: "https://www.phishlabs.com", commission: "Contact", category: "Security" },
  { name: "Bitdefender", description: "Enterprise endpoint protection", url: "https://www.bitdefender.com/", affiliateUrl: "https://www.bitdefender.com/partners/", commission: "20-30%", category: "Security", priority: "medium" },
  { name: "NordVPN", description: "Secure VPN service", url: "https://nordvpn.com/", affiliateUrl: "https://nordvpn.com/affiliate/", commission: "30-40%", category: "Security", priority: "high" },
  { name: "Wazuh", description: "Open-source SIEM", url: "https://wazuh.com/", isFree: true, category: "Security" },
  { name: "Nmap", description: "Network security auditing", url: "https://nmap.org/", isFree: true, category: "Security" },

  // Training Providers
  { name: "Coursera", description: "Online courses & degrees", url: "https://www.coursera.org", affiliateUrl: "https://www.coursera.org/affiliate", commission: "Up to 45%", category: "Training", priority: "high" },
  { name: "Udemy", description: "Online course marketplace", url: "https://www.udemy.com", affiliateUrl: "https://www.udemy.com/affiliate/", commission: "Up to 15%", category: "Training", priority: "high" },
  { name: "AWS Training", description: "Cloud computing training", url: "https://aws.amazon.com/training", affiliateUrl: "https://aws.amazon.com/partners/", commission: "Varies", category: "Training", priority: "medium" },
  { name: "SME", description: "Manufacturing training & certification", url: "https://www.sme.org", commission: "Contact", category: "Training", priority: "high" },
  { name: "Siemens Training", description: "Industrial automation training (MSCP)", url: "https://www.siemens.com", commission: "Contact", category: "Training", priority: "high" },
  { name: "FAME USA", description: "Advanced manufacturing apprenticeships", url: "https://fame-usa.com", commission: "Contact", category: "Training", priority: "high" },
  { name: "Maricopa Community Colleges", description: "MAST program, cleanroom training (AZ)", url: "https://www.maricopa.edu", commission: "Referral", category: "Training" },
  { name: "Columbus State CC", description: "Semiconductor training (OH)", url: "https://www.cscc.edu", commission: "Referral", category: "Training" },
  { name: "SUNY Onondaga CC", description: "Cleanroom technician training (NY)", url: "https://www.sunyocc.edu", commission: "Referral", category: "Training" },
  { name: "SUNY Polytechnic", description: "Advanced semiconductor training (NY)", url: "https://sunypoly.edu", commission: "Referral", category: "Training" },
  { name: "Tokyo Electron Training", description: "VR-based semiconductor equipment training", url: "https://www.tel.com", commission: "Contact", category: "Training" },

  // Certifications
  { name: "NIMS", description: "Manufacturing certifications", url: "https://www.nims-skills.org", commission: "Contact", category: "Certifications", priority: "high" },
  { name: "CMfgA", description: "Entry-level manufacturing certification", url: "https://www.msscusa.org", commission: "Contact", category: "Certifications" },
  { name: "ASQ", description: "Quality certifications (Six Sigma, CQE)", url: "https://asq.org", commission: "Contact", category: "Certifications" },
  { name: "AWS Welding", description: "Welding certifications", url: "https://www.aws.org", commission: "Contact", category: "Certifications" },
  { name: "PMI", description: "Project management certifications", url: "https://www.pmi.org", affiliateUrl: "https://www.pmi.org/partnerships", commission: "Contact", category: "Certifications" },

  // Manufacturers & Equipment
  { name: "TSMC", description: "Semiconductor manufacturing", url: "https://www.tsmc.com", commission: "Recruitment", category: "Manufacturers" },
  { name: "ASML", description: "Lithography equipment", url: "https://www.asml.com", commission: "Recruitment", category: "Manufacturers" },
  { name: "Samsung Semiconductor", description: "Semiconductor manufacturing", url: "https://www.samsung.com/us/sas", commission: "Recruitment", category: "Manufacturers" },
  { name: "Texas Instruments", description: "Semiconductor manufacturing", url: "https://careers.ti.com", commission: "Recruitment", category: "Manufacturers" },
  { name: "Autodesk", description: "CAD/CAM software (Fusion 360, Inventor)", url: "https://www.autodesk.com", affiliateUrl: "https://www.autodesk.com/partners", commission: "Varies", category: "Manufacturers" },
  { name: "SolidWorks", description: "3D CAD software", url: "https://www.solidworks.com", commission: "Contact", category: "Manufacturers" },
  { name: "Mastercam", description: "CAM software", url: "https://www.mastercam.com", commission: "Contact", category: "Manufacturers" },
  { name: "Haas Automation", description: "CNC machines & training", url: "https://www.haascnc.com", commission: "Contact", category: "Manufacturers" },
  { name: "Mazak", description: "CNC machines & training", url: "https://www.mazakusa.com", commission: "Contact", category: "Manufacturers" },

  // Payment & Business
  { name: "Stripe", description: "Payment processing", url: "https://stripe.com/", affiliateUrl: "https://stripe.com/partners", commission: "Varies", category: "Business", priority: "medium" },
  { name: "QuickBooks", description: "Accounting software", url: "https://quickbooks.intuit.com", affiliateUrl: "https://quickbooks.intuit.com/partners/", commission: "$200/sale", category: "Business", priority: "high" },
  { name: "FreshBooks", description: "Accounting & invoicing", url: "https://www.freshbooks.com", affiliateUrl: "https://www.freshbooks.com/affiliates", commission: "$200/sale", category: "Business", priority: "high" },
  { name: "Gusto", description: "Payroll & HR software", url: "https://gusto.com", affiliateUrl: "https://gusto.com/partners", commission: "$300/customer", category: "Business", priority: "high" },
  { name: "Shopify", description: "E-commerce platform", url: "https://www.shopify.com", affiliateUrl: "https://www.shopify.com/affiliates", commission: "$2,000/sale", category: "Business", priority: "high" },

  // AI & Tech
  { name: "OpenRouter", description: "Unified AI API", url: "https://openrouter.ai/", commission: "Contact", category: "Technology", isFree: true },
  { name: "GitHub", description: "Code hosting & collaboration", url: "https://github.com", affiliateUrl: "https://partner.github.com", commission: "Varies", category: "Technology" },
  { name: "Notion", description: "Productivity & documentation", url: "https://www.notion.so", affiliateUrl: "https://www.notion.so/affiliates", commission: "$50/signup", category: "Technology", priority: "medium" },
  { name: "Figma", description: "Design & prototyping", url: "https://www.figma.com", commission: "Contact", category: "Technology" },
  { name: "Miro", description: "Visual collaboration", url: "https://miro.com", affiliateUrl: "https://miro.com/partners/", commission: "30%", category: "Technology", priority: "high" },

  // Industry Organizations
  { name: "U.S. Apprenticeship", description: "Federal apprenticeship directory", url: "https://www.apprenticeship.gov", isFree: true, category: "Organizations" },
  { name: "NTMA", description: "National Tooling & Machining Association", url: "https://www.ntma.org", commission: "Contact", category: "Organizations" },
  { name: "AMT", description: "Manufacturing technology association", url: "https://www.amtonline.org", commission: "Contact", category: "Organizations" },
  { name: "NAM", description: "National Association of Manufacturers", url: "https://www.nam.org", commission: "Contact", category: "Organizations" },
  { name: "SEMI", description: "Semiconductor industry association", url: "https://www.semi.org", commission: "Contact", category: "Organizations" },

  // Recruitment
  { name: "Indeed", description: "Job board", url: "https://www.indeed.com", affiliateUrl: "https://www.indeed.com/hire/c/info/affiliate-program", commission: "Varies", category: "Recruitment" },
  { name: "LinkedIn Talent", description: "Professional recruiting", url: "https://business.linkedin.com/talent-solutions", commission: "Contact", category: "Recruitment" },
  { name: "ZipRecruiter", description: "Job board", url: "https://www.ziprecruiter.com", affiliateUrl: "https://www.ziprecruiter.com/affiliates", commission: "$20/click", category: "Recruitment" },
  { name: "Monster", description: "Job board", url: "https://www.monster.com", commission: "Contact", category: "Recruitment" },
  { name: "CareerBuilder", description: "Job board", url: "https://www.careerbuilder.com", commission: "Contact", category: "Recruitment" },
];

export default function Partners() {
  const categories = Array.from(new Set(partners.map(p => p.category)));
  const highPriorityPartners = partners.filter(p => p.priority === "high");

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Affiliate Partners Directory</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            52+ trusted partners across training, certification, security, and business tools
          </p>
          <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm">
              <strong>Affiliate Disclosure:</strong> Some links are affiliate links. We may earn a commission at no additional cost to you when you sign up through our referral links. This helps us maintain and improve Mechatronopolis.
            </p>
          </div>
        </div>

        {/* High Priority Partners */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold">High-Value Opportunities</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Top commission rates and high-value partnerships ($200-$2,000 per sale or 30-45% commission)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highPriorityPartners.map((partner) => (
              <Card key={partner.name} className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    <Badge variant="default" className="bg-green-600">High Value</Badge>
                  </div>
                  <CardDescription>{partner.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {partner.commission && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{partner.commission}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(partner.url, "_blank")}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                    {partner.affiliateUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(partner.affiliateUrl, "_blank")}
                      >
                        Join Program
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Partners by Category */}
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => {
            const categoryPartners = partners.filter(p => p.category === category);
            return (
              <TabsContent key={category} value={category} className="mt-6">
                <h2 className="text-2xl font-bold mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryPartners.map((partner) => (
                    <Card key={partner.name}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                          {partner.isFree && <Badge variant="secondary">Free</Badge>}
                          {partner.priority === "high" && <Badge variant="default" className="bg-green-600">High Value</Badge>}
                        </div>
                        <CardDescription>{partner.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {partner.commission && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{partner.commission}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(partner.url, "_blank")}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </Button>
                          {partner.affiliateUrl && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => window.open(partner.affiliateUrl, "_blank")}
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Setup Instructions */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-xl font-bold mb-4">How to Get Started</h3>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Visit the affiliate program page for each partner (click "Join Program" button)</li>
            <li>Sign up for their affiliate/partner program</li>
            <li>Get your affiliate ID, tracking code, and commission details</li>
            <li>Add credentials to <a href="/affiliate-credentials" className="text-primary underline">/affiliate-credentials</a> page</li>
            <li>Start earning commissions when users sign up through your links</li>
          </ol>
          <div className="mt-4">
            <Button onClick={() => window.location.href = "/affiliate-credentials"}>
              Manage Affiliate Credentials
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
