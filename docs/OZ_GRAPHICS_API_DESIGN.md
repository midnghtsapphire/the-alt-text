# OZ Graphics API Module Design

**Version:** 1.0.0  
**Last Updated:** January 29, 2026  
**Status:** Design Phase

---

## Overview

The **OZ Graphics API** is an automated brand asset generation system that creates custom logos, landing pages, marketing materials, and UI components for every client using AI-powered image generation. This module integrates with The Alt Text platform to provide white-label branding capabilities.

---

## Core Capabilities

### 1. Automated Logo Generation
- **3D Logo Variants**: Main logo, icon-only, horizontal layout, favicon sizes
- **Style Options**: Glassmorphism, cyberpunk, minimalist, corporate, playful
- **Color Customization**: Brand colors extracted from client preferences
- **Format Output**: PNG (transparent), SVG, ICO, WebP

### 2. Landing Page Asset Generation
- **Hero Backgrounds**: Custom 3D backgrounds with brand colors and themes
- **Feature Icons**: Unique icons for each product feature (3D, isometric, flat)
- **Illustrations**: Custom illustrations for use cases and benefits
- **Dashboard Mockups**: Product screenshots with client branding

### 3. Marketing Material Generation
- **Social Media Graphics**: Facebook, Twitter, LinkedIn, Instagram formats
- **Email Headers**: Branded email templates
- **Presentation Slides**: Pitch deck backgrounds and graphics
- **Print Materials**: Business cards, flyers, brochures

### 4. UI Component Generation
- **Button Styles**: Custom button designs matching brand aesthetic
- **Card Designs**: Glassmorphism cards, gradient cards, 3D cards
- **Navigation Elements**: Custom nav bars, sidebars, menus
- **Loading Animations**: Branded loading spinners and progress bars

---

## API Endpoints

### Generate Logo Set
```typescript
POST /api/oz/graphics/generate-logo

Request:
{
  brandName: string;
  industry: string;
  style: 'glassmorphism' | 'cyberpunk' | 'minimalist' | 'corporate' | 'playful';
  primaryColor: string;  // hex color
  secondaryColor?: string;
  accentColor?: string;
  iconSymbol?: string;  // e.g., "shield", "rocket", "brain"
  tagline?: string;
}

Response:
{
  logoMain: string;  // URL to main logo PNG
  logoIcon: string;  // URL to icon-only PNG
  logoHorizontal: string;  // URL to horizontal layout PNG
  favicon16: string;  // URL to 16x16 favicon
  favicon32: string;  // URL to 32x32 favicon
  logoSvg?: string;  // URL to SVG version
  generationTime: number;  // milliseconds
}
```

### Generate Landing Page Assets
```typescript
POST /api/oz/graphics/generate-landing-assets

Request:
{
  brandName: string;
  industry: string;
  style: 'glassmorphism' | 'cyberpunk' | 'minimalist' | 'corporate' | 'playful';
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  features: Array<{
    name: string;
    description: string;
  }>;
  heroMessage?: string;
}

Response:
{
  heroBackground: string;  // URL to hero background image
  featureIcons: Array<{
    name: string;
    iconUrl: string;
  }>;
  productIllustration: string;  // URL to main product illustration
  dashboardMockup?: string;  // URL to dashboard mockup
  generationTime: number;
}
```

### Generate Marketing Materials
```typescript
POST /api/oz/graphics/generate-marketing

Request:
{
  brandName: string;
  logoUrl: string;  // existing logo to incorporate
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  materials: Array<'social-facebook' | 'social-twitter' | 'social-linkedin' | 'social-instagram' | 'email-header' | 'business-card' | 'flyer'>;
  message?: string;
  callToAction?: string;
}

Response:
{
  materials: Array<{
    type: string;
    url: string;
    dimensions: { width: number; height: number };
  }>;
  generationTime: number;
}
```

---

## Integration with The Alt Text

### Per-Client Branding Flow

1. **Client Onboarding**
   - Client provides: company name, industry, preferred colors
   - OZ Graphics API generates complete brand asset set
   - Assets stored in S3 with client-specific paths

2. **Dynamic Asset Loading**
   - Landing page loads client-specific assets from S3
   - CSS variables updated with client brand colors
   - Logo and icons dynamically injected

3. **White-Label Dashboard**
   - Each client sees their own branding in dashboard
   - Reports generated with client logos and colors
   - Email notifications use client branding

### Database Schema

```typescript
// Add to alttext-schema.ts
export const clientBranding = pgTable('client_branding', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  brandName: text('brand_name').notNull(),
  industry: text('industry'),
  style: text('style').notNull(), // glassmorphism, cyberpunk, etc.
  
  // Color palette
  primaryColor: text('primary_color').notNull(),
  secondaryColor: text('secondary_color'),
  accentColor: text('accent_color'),
  successColor: text('success_color'),
  warningColor: text('warning_color'),
  dangerColor: text('danger_color'),
  
  // Asset URLs
  logoMain: text('logo_main'),
  logoIcon: text('logo_icon'),
  logoHorizontal: text('logo_horizontal'),
  favicon16: text('favicon_16'),
  favicon32: text('favicon_32'),
  heroBackground: text('hero_background'),
  productIllustration: text('product_illustration'),
  
  // Feature icons (JSON array)
  featureIcons: jsonb('feature_icons'),
  
  // Metadata
  generatedAt: timestamp('generated_at').defaultNow(),
  regenerationCount: integer('regeneration_count').default(0),
});
```

---

## Technical Implementation

### Image Generation Service

```typescript
// server/services/ozGraphics.ts
import { generateImage } from '../_core/imageGeneration';

export async function generateLogoSet(params: {
  brandName: string;
  style: string;
  primaryColor: string;
  secondaryColor?: string;
  iconSymbol?: string;
}) {
  const { brandName, style, primaryColor, secondaryColor, iconSymbol } = params;
  
  // Generate main logo with detailed prompt
  const logoPrompt = `Create a stunning 3D logo for "${brandName}". 
    Style: ${style} with glassmorphism effects, vibrant gradients, and modern tech aesthetics.
    Primary color: ${primaryColor}. Secondary color: ${secondaryColor || 'complementary to primary'}.
    ${iconSymbol ? `Incorporate a ${iconSymbol} symbol.` : ''}
    The logo should have depth, dramatic lighting, neon accents, and cutting-edge design.
    Ultra-modern, tech-forward aesthetic. High-quality 3D render.`;
  
  const mainLogo = await generateImage({
    prompt: logoPrompt,
    aspectRatio: 'square',
  });
  
  // Generate icon-only version
  const iconPrompt = `Simplified icon-only version of the "${brandName}" logo.
    ${iconSymbol ? `Focus on the ${iconSymbol} symbol.` : 'Abstract geometric icon.'}
    Style: ${style}. Color: ${primaryColor}. Minimalist, recognizable at small sizes.
    3D design with glassmorphism and neon accents. Perfect for favicon and app icons.`;
  
  const iconLogo = await generateImage({
    prompt: iconPrompt,
    aspectRatio: 'square',
  });
  
  // Upload to S3 and return URLs
  const mainLogoUrl = await uploadToS3(mainLogo, `logos/${brandName}/main.png`);
  const iconLogoUrl = await uploadToS3(iconLogo, `logos/${brandName}/icon.png`);
  
  return {
    logoMain: mainLogoUrl,
    logoIcon: iconLogoUrl,
    // ... additional variants
  };
}

export async function generateLandingAssets(params: {
  brandName: string;
  style: string;
  colorPalette: ColorPalette;
  features: Feature[];
}) {
  // Generate hero background
  const heroPrompt = `Ultra-modern hero section background for "${params.brandName}".
    Style: ${params.style} with 3D elements, glassmorphism, holographic effects.
    Color palette: primary ${params.colorPalette.primary}, accent ${params.colorPalette.accent}.
    Include floating abstract shapes, particle effects, light trails, and grid patterns.
    Dramatic lighting with colored rim lights. Leave center clear for text overlay.
    Cinematic, futuristic, cutting-edge design. High-quality render.`;
  
  const heroBackground = await generateImage({
    prompt: heroPrompt,
    aspectRatio: 'landscape',
  });
  
  // Generate feature icons
  const featureIcons = await Promise.all(
    params.features.map(async (feature) => {
      const iconPrompt = `3D icon representing "${feature.name}": ${feature.description}.
        Style: ${params.style}. Colors: ${params.colorPalette.primary} to ${params.colorPalette.accent} gradient.
        Glassmorphism effects, neon accents, dramatic lighting. Ultra-modern aesthetic.
        High-quality 3D render with depth and realistic materials.`;
      
      const icon = await generateImage({
        prompt: iconPrompt,
        aspectRatio: 'square',
      });
      
      return {
        name: feature.name,
        iconUrl: await uploadToS3(icon, `icons/${params.brandName}/${feature.name}.png`),
      };
    })
  );
  
  return {
    heroBackground: await uploadToS3(heroBackground, `backgrounds/${params.brandName}/hero.png`),
    featureIcons,
  };
}
```

---

## Pricing Model

### Per-Generation Costs
- **Logo Set**: $5 (5 image generations)
- **Landing Page Assets**: $10 (1 hero + 5-8 feature icons)
- **Marketing Materials**: $15 (5-10 social media graphics)

### Subscription Tiers
- **Starter ($99/month)**: 1 logo set + 1 landing page asset set
- **Professional ($299/month)**: 3 logo sets + 3 landing page asset sets + unlimited regenerations
- **Enterprise ($999/month)**: Unlimited logo sets + landing page assets + marketing materials + priority generation

### Revenue Potential
- **Cost per generation**: ~$0.10 per image (OpenRouter API)
- **Markup**: 50x-100x (selling $5 logo set costs $0.50 to generate)
- **Monthly recurring revenue**: Built into subscription tiers
- **Add-on revenue**: Custom marketing materials ($15-$50 per set)

---

## Competitive Advantages

1. **Fully Automated**: No human designer needed
2. **Instant Delivery**: Assets generated in 30-60 seconds
3. **Consistent Quality**: AI ensures professional results every time
4. **Unlimited Variations**: Clients can regenerate until satisfied
5. **White-Label Ready**: Perfect for agencies and resellers
6. **Cost Effective**: 50x-100x markup on generation costs

---

## Future Enhancements

- **Video Generation**: Animated logos and hero backgrounds
- **3D Model Export**: GLB/GLTF files for AR/VR applications
- **Style Transfer**: Apply client branding to existing templates
- **A/B Testing**: Generate multiple variants for split testing
- **Brand Guidelines**: Auto-generate brand style guides with color codes, typography, usage rules

---

## Implementation Timeline

- **Week 1**: Core API endpoints and image generation integration
- **Week 2**: Database schema and S3 storage setup
- **Week 3**: The Alt Text integration and dynamic asset loading
- **Week 4**: Testing, documentation, and launch

---

## Success Metrics

- **Generation Time**: < 60 seconds for complete logo set
- **Client Satisfaction**: > 90% approval rate on first generation
- **Regeneration Rate**: < 20% of clients request regeneration
- **Revenue Impact**: $50k/month additional revenue from OZ Graphics add-ons
