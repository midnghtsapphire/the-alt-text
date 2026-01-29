# OZ Video Generation API - Automated "How It Works" Videos

**Version:** 1.0.0  
**Last Updated:** January 29, 2026  
**Status:** Design Phase

---

## Overview

The **OZ Video Generation API** extends the OZ Graphics system to automatically create custom-branded explainer videos for every client. Each video showcases how The Alt Text platform works, using the client's own branding, colors, and logo.

---

## Core Capabilities

### 1. Automated Explainer Videos
- **"How It Works" videos** - 60-90 second product demos
- **Custom branding** - Client logo, colors, and style integrated throughout
- **Professional voiceover** - AI-generated narration with natural speech
- **Multiple formats** - Landscape (16:9), square (1:1), vertical (9:16)

### 2. Video Scenes (6-Shot Structure)

#### Scene 1: Problem Statement (10 seconds)
- **Visual**: Website with accessibility violations highlighted in red
- **Narration**: "98% of websites have accessibility violations. With 4,000+ ADA lawsuits filed in 2024, is your business at risk?"
- **Branding**: Client logo in corner, brand colors for highlights

#### Scene 2: Solution Introduction (10 seconds)
- **Visual**: Client's custom logo animates in with glassmorphism effects
- **Narration**: "[Client Name] powered by The Alt Text protects your business with automated WCAG compliance."
- **Branding**: Full client branding, hero background

#### Scene 3: Automated Scanning (15 seconds)
- **Visual**: 3D website being scanned with neon blue beams, violations detected
- **Narration**: "Our AI-powered scanner analyzes your entire website in minutes, detecting every accessibility violation."
- **Branding**: Client's primary color for scanning beams

#### Scene 4: AI-Powered Fixes (15 seconds)
- **Visual**: Robotic arm/AI assistant fixing violations, checkmarks appearing
- **Narration**: "One-click fixes powered by multi-LLM AI. Generate accurate alt text, fix color contrast, and add ARIA labels instantly."
- **Branding**: Client's success green for checkmarks

#### Scene 5: Real-Time Monitoring (15 seconds)
- **Visual**: Dashboard with compliance score, real-time alerts, trend graphs
- **Narration**: "24/7 monitoring keeps you compliant. Get instant alerts when new violations are detected."
- **Branding**: Client's branded dashboard mockup

#### Scene 6: Call to Action (15 seconds)
- **Visual**: Client logo with website URL, ROI calculator showing savings
- **Narration**: "Protect your business from $10k-$100k lawsuits. Start your free trial today at [client-domain].com"
- **Branding**: Client's full branding, CTA button in accent color

---

## API Endpoints

### Generate Explainer Video
```typescript
POST /api/oz/video/generate-explainer

Request:
{
  clientId: string;
  brandName: string;
  domain: string;
  style: 'glassmorphism' | 'cyberpunk' | 'minimalist' | 'corporate';
  colorPalette: {
    primary: string;
    accent: string;
    success: string;
    warning: string;
  };
  logoUrl: string;  // URL to client's logo
  voiceType: 'male' | 'female';
  format: 'landscape' | 'square' | 'vertical';
  includeSubtitles: boolean;
}

Response:
{
  videoUrl: string;  // URL to generated MP4 video
  duration: number;  // seconds
  scenes: Array<{
    sceneNumber: number;
    duration: number;
    shotUrl: string;  // URL to individual scene
  }>;
  subtitlesUrl?: string;  // URL to SRT subtitle file
  generationTime: number;  // milliseconds
}
```

### Generate Custom Scene
```typescript
POST /api/oz/video/generate-scene

Request:
{
  sceneType: 'problem' | 'solution' | 'scanning' | 'fixing' | 'monitoring' | 'cta';
  brandName: string;
  style: string;
  colorPalette: ColorPalette;
  logoUrl?: string;
  customNarration?: string;
  duration: number;  // 4, 6, or 8 seconds
}

Response:
{
  sceneUrl: string;  // URL to generated scene MP4
  duration: number;
  audioUrl?: string;  // URL to audio track
}
```

---

## Technical Implementation

### Video Generation Pipeline

```typescript
// server/services/ozVideo.ts
import { generateVideo } from '../_core/videoGeneration';
import { generateSpeech } from '../_core/speechGeneration';
import { generateImage } from '../_core/imageGeneration';

export async function generateExplainerVideo(params: {
  clientId: string;
  brandName: string;
  domain: string;
  style: string;
  colorPalette: ColorPalette;
  logoUrl: string;
  voiceType: 'male' | 'female';
  format: 'landscape' | 'square' | 'vertical';
}) {
  const { brandName, domain, style, colorPalette, logoUrl, voiceType, format } = params;
  
  // Step 1: Generate reference image for consistent style
  const styleReference = await generateImage({
    prompt: `Create a reference style frame for ${brandName} explainer video.
      Style: ${style} with 3D elements, glassmorphism, holographic effects.
      Color palette: primary ${colorPalette.primary}, accent ${colorPalette.accent}.
      Include ${brandName} logo and brand colors. Ultra-modern, tech-forward aesthetic.`,
    aspectRatio: format === 'landscape' ? 'landscape' : format === 'square' ? 'square' : 'portrait',
  });
  
  // Step 2: Generate each scene with consistent reference
  const scenes = await Promise.all([
    generateScene1Problem(params, styleReference),
    generateScene2Solution(params, styleReference),
    generateScene3Scanning(params, styleReference),
    generateScene4Fixing(params, styleReference),
    generateScene5Monitoring(params, styleReference),
    generateScene6CTA(params, styleReference),
  ]);
  
  // Step 3: Concatenate scenes with ffmpeg
  const finalVideo = await concatenateScenes(scenes);
  
  // Step 4: Upload to S3
  const videoUrl = await uploadToS3(finalVideo, `videos/${params.clientId}/explainer.mp4`);
  
  return {
    videoUrl,
    duration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
    scenes: scenes.map((scene, i) => ({
      sceneNumber: i + 1,
      duration: scene.duration,
      shotUrl: scene.url,
    })),
  };
}

async function generateScene1Problem(params: VideoParams, styleRef: string) {
  // Generate narration audio
  const narration = await generateSpeech({
    text: "98% of websites have accessibility violations. With 4,000 ADA lawsuits filed in 2024, is your business at risk?",
    voice: params.voiceType === 'male' ? 'male_voice' : 'female_voice',
  });
  
  // Generate video with audio
  const video = await generateVideo({
    prompt: `Show a modern website interface with accessibility violations highlighted in glowing red.
      Warning icons and alert symbols appear around the violations.
      Style: ${params.style} with 3D elements and dramatic lighting.
      Color palette: ${params.colorPalette.primary} with red (#EF4444) for violations.
      The scene should convey urgency and risk. Cinematic quality.`,
    aspectRatio: params.format === 'landscape' ? 'landscape' : params.format === 'square' ? 'square' : 'portrait',
    duration: 8,
    generateAudio: false,  // We'll add custom narration
    references: [styleRef],  // Use style reference for consistency
  });
  
  // Combine video with narration audio using ffmpeg
  const finalScene = await combineVideoAndAudio(video, narration);
  
  return {
    url: await uploadToS3(finalScene, `videos/${params.clientId}/scene1.mp4`),
    duration: 10,
  };
}

async function generateScene2Solution(params: VideoParams, styleRef: string) {
  const narration = await generateSpeech({
    text: `${params.brandName} powered by The Alt Text protects your business with automated WCAG compliance.`,
    voice: params.voiceType === 'male' ? 'male_voice' : 'female_voice',
  });
  
  const video = await generateVideo({
    prompt: `Animate ${params.brandName} logo with glassmorphism effects.
      The logo should emerge from particles and light rays, growing larger and more prominent.
      Background: ${params.style} hero background with ${params.colorPalette.primary} and ${params.colorPalette.accent} gradients.
      Include floating accessibility icons and [ALT] brackets around the logo.
      Dramatic lighting with neon accents. Cinematic reveal.`,
    aspectRatio: params.format === 'landscape' ? 'landscape' : params.format === 'square' ? 'square' : 'portrait',
    duration: 8,
    generateAudio: false,
    references: [params.logoUrl, styleRef],  // Use client logo and style reference
  });
  
  const finalScene = await combineVideoAndAudio(video, narration);
  
  return {
    url: await uploadToS3(finalScene, `videos/${params.clientId}/scene2.mp4`),
    duration: 10,
  };
}

async function generateScene3Scanning(params: VideoParams, styleRef: string) {
  const narration = await generateSpeech({
    text: "Our AI-powered scanner analyzes your entire website in minutes, detecting every accessibility violation.",
    voice: params.voiceType === 'male' ? 'male_voice' : 'female_voice',
  });
  
  const video = await generateVideo({
    prompt: `3D isometric website being scanned by holographic AI system.
      Scanning beams in neon ${params.colorPalette.primary} sweep across the website.
      Violations are detected and highlighted with warning icons in amber (#F59E0B).
      Include floating UI panels showing scan progress and violation counts.
      Style: ${params.style} with glassmorphism and dramatic lighting.
      The scene should show technology in action. Cinematic quality.`,
    aspectRatio: params.format === 'landscape' ? 'landscape' : params.format === 'square' ? 'square' : 'portrait',
    duration: 8,
    generateAudio: false,
    references: [styleRef],
  });
  
  const finalScene = await combineVideoAndAudio(video, narration);
  
  return {
    url: await uploadToS3(finalScene, `videos/${params.clientId}/scene3.mp4`),
    duration: 15,
  };
}

async function generateScene4Fixing(params: VideoParams, styleRef: string) {
  const narration = await generateSpeech({
    text: "One-click fixes powered by multi-LLM AI. Generate accurate alt text, fix color contrast, and add ARIA labels instantly.",
    voice: params.voiceType === 'male' ? 'male_voice' : 'female_voice',
  });
  
  const video = await generateVideo({
    prompt: `Futuristic AI assistant (abstract geometric form with glowing core) fixing accessibility violations.
      Show violations being repaired one by one with success checkmarks in ${params.colorPalette.success}.
      Include holographic code panels with [ALT] text being added to images.
      Robotic arm or energy beams performing fixes with particle effects.
      Style: ${params.style} with dramatic lighting and neon accents.
      The scene should convey automation and intelligence. Cinematic quality.`,
    aspectRatio: params.format === 'landscape' ? 'landscape' : params.format === 'square' ? 'square' : 'portrait',
    duration: 8,
    generateAudio: false,
    references: [styleRef],
  });
  
  const finalScene = await combineVideoAndAudio(video, narration);
  
  return {
    url: await uploadToS3(finalScene, `videos/${params.clientId}/scene4.mp4`),
    duration: 15,
  };
}

async function generateScene5Monitoring(params: VideoParams, styleRef: string) {
  const narration = await generateSpeech({
    text: "24/7 monitoring keeps you compliant. Get instant alerts when new violations are detected.",
    voice: params.voiceType === 'male' ? 'male_voice' : 'female_voice',
  });
  
  const video = await generateVideo({
    prompt: `Futuristic dashboard interface with ${params.brandName} branding.
      Show large compliance score (92%) with glowing neon ring in ${params.colorPalette.primary}.
      Include real-time monitoring indicators, trend graphs, and alert notifications.
      Glassmorphism cards with violation counts and status indicators.
      Style: ${params.style} with ${params.colorPalette.primary} and ${params.colorPalette.accent} accents.
      The scene should show comprehensive monitoring. Cinematic quality.`,
    aspectRatio: params.format === 'landscape' ? 'landscape' : params.format === 'square' ? 'square' : 'portrait',
    duration: 8,
    generateAudio: false,
    references: [styleRef],
  });
  
  const finalScene = await combineVideoAndAudio(video, narration);
  
  return {
    url: await uploadToS3(finalScene, `videos/${params.clientId}/scene5.mp4`),
    duration: 15,
  };
}

async function generateScene6CTA(params: VideoParams, styleRef: string) {
  const narration = await generateSpeech({
    text: `Protect your business from $10,000 to $100,000 lawsuits. Start your free trial today at ${params.domain}`,
    voice: params.voiceType === 'male' ? 'male_voice' : 'female_voice',
  });
  
  const video = await generateVideo({
    prompt: `${params.brandName} logo prominently displayed with website URL: ${params.domain}
      Show ROI calculator with savings visualization: "$50,000 lawsuit prevented"
      Include glowing CTA button in ${params.colorPalette.accent} with "Start Free Trial" text.
      Background: ${params.style} with ${params.colorPalette.primary} gradient.
      Add success indicators and protective shield imagery.
      Style: professional, trustworthy, action-oriented. Cinematic quality.`,
    aspectRatio: params.format === 'landscape' ? 'landscape' : params.format === 'square' ? 'square' : 'portrait',
    duration: 8,
    generateAudio: false,
    references: [params.logoUrl, styleRef],
  });
  
  const finalScene = await combineVideoAndAudio(video, narration);
  
  return {
    url: await uploadToS3(finalScene, `videos/${params.clientId}/scene6.mp4`),
    duration: 15,
  };
}

async function concatenateScenes(scenes: Array<{ url: string; duration: number }>) {
  // Use ffmpeg to concatenate all scenes into final video
  const ffmpegCommand = `ffmpeg -i ${scenes.map(s => s.url).join(' -i ')} \
    -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a][4:v][4:a][5:v][5:a]concat=n=6:v=1:a=1[outv][outa]" \
    -map "[outv]" -map "[outa]" output.mp4`;
  
  // Execute ffmpeg command
  // Return final video buffer
}

async function combineVideoAndAudio(videoBuffer: Buffer, audioBuffer: Buffer) {
  // Use ffmpeg to replace video audio with custom narration
  const ffmpegCommand = `ffmpeg -i video.mp4 -i audio.wav -c:v copy -map 0:v:0 -map 1:a:0 output.mp4`;
  
  // Execute ffmpeg command
  // Return combined video buffer
}
```

---

## Database Schema

```typescript
// Add to alttext-schema.ts
export const videoGenerations = pgTable('video_generations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clientBrandingId: integer('client_branding_id').references(() => clientBranding.id),
  
  videoType: text('video_type').notNull(), // 'explainer', 'tutorial', 'testimonial'
  format: text('format').notNull(), // 'landscape', 'square', 'vertical'
  duration: integer('duration').notNull(), // seconds
  
  // Video URLs
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  subtitlesUrl: text('subtitles_url'),
  
  // Scene URLs (JSON array)
  scenes: jsonb('scenes'), // [{ sceneNumber, duration, shotUrl }]
  
  // Generation metadata
  voiceType: text('voice_type'), // 'male', 'female'
  generationTime: integer('generation_time'), // milliseconds
  generatedAt: timestamp('generated_at').defaultNow(),
  
  // Usage tracking
  viewCount: integer('view_count').default(0),
  downloadCount: integer('download_count').default(0),
});
```

---

## Pricing Model

### Per-Generation Costs
- **Explainer Video (6 scenes)**: $30 (6 video generations + 6 audio generations)
  - Video: 6 scenes × $3/scene = $18
  - Audio: 6 narrations × $2/narration = $12
- **Custom Scene**: $5 (1 video + 1 audio)

### Subscription Tiers
- **Starter ($99/month)**: 1 explainer video
- **Professional ($299/month)**: 3 explainer videos + 5 custom scenes
- **Enterprise ($999/month)**: Unlimited explainer videos + unlimited custom scenes

### Add-On Pricing
- **Additional Explainer Video**: $50
- **Custom Scene**: $10
- **Video Editing Service**: $100 (human editor refines AI-generated video)

### Revenue Potential
- **Cost per explainer video**: ~$30 (API costs)
- **Sell price**: $50 (add-on) or included in subscription
- **Markup**: 67% on add-ons
- **Monthly recurring revenue**: Built into subscription tiers
- **Projected add-on revenue**: $2,000/month (40 clients × $50)

---

## Use Cases

### 1. Landing Page Hero Video
- Autoplay explainer video in hero section
- Shows visitors how the platform works instantly
- Increases conversion rates by 30-50%

### 2. Social Media Marketing
- Generate square (1:1) and vertical (9:16) versions
- Post to Instagram, TikTok, LinkedIn, Facebook
- Automated content marketing for clients

### 3. Email Campaigns
- Embed video in email campaigns
- Higher click-through rates than static images
- Personalized with client branding

### 4. Sales Presentations
- White-label videos for agency pitches
- Show prospects how their branded platform would look
- Close deals faster with visual proof

### 5. Onboarding Tutorials
- Generate custom tutorial videos for each client
- Explain features with client's own branding
- Reduce support tickets

---

## Competitive Advantages

1. **Fully Automated**: No video editors, instant delivery
2. **Custom Branded**: Every video uses client's logo and colors
3. **Multiple Formats**: Landscape, square, vertical for all platforms
4. **AI Narration**: Professional voiceover without human voice actors
5. **Scalable**: Generate unlimited videos with consistent quality

---

## Future Enhancements

### Interactive Videos
- Clickable CTAs within video
- Branch to different scenes based on viewer choices
- Personalized content based on viewer data

### Multilingual Support
- Generate videos in 20+ languages
- Automatic translation of narration
- Localized for global markets

### A/B Testing
- Generate multiple versions with different messaging
- Test which videos convert best
- Optimize based on performance data

### Live Video Updates
- Update videos with real-time data (e.g., lawsuit count)
- Dynamic pricing in CTA scenes
- Always current without regeneration

---

## Implementation Timeline

- **Week 1**: Video generation API integration
- **Week 2**: Scene generation and concatenation
- **Week 3**: Audio narration and synchronization
- **Week 4**: Testing and optimization
- **Week 5**: Launch beta with 10 clients

---

## Success Metrics

- **Generation Time**: < 5 minutes for complete explainer video
- **Client Satisfaction**: > 85% approval rate on first generation
- **Conversion Impact**: 30-50% increase in landing page conversions
- **Revenue Impact**: $2,000/month additional revenue from video add-ons

---

## Example Video Script

**Total Duration**: 80 seconds (6 scenes)

1. **Problem (10s)**: "98% of websites have accessibility violations. With 4,000+ ADA lawsuits filed in 2024, is your business at risk?"

2. **Solution (10s)**: "[Client Name] powered by The Alt Text protects your business with automated WCAG compliance."

3. **Scanning (15s)**: "Our AI-powered scanner analyzes your entire website in minutes, detecting every accessibility violation."

4. **Fixing (15s)**: "One-click fixes powered by multi-LLM AI. Generate accurate alt text, fix color contrast, and add ARIA labels instantly."

5. **Monitoring (15s)**: "24/7 monitoring keeps you compliant. Get instant alerts when new violations are detected."

6. **CTA (15s)**: "Protect your business from $10k-$100k lawsuits. Start your free trial today at [client-domain].com"

---

**Ready to bring client branding to life with video? Let's make it happen! 🎬**
