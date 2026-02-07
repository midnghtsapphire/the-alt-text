import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";

type AssessmentStep = 1 | 2 | 3 | 4 | 5 | 6;

interface AssessmentConfig {
  organizationName: string;
  assessmentType: "vulnerability_scan" | "risk_assessment" | "compliance_check" | "penetration_test" | "security_audit";
  complianceFrameworks: string[];
  domain: string;
}

export default function SecurityAssessment() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(1);
  const [config, setConfig] = useState<AssessmentConfig>({
    organizationName: "",
    assessmentType: "vulnerability_scan",
    complianceFrameworks: [],
    domain: "",
  });
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const frameworks = trpc.security.getComplianceFrameworks.useQuery();
  const runScan = trpc.security.runSecurityScan.useMutation();

  const steps = [
    { number: 1, title: "Organization Info", description: "Tell us about your organization" },
    { number: 2, title: "Assessment Type", description: "Choose what to assess" },
    { number: 3, title: "Compliance Frameworks", description: "Select standards to check" },
    { number: 4, title: "System Details", description: "Enter domain or IP" },
    { number: 5, title: "Review & Confirm", description: "Verify your settings" },
    { number: 6, title: "Results", description: "View your assessment" },
  ];

  const assessmentTypes = [
    {
      id: "vulnerability_scan",
      title: "Vulnerability Scan",
      description: "Identify security weaknesses in your systems",
      icon: Shield,
    },
    {
      id: "risk_assessment",
      title: "Risk Assessment",
      description: "Evaluate overall security posture and risks",
      icon: AlertTriangle,
    },
    {
      id: "compliance_check",
      title: "Compliance Check",
      description: "Verify adherence to industry standards",
      icon: CheckCircle2,
    },
  ];

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as AssessmentStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as AssessmentStep);
    }
  };

  const handleRunScan = async () => {
    try {
      const result = await runScan.mutateAsync({
        domain: config.domain,
        scanVulnerabilities: true,
        checkCompliance: config.complianceFrameworks,
      });
      setAssessmentResult(result);
      handleNext();
      toast.success("Security assessment completed!");
    } catch (error) {
      toast.error("Failed to run security assessment");
    }
  };

  const progress = (currentStep / 6) * 100;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Assessment Wizard</h1>
        <p className="text-muted-foreground">
          Follow this guided process to assess your organization's security posture
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                step.number === currentStep ? "text-primary" : step.number < currentStep ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                  step.number === currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : step.number < currentStep
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-muted"
                }`}
              >
                {step.number < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.number}
              </div>
              <span className="text-xs font-medium hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Organization Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This information helps us tailor the assessment to your organization's needs. All data is kept confidential.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Enter your organization name"
                  value={config.organizationName}
                  onChange={(e) => setConfig({ ...config, organizationName: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Assessment Type */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Choose the type of security assessment that best fits your needs. You can run multiple assessments later.
                </AlertDescription>
              </Alert>
              <RadioGroup
                value={config.assessmentType}
                onValueChange={(value) =>
                  setConfig({ ...config, assessmentType: value as AssessmentConfig["assessmentType"] })
                }
              >
                {assessmentTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-colors ${
                      config.assessmentType === type.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setConfig({ ...config, assessmentType: type.id as AssessmentConfig["assessmentType"] })}
                  >
                    <CardContent className="flex items-start space-x-4 p-4">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <div className="flex-1">
                        <Label htmlFor={type.id} className="text-base font-semibold cursor-pointer flex items-center gap-2">
                          <type.icon className="w-5 h-5" />
                          {type.title}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Compliance Frameworks */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select compliance frameworks to check against. Each framework has specific security controls and requirements.
                </AlertDescription>
              </Alert>

              {/* Acronym Glossary */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Framework Glossary</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <p><strong>NIST:</strong> National Institute of Standards and Technology - U.S. government cybersecurity framework</p>
                  <p><strong>ISO 27001:</strong> International Organization for Standardization - Global information security standard</p>
                  <p><strong>SOC 2:</strong> Service Organization Control - Trust services criteria for SaaS companies</p>
                  <p><strong>HIPAA:</strong> Health Insurance Portability and Accountability Act - Healthcare data protection</p>
                  <p><strong>PCI-DSS:</strong> Payment Card Industry Data Security Standard - Credit card data security</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {frameworks.data?.map((framework) => (
                  <Card key={framework.id} className="cursor-pointer hover:border-primary/50">
                    <CardContent className="flex items-start space-x-3 p-4">
                      <Checkbox
                        id={framework.id}
                        checked={config.complianceFrameworks.includes(framework.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setConfig({
                              ...config,
                              complianceFrameworks: [...config.complianceFrameworks, framework.id],
                            });
                          } else {
                            setConfig({
                              ...config,
                              complianceFrameworks: config.complianceFrameworks.filter((f) => f !== framework.id),
                            });
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={framework.id} className="text-base font-semibold cursor-pointer">
                          {framework.name}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{framework.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {framework.controlCount} controls
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: System Details */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Enter the domain name or IP address of the system you want to assess. We'll scan for vulnerabilities and security issues.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain or IP Address</Label>
                <Input
                  id="domain"
                  placeholder="example.com or 192.168.1.1"
                  value={config.domain}
                  onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Make sure you have permission to scan this system. Unauthorized scanning may be illegal.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Review your settings before running the assessment. This may take a few minutes depending on the scope.
                </AlertDescription>
              </Alert>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <span className="text-sm font-medium">Organization:</span>
                    <p className="text-muted-foreground">{config.organizationName || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Assessment Type:</span>
                    <p className="text-muted-foreground capitalize">{config.assessmentType.replace("_", " ")}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Compliance Frameworks:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {config.complianceFrameworks.length > 0 ? (
                        config.complianceFrameworks.map((fw) => (
                          <Badge key={fw} variant="secondary">
                            {fw}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">None selected</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Target System:</span>
                    <p className="text-muted-foreground">{config.domain}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Results */}
          {currentStep === 6 && assessmentResult && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">Overall Security Score</h3>
                      <p className="text-muted-foreground">Based on vulnerabilities and compliance</p>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold">{assessmentResult.overallScore}</div>
                      <Badge
                        variant={
                          assessmentResult.riskLevel === "low"
                            ? "default"
                            : assessmentResult.riskLevel === "medium"
                            ? "secondary"
                            : "destructive"
                        }
                        className="mt-2"
                      >
                        {assessmentResult.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerabilities */}
              {assessmentResult.vulnerabilities && assessmentResult.vulnerabilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vulnerabilities Found</CardTitle>
                    <CardDescription>{assessmentResult.vulnerabilities.length} security issues detected</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assessmentResult.vulnerabilities.map((vuln: any) => (
                      <Card key={vuln.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{vuln.title}</h4>
                            <Badge
                              variant={
                                vuln.severity === "critical" || vuln.severity === "high"
                                  ? "destructive"
                                  : vuln.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {vuln.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-medium mb-1">Recommendation:</p>
                            <p className="text-sm">{vuln.recommendation}</p>
                          </div>
                          {vuln.cveId && (
                            <Button variant="link" size="sm" className="mt-2 px-0" asChild>
                              <a href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vuln.cveId}`} target="_blank" rel="noopener noreferrer">
                                View CVE Details <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Compliance Results */}
              {assessmentResult.compliance && assessmentResult.compliance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Results</CardTitle>
                    <CardDescription>Framework adherence scores</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assessmentResult.compliance.map((comp: any) => (
                      <div key={comp.framework}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{comp.framework}</h4>
                          <Badge variant={comp.score >= 80 ? "default" : comp.score >= 60 ? "secondary" : "destructive"}>
                            {comp.score}% Compliant
                          </Badge>
                        </div>
                        <Progress value={comp.score} className="h-2 mb-2" />
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {comp.passedControls} passed
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-600" />
                            {comp.failedControls} failed
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {assessmentResult.recommendations && assessmentResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Prioritized action items to improve security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessmentResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button onClick={() => window.location.reload()}>Run Another Assessment</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStep < 6 && (
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {currentStep === 5 ? (
            <Button onClick={handleRunScan} disabled={runScan.isPending || !config.domain}>
              {runScan.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Assessment...
                </>
              ) : (
                <>
                  Run Assessment
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
