import { useState } from "react";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReceiptData {
  vendor: string;
  date: string;
  amount: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  category: string;
  confidence: number;
}

interface ReceiptUploadProps {
  onDataExtracted: (data: ReceiptData) => void;
}

export default function ReceiptUpload({ onDataExtracted }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = trpc.tax.uploadReceipt.useMutation();
  const extractMutation = trpc.tax.extractReceiptData.useMutation();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      toast.error("File size must be less than 16MB");
      return;
    }

    setError(null);
    setUploading(true);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      const imageData = base64.split(",")[1]; // Remove data:image/...;base64, prefix

      // Upload to S3
      const receipt = await uploadMutation.mutateAsync({
        imageData,
        fileName: file.name,
        mimeType: file.type,
      });

      toast.success("Receipt uploaded successfully");

      // Extract data using OCR
      setProcessing(true);
      const data = await extractMutation.mutateAsync({
        imageUrl: receipt.imageUrl,
      });

      setExtractedData(data);
      onDataExtracted(data);
      toast.success(`Receipt data extracted with ${Math.round(data.confidence * 100)}% confidence`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process receipt";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {!imagePreview ? (
        <Card
          className="border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("receipt-input")?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Upload Receipt</p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, WebP (max 16MB)
            </p>
            <input
              id="receipt-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="w-48 h-auto rounded border"
                />
                <div className="flex-1">
                  {uploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading receipt...</span>
                    </div>
                  )}
                  {processing && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Extracting data with AI...</span>
                    </div>
                  )}
                  {extractedData && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Data extracted successfully</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Vendor:</strong> {extractedData.vendor}</p>
                        <p><strong>Date:</strong> {extractedData.date}</p>
                        <p><strong>Amount:</strong> ${extractedData.amount.toFixed(2)}</p>
                        <p><strong>Category:</strong> {extractedData.category}</p>
                        <p><strong>Confidence:</strong> {Math.round(extractedData.confidence * 100)}%</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImagePreview(null);
                    setExtractedData(null);
                    setError(null);
                  }}
                >
                  Upload Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
