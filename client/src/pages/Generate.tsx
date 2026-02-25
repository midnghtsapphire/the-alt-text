import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import {
  Eye, Upload, Link2, CheckCircle2, Copy, Download, ArrowRight,
  Loader2, AlertTriangle, Image as ImageIcon
} from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function Generate() {
  const { user, loading } = useAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [pageContext, setPageContext] = useState("");
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const generateMutation = trpc.alttext.generate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Alt text generated successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleGenerate = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    setPreviewUrl(imageUrl);
    setResult(null);
    generateMutation.mutate({
      imageUrl: imageUrl.trim(),
      pageContext: pageContext.trim() || undefined,
    });
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    // Convert to data URL for preview and processing
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 pb-20 container text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to generate alt text</h1>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>Sign In <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-20 container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Generate Alt Text</h1>
          <p className="text-muted-foreground mb-8">Upload an image or paste a URL to generate WCAG-compliant alt text.</p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Image Source
              </h2>

              {/* URL Input */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">Image URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl.startsWith("data:") ? "(uploaded file)" : imageUrl}
                      onChange={(e) => { setImageUrl(e.target.value); setPreviewUrl(""); }}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">Or upload a file</label>
                <label className="glass-card p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload or drag & drop</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Context */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-1.5 block">Page Context <span className="text-muted-foreground">(optional)</span></label>
                <Textarea
                  placeholder="Describe the page where this image appears (e.g., 'Product page for running shoes')"
                  value={pageContext}
                  onChange={(e) => setPageContext(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !imageUrl.trim()}
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Image...</>
                ) : (
                  <><Eye className="mr-2 h-4 w-4" /> Generate Alt Text</>
                )}
              </Button>
            </div>

            {/* Result Panel */}
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">Result</h2>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mb-4 rounded-lg overflow-hidden bg-muted/20 aspect-video flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    onError={() => setPreviewUrl("")}
                  />
                </div>
              )}

              {generateMutation.isPending && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">AI is analyzing your image...</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Alt Text */}
                  <div className="p-4 rounded-lg bg-success-green/5 border border-success-green/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />
                        <span className="text-sm font-semibold">Generated Alt Text</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(result.altText)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed">{result.altText}</p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                      <div className="font-semibold">{result.confidence}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-xs text-muted-foreground mb-1">Image Type</div>
                      <div className="font-semibold capitalize">{result.imageType}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-xs text-muted-foreground mb-1">WCAG Status</div>
                      <div className={`font-semibold capitalize ${
                        result.wcagCompliance === "pass" ? "text-success-green" :
                        result.wcagCompliance === "warning" ? "text-warning-amber" : "text-destructive"
                      }`}>{result.wcagCompliance}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-xs text-muted-foreground mb-1">Processing Time</div>
                      <div className="font-semibold">{result.processingTimeMs}ms</div>
                    </div>
                  </div>

                  {/* HTML snippet */}
                  <div className="p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">HTML Snippet</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`<img src="${imageUrl}" alt="${result.altText}" />`)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground break-all block">
                      {`<img src="..." alt="${result.altText}" />`}
                    </code>
                  </div>
                </div>
              )}

              {!result && !generateMutation.isPending && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Eye className="w-10 h-10 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">Upload an image or paste a URL to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
