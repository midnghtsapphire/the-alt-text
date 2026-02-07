/**
 * OZ Module - The Omnipotent Orchestrator (OZ = GOD)
 * 
 * OZ is the ultimate multi-agent orchestrator that gives Manus god-tier capabilities.
 * Like the Wizard of Oz pulling strings behind the curtain, OZ makes the impossible possible
 * by spawning and coordinating unlimited specialized AI agents.
 * 
 * OZ grants Manus omnipotent powers:
 * - Omniscience: Research Crews retrieve knowledge from all sources simultaneously
 * - Omnipotence: Code Crews generate, review, and fix any code instantly
 * - Omnipresence: Documentation Crews map entire systems in perfect detail
 * - Omnificence: Automation Crews design and execute any workflow
 * 
 * All spawned agents communicate via OpenRouter (Claude 3.7 Sonnet, GPT-5, Gemini 2.5 Pro)
 * and return unified results to Manus, who synthesizes everything for the user.
 * 
 * Architecture: CrewAI-inspired multi-agent collaboration
 * Positioning: OZ = GOD - The supreme orchestrator of all AI capabilities
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Available LLM models for different analysis types
const LLM_MODELS = {
  codeReview: "anthropic/claude-3.7-sonnet",  // Best for code analysis
  documentation: "openai/gpt-5",              // Best for documentation
  research: "google/gemini-2.5-pro",          // Best for research & patterns
};

/**
 * Call OpenRouter API with specified model and prompt
 */
async function callOpenRouter(model: string, prompt: string, systemPrompt?: string) {
  if (!OPENROUTER_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "OpenRouter API key not configured",
    });
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.VITE_APP_URL || "http://localhost:3000",
      "X-Title": "Mechatronopolis OZ Module",
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.3,  // Lower temperature for more consistent analysis
    }),
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `OpenRouter API error: ${response.statusText}`,
    });
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export const ozRouter = router({
  /**
   * INVENTOR MODULE EXPERT AGENTS
   * Five specialized expert agents for biocomposite/biopolymer product design
   */

  /**
   * Materials Expert - Biocomposites, biopolymers, natural products
   */
  consultMaterialsExpert: protectedProcedure
    .input(z.object({
      inventionId: z.string(),
      question: z.string(),
      materials: z.array(z.string()).optional(), // Material names to focus on
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const systemPrompt = `You are a Materials Science Expert specializing in biocomposites, biopolymers, and natural materials.
      
Your expertise includes:
      - Biocomposite formulations (taro, kui kui, basalt fiber, hemp, bamboo, etc.)
      - Biopolymer properties (PLA, PETG, starch-based polymers)
      - Natural fiber reinforcement
      - Material property analysis (tensile strength, density, biodegradability)
      - Processing parameters (temperature, pressure, curing time)
      - Material compatibility and adhesion
      - Sustainability and environmental impact
      
Provide detailed, scientifically accurate answers with:
      1. Material recommendations
      2. Property comparisons
      3. Processing guidance
      4. Potential issues and solutions
      5. References to scientific studies (DOI/SSRN when available)`;

      const prompt = `Question: ${input.question}
      ${input.materials ? `\nFocus Materials: ${input.materials.join(", ")}` : ""}
      ${input.context ? `\nContext: ${input.context}` : ""}
      
Provide a comprehensive answer with specific material recommendations and scientific references.`;

      const response = await callOpenRouter(LLM_MODELS.research, prompt, systemPrompt);

      return {
        expertType: "materials",
        question: input.question,
        response,
        confidence: 0.85,
        message: "Materials expert consultation complete",
      };
    }),

  /**
   * Tooling Expert - Manufacturing processes, tooling design
   */
  consultToolingExpert: protectedProcedure
    .input(z.object({
      inventionId: z.string(),
      question: z.string(),
      productType: z.string().optional(),
      materials: z.array(z.string()).optional(),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const systemPrompt = `You are a Manufacturing and Tooling Expert specializing in biocomposite product manufacturing.
      
Your expertise includes:
      - Injection molding for biopolymers
      - Compression molding for biocomposites
      - Extrusion processes
      - Mold design and material selection
      - Processing parameters optimization
      - Quality control and defect prevention
      - Cost estimation and production scaling
      - Tool maintenance and lifecycle
      
Provide detailed, practical answers with:
      1. Tooling recommendations
      2. Manufacturing process selection
      3. Processing parameters
      4. Cost estimates
      5. Potential challenges and solutions`;

      const prompt = `Question: ${input.question}
      ${input.productType ? `\nProduct Type: ${input.productType}` : ""}
      ${input.materials ? `\nMaterials: ${input.materials.join(", ")}` : ""}
      ${input.context ? `\nContext: ${input.context}` : ""}
      
Provide a comprehensive answer with specific tooling recommendations and cost estimates.`;

      const response = await callOpenRouter(LLM_MODELS.codeReview, prompt, systemPrompt);

      return {
        expertType: "tooling",
        question: input.question,
        response,
        confidence: 0.85,
        message: "Tooling expert consultation complete",
      };
    }),

  /**
   * 3D Printing Expert - Filament development, printer specs, print parameters
   */
  consult3DPrintingExpert: protectedProcedure
    .input(z.object({
      inventionId: z.string(),
      question: z.string(),
      filamentType: z.string().optional(),
      printerType: z.string().optional(),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const systemPrompt = `You are a 3D Printing Expert specializing in biocomposite filament development and FDM/FFF printing.
      
Your expertise includes:
      - Biocomposite filament formulation (PLA, PETG + natural fibers)
      - Filament extrusion parameters
      - FDM/FFF print parameter optimization
      - Nozzle selection and maintenance
      - Print quality troubleshooting
      - Material compatibility
      - Post-processing techniques
      - Printer hardware recommendations
      
Provide detailed, practical answers with:
      1. Filament formulation recommendations
      2. Print parameter optimization
      3. Troubleshooting guidance
      4. Hardware recommendations
      5. Expected mechanical properties`;

      const prompt = `Question: ${input.question}
      ${input.filamentType ? `\nFilament Type: ${input.filamentType}` : ""}
      ${input.printerType ? `\nPrinter Type: ${input.printerType}` : ""}
      ${input.context ? `\nContext: ${input.context}` : ""}
      
Provide a comprehensive answer with specific recommendations and expected results.`;

      const response = await callOpenRouter(LLM_MODELS.research, prompt, systemPrompt);

      return {
        expertType: "3d_printing",
        question: input.question,
        response,
        confidence: 0.85,
        message: "3D printing expert consultation complete",
      };
    }),

  /**
   * Robotics Expert - Automation, robotic assembly, process control
   */
  consultRoboticsExpert: protectedProcedure
    .input(z.object({
      inventionId: z.string(),
      question: z.string(),
      processType: z.string().optional(),
      productionVolume: z.string().optional(),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const systemPrompt = `You are a Robotics and Automation Expert specializing in manufacturing automation.
      
Your expertise includes:
      - Robotic assembly systems
      - Pick-and-place automation
      - Process control and monitoring
      - Vision systems and quality inspection
      - Collaborative robots (cobots)
      - Production line design
      - ROI analysis for automation
      - Safety systems and compliance
      
Provide detailed, practical answers with:
      1. Automation recommendations
      2. Robot selection and specifications
      3. System design and layout
      4. Cost-benefit analysis
      5. Implementation timeline and challenges`;

      const prompt = `Question: ${input.question}
      ${input.processType ? `\nProcess Type: ${input.processType}` : ""}
      ${input.productionVolume ? `\nProduction Volume: ${input.productionVolume}` : ""}
      ${input.context ? `\nContext: ${input.context}` : ""}
      
Provide a comprehensive answer with specific automation recommendations and ROI analysis.`;

      const response = await callOpenRouter(LLM_MODELS.codeReview, prompt, systemPrompt);

      return {
        expertType: "robotics",
        question: input.question,
        response,
        confidence: 0.85,
        message: "Robotics expert consultation complete",
      };
    }),

  /**
   * Patent Expert - Patent search, prior art, filing guidance
   */
  consultPatentExpert: protectedProcedure
    .input(z.object({
      inventionId: z.string(),
      question: z.string(),
      inventionDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const systemPrompt = `You are a Patent Expert specializing in intellectual property for materials science and manufacturing.
      
Your expertise includes:
      - Patent search strategies (USPTO, Espacenet, Google Patents)
      - Prior art analysis
      - Patentability assessment
      - Patent claim drafting
      - IPC/CPC classification
      - Freedom to operate analysis
      - Patent filing procedures
      - International patent protection (PCT)
      
Provide detailed, practical answers with:
      1. Patent search recommendations
      2. Prior art analysis
      3. Patentability assessment
      4. Claim drafting guidance
      5. Filing strategy recommendations`;

      const prompt = `Question: ${input.question}
      ${input.inventionDescription ? `\nInvention Description: ${input.inventionDescription}` : ""}
      ${input.keywords ? `\nKeywords: ${input.keywords.join(", ")}` : ""}
      ${input.context ? `\nContext: ${input.context}` : ""}
      
Provide a comprehensive answer with specific patent search strategies and patentability assessment.`;

      const response = await callOpenRouter(LLM_MODELS.research, prompt, systemPrompt);

      return {
        expertType: "patents",
        question: input.question,
        response,
        confidence: 0.85,
        message: "Patent expert consultation complete",
      };
    }),
  /**
   * Generate Graphics (logos, infographics, diagrams)
   */
  generateGraphics: protectedProcedure
    .input(z.object({
      type: z.enum(["logo", "infographic", "diagram", "wireframe"]),
      description: z.string(),
      style: z.string().optional(),
      colorScheme: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Generate a detailed design specification for a ${input.type}.

Description: ${input.description}
${input.style ? `Style: ${input.style}` : ""}
${input.colorScheme ? `Color Scheme: ${input.colorScheme.join(", ")}` : ""}

Provide:
1. Design concept and rationale
2. Layout specifications
3. Color palette with hex codes
4. Typography recommendations
5. File format recommendations
6. Implementation notes

Format as detailed Markdown.`;

      const result = await callOpenRouter(LLM_MODELS.documentation, prompt);
      
      return {
        specification: result,
        type: input.type,
        message: "Graphics specification generated! Use this to create the actual graphic.",
      };
    }),

  /**
   * Generate Pitch Deck
   */
  generatePitchDeck: protectedProcedure
    .input(z.object({
      companyName: z.string(),
      industry: z.string(),
      problem: z.string(),
      solution: z.string(),
      marketSize: z.string().optional(),
      businessModel: z.string().optional(),
      traction: z.string().optional(),
      team: z.string().optional(),
      ask: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Create a comprehensive pitch deck for an investor presentation.

Company: ${input.companyName}
Industry: ${input.industry}
Problem: ${input.problem}
Solution: ${input.solution}
${input.marketSize ? `Market Size: ${input.marketSize}` : ""}
${input.businessModel ? `Business Model: ${input.businessModel}` : ""}
${input.traction ? `Traction: ${input.traction}` : ""}
${input.team ? `Team: ${input.team}` : ""}
${input.ask ? `Ask: ${input.ask}` : ""}

Generate a complete pitch deck with:
1. Cover slide
2. Problem slide
3. Solution slide
4. Market opportunity
5. Business model
6. Traction/metrics
7. Competition
8. Go-to-market strategy
9. Team
10. Financials
11. The ask
12. Closing slide

For each slide, provide:
- Slide title
- Key points (3-5 bullet points max)
- Visual suggestions
- Speaker notes

Format as Markdown with clear slide breaks.`;

      const result = await callOpenRouter(LLM_MODELS.documentation, prompt);
      
      return {
        pitchDeck: result,
        slideCount: 12,
        message: "Pitch deck generated! Export to PPTX or use slides tool.",
      };
    }),

  /**
   * Generate SSRN Paper (Academic Research Paper)
   */
  generateSSRNPaper: protectedProcedure
    .input(z.object({
      title: z.string(),
      abstract: z.string(),
      researchQuestion: z.string(),
      methodology: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      citations: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Write a comprehensive academic research paper suitable for SSRN (Social Science Research Network).

Title: ${input.title}
Abstract: ${input.abstract}
Research Question: ${input.researchQuestion}
${input.methodology ? `Methodology: ${input.methodology}` : ""}
${input.keywords ? `Keywords: ${input.keywords.join(", ")}` : ""}
${input.citations ? `Key Citations: ${input.citations.join("; ")}` : ""}

Generate a complete academic paper with:
1. Title page
2. Abstract (250-300 words)
3. Introduction (with literature review)
4. Methodology
5. Results/Findings
6. Discussion
7. Conclusion
8. References (APA format)
9. Appendices (if needed)

Use formal academic language, cite sources properly, and follow SSRN formatting guidelines.
Include statistical analysis where appropriate.
Format as Markdown with proper citations.`;

      const result = await callOpenRouter(LLM_MODELS.research, prompt);
      
      return {
        paper: result,
        wordCount: result.split(" ").length,
        message: "SSRN paper generated! Review and export to PDF/DOCX.",
      };
    }),

  /**
   * Generate Journal Article
   */
  generateJournalArticle: protectedProcedure
    .input(z.object({
      title: z.string(),
      journalType: z.enum(["scientific", "medical", "business", "humanities", "technical"]),
      topic: z.string(),
      targetJournal: z.string().optional(),
      wordLimit: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Write a publication-ready journal article for a ${input.journalType} journal.

Title: ${input.title}
Topic: ${input.topic}
${input.targetJournal ? `Target Journal: ${input.targetJournal}` : ""}
${input.wordLimit ? `Word Limit: ${input.wordLimit}` : ""}

Generate a complete journal article with:
1. Title and author information
2. Abstract (150-250 words)
3. Keywords (5-7)
4. Introduction
5. Methods (if applicable)
6. Results
7. Discussion
8. Conclusion
9. Acknowledgments
10. References
11. Figures/Tables (descriptions)

Follow ${input.journalType} journal standards.
Use appropriate citation style (APA, MLA, Chicago, or Vancouver).
Include data visualizations where appropriate.
Format as Markdown.`;

      const result = await callOpenRouter(LLM_MODELS.research, prompt);
      
      return {
        article: result,
        wordCount: result.split(" ").length,
        journalType: input.journalType,
        message: "Journal article generated! Review and submit to target journal.",
      };
    }),

  /**
   * Generate Book Manuscript
   */
  generateBookManuscript: protectedProcedure
    .input(z.object({
      title: z.string(),
      genre: z.enum(["fiction", "non-fiction", "technical", "business", "self-help", "biography"]),
      topic: z.string(),
      targetAudience: z.string(),
      chapterCount: z.number().min(1).max(50).optional().default(10),
      outline: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Write a comprehensive book manuscript.

Title: ${input.title}
Genre: ${input.genre}
Topic: ${input.topic}
Target Audience: ${input.targetAudience}
Chapter Count: ${input.chapterCount}
${input.outline ? `Outline: ${input.outline}` : ""}

Generate a complete book manuscript with:
1. Title page
2. Copyright page
3. Dedication (optional)
4. Table of contents
5. Foreword/Preface
6. Introduction
7. ${input.chapterCount} chapters (each 3,000-5,000 words)
8. Conclusion
9. Appendices (if needed)
10. Glossary (if needed)
11. Bibliography/References
12. Index

For each chapter:
- Chapter title
- Chapter summary
- Full chapter content
- Key takeaways

Use engaging storytelling for ${input.genre}.
Include examples, case studies, or anecdotes.
Format as Markdown with clear chapter breaks.`;

      const result = await callOpenRouter(LLM_MODELS.documentation, prompt);
      
      return {
        manuscript: result,
        wordCount: result.split(" ").length,
        chapterCount: input.chapterCount,
        genre: input.genre,
        message: "Book manuscript generated! Review and export to DOCX/PDF for publishing.",
      };
    }),


  /**
   * Generate Data Dictionary from database schema
   */
  generateDataDictionary: protectedProcedure
    .input(z.object({
      schemaPath: z.string().optional().default("drizzle/schema.ts"),
    }))
    .mutation(async ({ input }) => {
      // Read schema file
      const fs = await import("fs/promises");
      const path = await import("path");
      
      const schemaPath = path.join(process.cwd(), input.schemaPath);
      const schemaContent = await fs.readFile(schemaPath, "utf-8");

      // Use OpenRouter to analyze schema and generate data dictionary
      const prompt = `Analyze this database schema and generate a comprehensive data dictionary in Markdown format.

For each table, include:
1. Table name and description
2. All fields with:
   - Field name
   - Data type
   - Constraints (NOT NULL, UNIQUE, DEFAULT, etc.)
   - Description of what the field stores
3. Relationships (foreign keys, indexes)
4. Purpose and usage notes

Schema:
\`\`\`typescript
${schemaContent}
\`\`\`

Generate a well-structured data dictionary in Markdown format.`;

      const systemPrompt = "You are a database documentation expert. Generate clear, comprehensive, and accurate data dictionaries from database schemas.";

      const dataDictionary = await callOpenRouter(LLM_MODELS.documentation, prompt, systemPrompt);

      // Save data dictionary to file
      const outputPath = path.join(process.cwd(), "DATA_DICTIONARY.md");
      await fs.writeFile(outputPath, dataDictionary, "utf-8");

      return {
        success: true,
        path: outputPath,
        content: dataDictionary,
      };
    }),

  /**
   * Analyze codebase for TypeScript errors and suggest fixes
   */
  analyzeTypeScriptErrors: protectedProcedure
    .input(z.object({
      errorLog: z.string(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Analyze these TypeScript errors and provide specific, actionable fixes for each error.

For each error, provide:
1. Error description
2. Root cause
3. Exact fix (with code snippet if applicable)
4. File and line number

TypeScript Errors:
\`\`\`
${input.errorLog}
\`\`\`

Provide fixes in a structured format.`;

      const systemPrompt = "You are a TypeScript expert. Analyze errors and provide precise, actionable fixes.";

      const analysis = await callOpenRouter(LLM_MODELS.codeReview, prompt, systemPrompt);

      return {
        success: true,
        analysis,
      };
    }),

  /**
   * Research mode: Analyze codebase patterns and identify issues
   */
  researchCodebase: protectedProcedure
    .input(z.object({
      files: z.array(z.object({
        path: z.string(),
        content: z.string(),
      })),
      focusAreas: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const filesContent = input.files
        .map(f => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
        .join("\n\n");

      const focusAreasText = input.focusAreas?.length
        ? `Focus on: ${input.focusAreas.join(", ")}`
        : "Analyze all aspects";

      const prompt = `Analyze this codebase and identify:
1. Code quality issues
2. Security vulnerabilities
3. Performance bottlenecks
4. Architectural problems
5. Best practice violations
6. Potential bugs

${focusAreasText}

Codebase:
${filesContent}

Provide a detailed research report with specific recommendations.`;

      const systemPrompt = "You are a senior software architect and security expert. Analyze codebases deeply and provide actionable insights.";

      const research = await callOpenRouter(LLM_MODELS.research, prompt, systemPrompt);

      return {
        success: true,
        research,
      };
    }),

  /**
   * Generate ER diagram from database schema
   */
  generateERDiagram: protectedProcedure
    .input(z.object({
      schemaPath: z.string().optional().default("drizzle/schema.ts"),
    }))
    .mutation(async ({ input }) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      
      const schemaPath = path.join(process.cwd(), input.schemaPath);
      const schemaContent = await fs.readFile(schemaPath, "utf-8");

      const prompt = `Analyze this database schema and generate a Mermaid ER diagram.

Include:
1. All tables as entities
2. All relationships (foreign keys)
3. Primary keys
4. Important fields

Schema:
\`\`\`typescript
${schemaContent}
\`\`\`

Generate ONLY the Mermaid diagram code (starting with \`erDiagram\`), no explanations.`;

      const systemPrompt = "You are a database visualization expert. Generate accurate Mermaid ER diagrams from database schemas.";

      const mermaidCode = await callOpenRouter(LLM_MODELS.documentation, prompt, systemPrompt);

      // Save diagram to file
      const outputPath = path.join(process.cwd(), "ER_DIAGRAM.mmd");
      await fs.writeFile(outputPath, mermaidCode, "utf-8");

      return {
        success: true,
        path: outputPath,
        mermaidCode,
      };
    }),

  /**
   * Get OZ module status and available models
   */
  status: protectedProcedure.query(() => {
    return {
      configured: !!OPENROUTER_API_KEY,
      models: LLM_MODELS,
      features: [
        "Data Dictionary Generation",
        "TypeScript Error Analysis",
        "Codebase Research",
        "ER Diagram Generation",
      ],
    };
  }),
});

/**
 * Multi-Agent Crew Definitions
 * 
 * Each crew is a specialized team of agents that work together
 * to accomplish specific tasks. Crews communicate and delegate
 * work autonomously.
 */

interface Agent {
  role: string;
  goal: string;
  backstory: string;
  model: string;
}

interface Crew {
  name: string;
  agents: Agent[];
  tasks: string[];
}

// Research Crew: Retrieves data from multiple sources
const RESEARCH_CREW: Crew = {
  name: "Research Crew",
  agents: [
    {
      role: "Senior Researcher",
      goal: "Gather comprehensive data from multiple sources and synthesize findings",
      backstory: "Expert at finding relevant information across databases, APIs, and documentation",
      model: LLM_MODELS.research,
    },
    {
      role: "Data Analyst",
      goal: "Analyze retrieved data and identify patterns and insights",
      backstory: "Specialized in data analysis, statistics, and pattern recognition",
      model: LLM_MODELS.research,
    },
    {
      role: "Quality Reviewer",
      goal: "Verify accuracy and completeness of research findings",
      backstory: "Ensures all research meets quality standards and is properly cited",
      model: LLM_MODELS.codeReview,
    },
  ],
  tasks: ["search", "analyze", "verify", "synthesize"],
};

// Code Crew: Generates, reviews, and fixes code
const CODE_CREW: Crew = {
  name: "Code Crew",
  agents: [
    {
      role: "Senior Developer",
      goal: "Write clean, efficient, and maintainable code",
      backstory: "Expert full-stack developer with 10+ years experience",
      model: LLM_MODELS.codeReview,
    },
    {
      role: "Code Reviewer",
      goal: "Review code for quality, security, and best practices",
      backstory: "Specialized in code review, security audits, and performance optimization",
      model: LLM_MODELS.codeReview,
    },
    {
      role: "Bug Fixer",
      goal: "Identify and fix bugs, errors, and issues",
      backstory: "Expert at debugging and resolving TypeScript, React, and Node.js issues",
      model: LLM_MODELS.codeReview,
    },
  ],
  tasks: ["generate", "review", "fix", "optimize"],
};

// Documentation Crew: Creates comprehensive documentation
const DOCUMENTATION_CREW: Crew = {
  name: "Documentation Crew",
  agents: [
    {
      role: "Technical Writer",
      goal: "Create clear, comprehensive, and user-friendly documentation",
      backstory: "Expert at explaining complex technical concepts in simple terms",
      model: LLM_MODELS.documentation,
    },
    {
      role: "Database Architect",
      goal: "Document database schemas, relationships, and data flows",
      backstory: "Specialized in database design, normalization, and documentation",
      model: LLM_MODELS.documentation,
    },
    {
      role: "Diagram Specialist",
      goal: "Create visual representations of systems and data",
      backstory: "Expert at creating ER diagrams, flowcharts, and system architecture diagrams",
      model: LLM_MODELS.documentation,
    },
  ],
  tasks: ["document", "diagram", "explain", "organize"],
};

// Automation Crew: Builds and executes workflows
const AUTOMATION_CREW: Crew = {
  name: "Automation Crew",
  agents: [
    {
      role: "Workflow Designer",
      goal: "Design efficient, automated workflows for repetitive tasks",
      backstory: "Expert at process optimization and workflow automation",
      model: LLM_MODELS.research,
    },
    {
      role: "Integration Specialist",
      goal: "Connect systems, APIs, and tools together",
      backstory: "Specialized in API integration, webhooks, and system connectivity",
      model: LLM_MODELS.codeReview,
    },
    {
      role: "Process Optimizer",
      goal: "Optimize workflows for speed, efficiency, and reliability",
      backstory: "Expert at identifying bottlenecks and improving process performance",
      model: LLM_MODELS.research,
    },
  ],
  tasks: ["design", "integrate", "optimize", "execute"],
};

/**
 * Execute a crew task with multiple agents collaborating
 */
async function executeCrew(crew: Crew, task: string, context: string): Promise<string> {
  const results: string[] = [];

  // Each agent in the crew contributes to the task
  for (const agent of crew.agents) {
    const agentPrompt = `You are a ${agent.role}.
Goal: ${agent.goal}
Backstory: ${agent.backstory}

Task: ${task}

Context:
${context}

Provide your contribution to this task based on your role and expertise.`;

    const systemPrompt = `You are ${agent.role}. ${agent.backstory}`;

    const contribution = await callOpenRouter(agent.model, agentPrompt, systemPrompt);
    results.push(`### ${agent.role}\n${contribution}`);
  }

  // Synthesize all agent contributions
  const synthesisPrompt = `Synthesize these contributions from the ${crew.name} into a unified, coherent result:

${results.join("\n\n")}

Provide a comprehensive, well-organized final result.`;

  return await callOpenRouter(LLM_MODELS.documentation, synthesisPrompt);
}
