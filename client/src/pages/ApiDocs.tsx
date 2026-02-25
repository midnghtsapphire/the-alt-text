import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Code2, Copy, ArrowRight, Terminal, Zap, Shield, Key } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const codeExamples = {
  curl: `curl -X POST https://thealttext.com/api/v1/generate-alt-text \\
  -H "Authorization: Bearer tat_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/photo.jpg",
    "page_context": "Product page for running shoes"
  }'`,
  python: `import requests

response = requests.post(
    "https://thealttext.com/api/v1/generate-alt-text",
    headers={"Authorization": "Bearer tat_live_your_api_key"},
    json={
        "image_url": "https://example.com/photo.jpg",
        "page_context": "Product page for running shoes"
    }
)

data = response.json()
print(data["alt_text"])  # "Red Nike running shoes on white background"
print(data["confidence"])  # 95`,
  javascript: `const response = await fetch(
  "https://thealttext.com/api/v1/generate-alt-text",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer tat_live_your_api_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: "https://example.com/photo.jpg",
      page_context: "Product page for running shoes",
    }),
  }
);

const data = await response.json();
console.log(data.alt_text); // "Red Nike running shoes on white background"`,
  response: `{
  "alt_text": "Red Nike running shoes with white sole on clean background",
  "confidence": 95,
  "image_type": "photo",
  "wcag_compliance": "pass",
  "processing_time_ms": 1247,
  "model": "gemini-2.5-flash"
}`,
};

export default function ApiDocs() {
  const { user } = useAuth();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs mb-4">
              <Terminal className="w-3 h-3 text-primary" /> REST API v1
            </div>
            <h1 className="text-3xl font-bold mb-3">API Documentation</h1>
            <p className="text-muted-foreground max-w-2xl">
              Integrate AI-powered alt text generation into your applications. Available on Pro and Enterprise plans.
            </p>
            <div className="flex gap-3 mt-6">
              {user ? (
                <Link href="/api-keys"><Button><Key className="mr-2 h-4 w-4" /> Manage API Keys</Button></Link>
              ) : (
                <Button onClick={() => window.location.href = getLoginUrl()}>Get API Key <ArrowRight className="ml-2 h-4 w-4" /></Button>
              )}
            </div>
          </div>

          {/* Authentication */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Authentication</h2>
            <div className="glass-card p-5">
              <p className="text-sm text-muted-foreground mb-3">
                All API requests require a Bearer token in the Authorization header. Create API keys from your dashboard.
              </p>
              <code className="block p-3 rounded bg-muted/20 text-sm font-mono">
                Authorization: Bearer tat_live_your_api_key
              </code>
            </div>
          </section>

          {/* Endpoints */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Endpoints</h2>

            {/* Generate Alt Text */}
            <div className="glass-card p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-success-green/20 text-success-green">POST</span>
                <code className="text-sm font-mono">/api/v1/generate-alt-text</code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Generate WCAG-compliant alt text for a single image.</p>

              <h4 className="text-sm font-semibold mb-2">Request Body</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-2 pr-4 font-medium">Parameter</th>
                      <th className="text-left py-2 pr-4 font-medium">Type</th>
                      <th className="text-left py-2 pr-4 font-medium">Required</th>
                      <th className="text-left py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/20">
                      <td className="py-2 pr-4"><code>image_url</code></td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">Yes</td>
                      <td className="py-2">Public URL of the image to analyze</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-2 pr-4"><code>page_context</code></td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">No</td>
                      <td className="py-2">Context about the page where the image appears</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4"><code>surrounding_text</code></td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">No</td>
                      <td className="py-2">Text surrounding the image on the page</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bulk Generate */}
            <div className="glass-card p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-success-green/20 text-success-green">POST</span>
                <code className="text-sm font-mono">/api/v1/bulk-generate</code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Generate alt text for multiple images (max 50 per request).</p>

              <h4 className="text-sm font-semibold mb-2">Request Body</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-2 pr-4 font-medium">Parameter</th>
                      <th className="text-left py-2 pr-4 font-medium">Type</th>
                      <th className="text-left py-2 pr-4 font-medium">Required</th>
                      <th className="text-left py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/20">
                      <td className="py-2 pr-4"><code>image_urls</code></td>
                      <td className="py-2 pr-4">string[]</td>
                      <td className="py-2 pr-4">Yes</td>
                      <td className="py-2">Array of image URLs (max 50)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4"><code>page_context</code></td>
                      <td className="py-2 pr-4">string</td>
                      <td className="py-2 pr-4">No</td>
                      <td className="py-2">Shared context for all images</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Health */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">GET</span>
                <code className="text-sm font-mono">/api/v1/health</code>
              </div>
              <p className="text-sm text-muted-foreground">Check API status. No authentication required.</p>
            </div>
          </section>

          {/* Code Examples */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Code2 className="w-5 h-5 text-primary" /> Code Examples</h2>

            {[
              { label: "cURL", code: codeExamples.curl },
              { label: "Python", code: codeExamples.python },
              { label: "JavaScript", code: codeExamples.javascript },
              { label: "Response", code: codeExamples.response },
            ].map((ex) => (
              <div key={ex.label} className="glass-card mb-4 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span className="text-xs font-semibold">{ex.label}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(ex.code)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed">{ex.code}</pre>
              </div>
            ))}
          </section>

          {/* Rate Limits */}
          <section>
            <h2 className="text-xl font-bold mb-4">Rate Limits</h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4 font-medium">Plan</th>
                    <th className="text-left p-4 font-medium">Rate Limit</th>
                    <th className="text-left p-4 font-medium">Monthly Calls</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/20">
                    <td className="p-4">Pro</td>
                    <td className="p-4">60 req/min</td>
                    <td className="p-4">5,000</td>
                  </tr>
                  <tr>
                    <td className="p-4">Enterprise</td>
                    <td className="p-4">120 req/min</td>
                    <td className="p-4">50,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
