import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, Circle, DollarSign } from "lucide-react";
import { useState } from "react";

interface Partner {
  id: number;
  name: string;
  url: string;
  type: string;
  affiliateUrl?: string;
  commission?: string;
  category: string;
}

const partners: Partner[] = [
  // Security & Compliance (10)
  { id: 1, name: "KnowBe4", url: "https://www.knowbe4.com", type: "Security awareness training & phishing simulation", affiliateUrl: "https://www.knowbe4.com/partners", commission: "Contact for rates", category: "Security & Compliance" },
  { id: 2, name: "Curricula", url: "https://www.getcurricula.com", type: "Security training platform", commission: "TBD", category: "Security & Compliance" },
  { id: 3, name: "PhishLabs", url: "https://www.phishlabs.com", type: "Phishing simulation & threat intelligence", commission: "TBD", category: "Security & Compliance" },
  { id: 4, name: "Bitdefender", url: "https://www.bitdefender.com", type: "Enterprise endpoint protection", affiliateUrl: "https://www.bitdefender.com/partners/", commission: "20-30%", category: "Security & Compliance" },
  { id: 5, name: "NordVPN", url: "https://nordvpn.com", type: "Secure VPN service", affiliateUrl: "https://nordvpn.com/affiliate/", commission: "30-40%", category: "Security & Compliance" },
  { id: 6, name: "Wazuh", url: "https://wazuh.com", type: "Open-source SIEM", commission: "Free tool", category: "Security & Compliance" },
  { id: 7, name: "Nmap", url: "https://nmap.org", type: "Network security auditing", commission: "Free tool", category: "Security & Compliance" },
  
  // Training Providers (15+)
  { id: 8, name: "Coursera", url: "https://www.coursera.org", type: "Online courses & degrees", affiliateUrl: "https://www.coursera.org/affiliate", commission: "Up to 45%", category: "Training Providers" },
  { id: 9, name: "Udemy", url: "https://www.udemy.com", type: "Online course marketplace", affiliateUrl: "https://www.udemy.com/affiliate/", commission: "Up to 15%", category: "Training Providers" },
  { id: 10, name: "AWS Training", url: "https://aws.amazon.com/training", type: "Cloud computing training", affiliateUrl: "https://aws.amazon.com/partners/", commission: "Varies", category: "Training Providers" },
  { id: 11, name: "SME", url: "https://www.sme.org", type: "Manufacturing training & certification", commission: "TBD", category: "Training Providers" },
  { id: 12, name: "Siemens Training", url: "https://www.siemens.com", type: "Industrial automation training (MSCP)", commission: "TBD", category: "Training Providers" },
  { id: 13, name: "FAME USA", url: "https://fame-usa.com", type: "Advanced manufacturing apprenticeships", commission: "TBD", category: "Training Providers" },
  { id: 14, name: "Maricopa Community Colleges", url: "https://www.maricopa.edu", type: "MAST program, cleanroom training", commission: "Referral program", category: "Training Providers" },
  { id: 15, name: "Columbus State Community College", url: "https://www.cscc.edu", type: "Semiconductor training", commission: "Referral program", category: "Training Providers" },
  { id: 16, name: "SUNY Onondaga Community College", url: "https://www.sunyocc.edu", type: "Cleanroom technician training", commission: "Referral program", category: "Training Providers" },
  { id: 17, name: "SUNY Polytechnic Institute", url: "https://sunypoly.edu", type: "Advanced semiconductor training", commission: "Referral program", category: "Training Providers" },
  { id: 18, name: "Tokyo Electron Training Center", url: "https://www.tel.com", type: "VR-based semiconductor equipment training", commission: "TBD", category: "Training Providers" },
  
  // Certification Bodies (5)
  { id: 19, name: "NIMS", url: "https://www.nims-skills.org", type: "Manufacturing certifications", commission: "TBD", category: "Certification Bodies" },
  { id: 20, name: "CMfgA", url: "https://www.msscusa.org", type: "Entry-level manufacturing certification", commission: "TBD", category: "Certification Bodies" },
  { id: 21, name: "ASQ", url: "https://asq.org", type: "Quality certifications (Six Sigma, CQE)", commission: "TBD", category: "Certification Bodies" },
  { id: 22, name: "AWS (Welding)", url: "https://www.aws.org", type: "Welding certifications", commission: "TBD", category: "Certification Bodies" },
  { id: 23, name: "PMI", url: "https://www.pmi.org", type: "Project management certifications", affiliateUrl: "https://www.pmi.org/partnerships", commission: "TBD", category: "Certification Bodies" },
  
  // Manufacturers & Equipment (10+)
  { id: 24, name: "TSMC", url: "https://www.tsmc.com", type: "Semiconductor manufacturing", commission: "Recruitment referral", category: "Manufacturers & Equipment" },
  { id: 25, name: "ASML", url: "https://www.asml.com", type: "Lithography equipment", commission: "Recruitment referral", category: "Manufacturers & Equipment" },
  { id: 26, name: "Samsung Semiconductor", url: "https://www.samsung.com/us/sas", type: "Semiconductor manufacturing", commission: "Recruitment referral", category: "Manufacturers & Equipment" },
  { id: 27, name: "Texas Instruments", url: "https://careers.ti.com", type: "Semiconductor manufacturing", commission: "Recruitment referral", category: "Manufacturers & Equipment" },
  { id: 28, name: "Autodesk", url: "https://www.autodesk.com", type: "CAD/CAM software (Fusion 360, Inventor)", affiliateUrl: "https://www.autodesk.com/partners", commission: "Varies", category: "Manufacturers & Equipment" },
  { id: 29, name: "SolidWorks", url: "https://www.solidworks.com", type: "3D CAD software", commission: "TBD", category: "Manufacturers & Equipment" },
  { id: 30, name: "Mastercam", url: "https://www.mastercam.com", type: "CAM software", commission: "TBD", category: "Manufacturers & Equipment" },
  { id: 31, name: "Haas Automation", url: "https://www.haascnc.com", type: "CNC machines & training", commission: "TBD", category: "Manufacturers & Equipment" },
  { id: 32, name: "Mazak", url: "https://www.mazakusa.com", type: "CNC machines & training", commission: "TBD", category: "Manufacturers & Equipment" },
  
  // Payment & Business Tools (5)
  { id: 33, name: "Stripe", url: "https://stripe.com", type: "Payment processing", affiliateUrl: "https://stripe.com/partners", commission: "Varies", category: "Payment & Business Tools" },
  { id: 34, name: "QuickBooks", url: "https://quickbooks.intuit.com", type: "Accounting software", affiliateUrl: "https://quickbooks.intuit.com/partners/", commission: "Up to $200/sale", category: "Payment & Business Tools" },
  { id: 35, name: "FreshBooks", url: "https://www.freshbooks.com", type: "Accounting & invoicing", affiliateUrl: "https://www.freshbooks.com/affiliates", commission: "Up to $200/sale", category: "Payment & Business Tools" },
  { id: 36, name: "Gusto", url: "https://gusto.com", type: "Payroll & HR software", affiliateUrl: "https://gusto.com/partners", commission: "$300/customer", category: "Payment & Business Tools" },
  { id: 37, name: "Shopify", url: "https://www.shopify.com", type: "E-commerce platform", affiliateUrl: "https://www.shopify.com/affiliates", commission: "Up to $2,000/sale", category: "Payment & Business Tools" },
  
  // AI & Technology (5)
  { id: 38, name: "OpenRouter", url: "https://openrouter.ai", type: "Unified AI API", commission: "TBD", category: "AI & Technology" },
  { id: 39, name: "GitHub", url: "https://github.com", type: "Code hosting & collaboration", affiliateUrl: "https://partner.github.com", commission: "Varies", category: "AI & Technology" },
  { id: 40, name: "Notion", url: "https://www.notion.so", type: "Productivity & documentation", affiliateUrl: "https://www.notion.so/affiliates", commission: "Up to $50/signup", category: "AI & Technology" },
  { id: 41, name: "Figma", url: "https://www.figma.com", type: "Design & prototyping", commission: "TBD", category: "AI & Technology" },
  { id: 42, name: "Miro", url: "https://miro.com", type: "Visual collaboration", affiliateUrl: "https://miro.com/partners/", commission: "30%", category: "AI & Technology" },
  
  // Industry Organizations (5)
  { id: 43, name: "U.S. Apprenticeship Program", url: "https://www.apprenticeship.gov", type: "Federal apprenticeship directory", commission: "Link only", category: "Industry Organizations" },
  { id: 44, name: "NTMA", url: "https://www.ntma.org", type: "Industry association", commission: "TBD", category: "Industry Organizations" },
  { id: 45, name: "AMT", url: "https://www.amtonline.org", type: "Manufacturing technology association", commission: "TBD", category: "Industry Organizations" },
  { id: 46, name: "NAM", url: "https://www.nam.org", type: "Manufacturing advocacy", commission: "TBD", category: "Industry Organizations" },
  { id: 47, name: "SEMI", url: "https://www.semi.org", type: "Semiconductor industry association", commission: "TBD", category: "Industry Organizations" },
  
  // Recruitment & Job Boards (5+)
  { id: 48, name: "Indeed", url: "https://www.indeed.com", type: "Job board", affiliateUrl: "https://www.indeed.com/hire/c/info/affiliate-program", commission: "Varies", category: "Recruitment & Job Boards" },
  { id: 49, name: "LinkedIn Talent Solutions", url: "https://business.linkedin.com/talent-solutions", type: "Professional recruiting", commission: "TBD", category: "Recruitment & Job Boards" },
  { id: 50, name: "ZipRecruiter", url: "https://www.ziprecruiter.com", type: "Job board", affiliateUrl: "https://www.ziprecruiter.com/affiliates", commission: "Up to $20/click", category: "Recruitment & Job Boards" },
  { id: 51, name: "Monster", url: "https://www.monster.com", type: "Job board", commission: "TBD", category: "Recruitment & Job Boards" },
  { id: 52, name: "CareerBuilder", url: "https://www.careerbuilder.com", type: "Job board", commission: "TBD", category: "Recruitment & Job Boards" },
];

export default function AffiliateChecklist() {
  const [checkedPartners, setCheckedPartners] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(partners.map(p => p.category)))];
  
  const filteredPartners = selectedCategory === "All" 
    ? partners 
    : partners.filter(p => p.category === selectedCategory);

  const togglePartner = (id: number) => {
    const newChecked = new Set(checkedPartners);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedPartners(newChecked);
  };

  const completionRate = Math.round((checkedPartners.size / partners.length) * 100);

  return (
    <Layout>
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Complete Affiliate Partners Checklist</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Systematically set up all 52+ affiliate partnerships. Check off each partner as you complete their credential setup.
          </p>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl">{partners.length}</CardTitle>
                <CardDescription>Total Partners</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl text-green-500">{checkedPartners.size}</CardTitle>
                <CardDescription>Completed</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl text-orange-500">{partners.length - checkedPartners.size}</CardTitle>
                <CardDescription>Remaining</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl text-primary">{completionRate}%</CardTitle>
                <CardDescription>Progress</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                {cat !== "All" && ` (${partners.filter(p => p.category === cat).length})`}
              </Button>
            ))}
          </div>
        </div>

        {/* Partners List */}
        <div className="space-y-3">
          {filteredPartners.map(partner => {
            const isChecked = checkedPartners.has(partner.id);
            const isHighValue = partner.commission?.includes("$") && (
              partner.commission.includes("200") || 
              partner.commission.includes("300") || 
              partner.commission.includes("2,000")
            );
            const isHighCommission = partner.commission?.includes("%") && (
              partner.commission.includes("30") || 
              partner.commission.includes("40") || 
              partner.commission.includes("45")
            );

            return (
              <Card 
                key={partner.id} 
                className={`transition-all hover:border-primary/50 ${isChecked ? 'bg-green-500/5 border-green-500/30' : ''}`}
              >
                <CardHeader className="py-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => togglePartner(partner.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-mono text-muted-foreground">#{partner.id}</span>
                        <Badge variant="outline">{partner.category}</Badge>
                        {isHighValue && (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <DollarSign className="h-3 w-3 mr-1" />
                            High Value
                          </Badge>
                        )}
                        {isHighCommission && (
                          <Badge className="bg-purple-500 hover:bg-purple-600">
                            High Commission
                          </Badge>
                        )}
                        {partner.commission && (
                          <Badge variant="secondary">{partner.commission}</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{partner.type}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={partner.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Website
                          </a>
                        </Button>
                        {partner.affiliateUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={partner.affiliateUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Affiliate Program
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {isChecked && (
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>After checking off partners, complete these actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">1. Visit <code className="bg-muted px-2 py-1 rounded">/affiliate-credentials</code> to add partner details</p>
            <p className="text-sm">2. Sign up for each affiliate program and get your tracking codes</p>
            <p className="text-sm">3. Add affiliate IDs and commission rates to the database</p>
            <p className="text-sm">4. Build automated affiliate link generator for Career Highway</p>
            <p className="text-sm">5. Set up performance dashboard to track clicks and conversions</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
