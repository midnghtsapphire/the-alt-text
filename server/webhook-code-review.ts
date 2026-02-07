/**
 * GitHub Webhook Handler for Code Reviews
 * Receives PR events and triggers OZ multi-agent code review
 */

import { Request, Response } from "express";
import crypto from "crypto";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "your-webhook-secret";

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Call OpenRouter API for code review
 */
async function callOpenRouter(model: string, prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mechatronopolis.com",
      "X-Title": "Mechatronopolis Code Review",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer. Analyze the code for security issues, performance problems, best practices violations, and potential bugs. Provide specific, actionable feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Analyze code changes with multiple LLMs
 */
async function analyzeCodeChanges(files: any[]): Promise<{
  model: string;
  analysis: string;
}[]> {
  const models = [
    { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet" },
    { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen 2.5 Coder" },
  ];

  const filesContent = files
    .map(f => `### ${f.filename}\n\`\`\`${f.language || ''}\n${f.patch || f.content}\n\`\`\``)
    .join("\n\n");

  const prompt = `Review the following code changes from a Pull Request:

${filesContent}

Provide a comprehensive code review covering:
1. **Security Issues**: Any vulnerabilities or security concerns
2. **Performance**: Potential performance bottlenecks or inefficiencies
3. **Best Practices**: Violations of coding standards or best practices
4. **Type Safety**: TypeScript type issues or missing types
5. **Error Handling**: Missing error handling or improper error management
6. **Testing**: Missing tests or inadequate test coverage
7. **Suggestions**: Specific improvements with code examples

Format your response as a structured review with clear sections.`;

  const results = await Promise.all(
    models.map(async (model) => {
      try {
        const analysis = await callOpenRouter(model.id, prompt);
        return {
          model: model.name,
          analysis,
        };
      } catch (error) {
        console.error(`Error analyzing with ${model.name}:`, error);
        return {
          model: model.name,
          analysis: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    })
  );

  return results;
}

/**
 * Post review comment to GitHub PR
 */
async function postGitHubComment(
  repoOwner: string,
  repoName: string,
  prNumber: number,
  comment: string,
  githubToken?: string
): Promise<void> {
  if (!githubToken) {
    console.log("GitHub token not configured, skipping comment posting");
    return;
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${prNumber}/comments`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      "Accept": "application/vnd.github.v3+json",
    },
    body: JSON.stringify({ body: comment }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
}

/**
 * Format multi-LLM review results as GitHub comment
 */
function formatReviewComment(results: { model: string; analysis: string }[]): string {
  let comment = `## 🤖 OZ Multi-Agent Code Review\n\n`;
  comment += `*Automated review by Mechatronopolis OZ System using ${results.length} AI models*\n\n`;
  comment += `---\n\n`;

  results.forEach((result, index) => {
    comment += `### ${result.model}\n\n`;
    comment += `${result.analysis}\n\n`;
    if (index < results.length - 1) {
      comment += `---\n\n`;
    }
  });

  comment += `\n---\n\n`;
  comment += `*💡 This review was generated automatically. Please verify all suggestions before implementing.*`;

  return comment;
}

/**
 * Main webhook handler
 */
export async function handleCodeReviewWebhook(req: Request, res: Response) {
  try {
    // Verify GitHub signature
    const signature = req.headers["x-hub-signature-256"] as string;
    const payload = JSON.stringify(req.body);

    if (!verifyGitHubSignature(payload, signature)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Check event type
    const event = req.headers["x-github-event"] as string;
    if (event !== "pull_request") {
      return res.status(200).json({ message: "Event ignored" });
    }

    // Extract PR data
    const { action, pull_request, repository } = req.body;

    // Only process opened and synchronize (new commits) events
    if (action !== "opened" && action !== "synchronize") {
      return res.status(200).json({ message: "Action ignored" });
    }

    const prNumber = pull_request.number;
    const repoOwner = repository.owner.login;
    const repoName = repository.name;
    const prUrl = pull_request.html_url;

    console.log(`Processing PR #${prNumber} from ${repoOwner}/${repoName}`);

    // Get PR files
    const filesUrl = pull_request.url + "/files";
    const filesResponse = await fetch(filesUrl, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
      },
    });

    if (!filesResponse.ok) {
      throw new Error("Failed to fetch PR files");
    }

    const files = await filesResponse.json();

    // Filter to only review code files
    const codeFiles = files.filter((f: any) => 
      f.filename.match(/\.(ts|tsx|js|jsx)$/) && 
      !f.filename.includes("node_modules") &&
      !f.filename.includes(".test.")
    );

    if (codeFiles.length === 0) {
      return res.status(200).json({ message: "No code files to review" });
    }

    // Analyze code changes with multiple LLMs
    const reviewResults = await analyzeCodeChanges(codeFiles);

    // Format and post comment
    const comment = formatReviewComment(reviewResults);
    const githubToken = process.env.GITHUB_TOKEN;

    await postGitHubComment(repoOwner, repoName, prNumber, comment, githubToken);

    console.log(`Review posted to PR #${prNumber}`);

    return res.status(200).json({
      success: true,
      message: "Code review completed",
      prNumber,
      prUrl,
      modelsUsed: reviewResults.map(r => r.model),
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
