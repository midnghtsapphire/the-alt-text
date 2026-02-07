// OpenRouter API key is available as environment variable

interface VisionMessage {
  role: "user" | "system";
  content: Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
      detail?: "auto" | "low" | "high";
    };
  }>;
}

interface VisionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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

/**
 * Extract structured data from receipt images using OpenRouter vision API
 * @param imageUrl - URL to the receipt image (can be S3 URL or base64 data URL)
 * @returns Structured receipt data with vendor, date, amount, items
 */
export async function extractReceiptData(imageUrl: string): Promise<ReceiptData> {
  const messages: VisionMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Analyze this receipt image and extract the following information in JSON format:
{
  "vendor": "store/restaurant name",
  "date": "YYYY-MM-DD format",
  "amount": total amount as number,
  "items": [
    {
      "description": "item name",
      "quantity": number,
      "price": number
    }
  ],
  "category": "one of: meals, transportation, supplies, equipment, utilities, other",
  "confidence": confidence score 0-1
}

Be precise with numbers. If you can't extract something, use null. Return only valid JSON.`
        },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "high"
          }
        }
      ]
    }
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet", // Best vision model
      messages,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter vision API error: ${response.statusText}`);
  }

  const data: VisionResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from vision API");
  }

  try {
    const receiptData: ReceiptData = JSON.parse(content);
    return receiptData;
  } catch (error) {
    throw new Error(`Failed to parse receipt data: ${error}`);
  }
}

/**
 * Analyze receipt image and provide description
 * @param imageUrl - URL to the receipt image
 * @param prompt - Custom prompt for analysis
 * @returns Analysis text
 */
export async function analyzeReceiptImage(
  imageUrl: string,
  prompt: string = "Describe this receipt in detail"
): Promise<string> {
  const messages: VisionMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt
        },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "high"
          }
        }
      ]
    }
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter vision API error: ${response.statusText}`);
  }

  const data: VisionResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}
