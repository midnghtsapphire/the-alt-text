# TheAltText

**AI-Powered Alt Text Generator for ADA/WCAG Compliance**

A [GlowStarLabs](https://glowstarlabs.com) product by [Audrey Evans](https://meetaudreyevans.com)

---

## What is TheAltText?

TheAltText is a production-ready SaaS platform that uses advanced vision AI to automatically generate accurate, contextual, WCAG-compliant alt text for images. It protects businesses from $5K–$75K ADA lawsuits while making the web accessible to everyone.

Over 4,000 ADA web accessibility lawsuits are filed every year. The most common violation is missing alt text on images. TheAltText solves this at scale with one-click AI generation that meets WCAG 2.1 AA standards.

---

## Key Features

| Feature | Description |
|---|---|
| **AI Alt Text Generation** | Vision AI analyzes content, context, text, objects, and scenes to produce accurate descriptions |
| **WCAG 2.1 Compliance** | Every alt text is scored for confidence and compliance (pass/fail/warning) |
| **Bulk Processing** | Process up to 100 images per batch with CSV export |
| **Developer REST API** | Bearer token authentication, rate limiting, usage tracking |
| **Compliance Dashboard** | Usage stats, compliance score, processing history, admin analytics |
| **3 Accessibility Modes** | Neurodivergent, ECO CODE, No Blue Light |
| **16 Industry Pages** | SEO-optimized landing pages for Healthcare, E-commerce, Legal, and more |
| **Glassmorphism UI** | Dark theme with backdrop blur, gradient accents, responsive design |
| **Stripe-Ready Billing** | Free, Pro ($29/mo), Enterprise ($99/mo) tiers |
| **ROI Calculator** | Calculate cost savings vs. manual alt text writing |

---

## Target Market

TheAltText serves an underserved blue ocean market:

- **Small businesses** that need ADA compliance but cannot afford consultants
- **Web developers** who need to add alt text to thousands of images
- **Content creators and bloggers** managing image-heavy sites
- **Government and education sites** (legally required to be accessible)
- **E-commerce sites** with large product catalogs
- **Agencies** managing accessibility for multiple clients

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + shadcn/ui |
| Backend | Express 4 + tRPC 11 + Drizzle ORM |
| Database | MySQL / TiDB |
| AI | Built-in LLM with vision capabilities (Gemini 2.5 Flash) |
| Auth | OAuth with JWT sessions |
| Testing | Vitest (40 tests, 2 test files) |
| Animations | Framer Motion |

---

## Design Philosophy

TheAltText features a glassmorphism dark theme with three priority accessibility modes:

1. **Neurodivergent Mode** — High contrast, reduced motion, Atkinson Hyperlegible font, clear visual hierarchy
2. **ECO CODE Mode** — Minimal animations, reduced visual complexity, energy-saving design
3. **No Blue Light Mode** — Warm amber palette, blue light elimination for nighttime use

The interface is WCAG 2.1 AA compliant with full keyboard navigation, screen reader support, and semantic HTML throughout.

---

## Subscription Tiers

| Feature | Free | Pro ($29/mo) | Enterprise ($99/mo) |
|---|---|---|---|
| Images per month | 50 | 2,000 | 25,000 |
| Bulk processing | — | Up to 100/batch | Up to 100/batch |
| API access | — | 5,000 calls/mo | 50,000 calls/mo |
| WCAG compliance | AA | AA + AAA | AA + AAA + Section 508 |
| Compliance reports | — | Yes | Yes |
| Support | Community | Email | Priority + SLA |
| Rate limit | — | 60 req/min | 120 req/min |

---

## API Reference

### Authentication

All API endpoints require a Bearer token (API key):

```bash
curl -X POST https://your-domain.com/api/v1/generate-alt-text \
  -H "Authorization: Bearer tat_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/photo.jpg"}'
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/generate-alt-text` | Generate alt text for a single image |
| `POST` | `/api/v1/bulk-generate` | Bulk process up to 50 images |
| `GET` | `/api/v1/health` | Health check (no auth required) |

### Single Image Example

**Request:**
```json
{
  "image_url": "https://example.com/photo.jpg",
  "page_context": "Product page for outdoor furniture",
  "surrounding_text": "Our best-selling patio set"
}
```

**Response:**
```json
{
  "alt_text": "Wooden patio dining set with four chairs on a stone terrace",
  "confidence": 94,
  "image_type": "photo",
  "wcag_compliance": "pass",
  "processing_time_ms": 1250,
  "model": "gemini-2.5-flash"
}
```

---

## Industry Landing Pages

TheAltText includes 16 SEO-optimized landing pages with tailored compliance information:

| Industry | Lawsuit Risk | Avg Settlement |
|---|---|---|
| Healthcare | High | $25K–$75K |
| E-commerce | Very High | $15K–$75K |
| Education | High | $20K–$50K |
| Legal | Medium-High | $10K–$50K |
| Financial Services | High | $30K–$75K |
| Government | Mandatory | N/A |
| Real Estate | High | $15K–$50K |
| Restaurants | Medium-High | $5K–$25K |
| Nonprofit | Medium | $5K–$25K |
| Travel & Hospitality | High | $20K–$75K |
| Media & Publishing | Medium-High | $10K–$50K |
| SaaS & Technology | Medium | $15K–$50K |
| Insurance | High | $20K–$75K |
| Automotive | Medium-High | $10K–$50K |
| Construction | Medium | $5K–$25K |
| Fitness & Wellness | Medium | $5K–$25K |

---

## Project Structure

```
thealttext/
├── client/                    Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/             20+ page components
│   │   ├── components/        Navbar, Footer, UI components
│   │   ├── contexts/          Theme, Accessibility providers
│   │   └── data/              Industry landing page data
│   └── index.html
├── server/
│   ├── routers.ts             tRPC procedures (auth, alttext, bulk, apikeys, admin)
│   ├── apiRoutes.ts           REST API endpoints (/api/v1/*)
│   ├── db.ts                  Database query helpers
│   ├── plans.ts               Subscription plan configuration
│   ├── storage.ts             S3 file storage helpers
│   └── *.test.ts              Test files (40 tests)
├── drizzle/                   Database schema & migrations
├── shared/                    Shared types and constants
├── CHANGELOG.md               Version history
├── LICENSE                    Proprietary (All Rights Reserved)
└── README.md
```

---

## Running Tests

```bash
pnpm test
```

40 tests covering: authentication, subscriptions, alt text generation, bulk processing, API key management, admin functions, and industry data validation.

---

## Pages

The application includes 20+ pages:

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Hero, features, social proof, CTA |
| Pricing | `/pricing` | Plan comparison with upgrade flow |
| Features | `/features` | 12 feature cards with categories |
| Dashboard | `/dashboard` | Usage stats, compliance score, history |
| Generate | `/generate` | Single image alt text generation |
| Bulk | `/bulk` | Batch processing interface |
| API Keys | `/api-keys` | Key management (create, revoke) |
| API Docs | `/api-docs` | Developer documentation with examples |
| Settings | `/settings` | Account and subscription management |
| ROI Calculator | `/roi-calculator` | Cost savings calculator |
| Industries | `/industries` | Industry index page |
| Industry Detail | `/industries/:slug` | 16 industry-specific pages |
| Blog | `/blog` | Articles on accessibility |
| About | `/about` | Company and mission |
| Contact | `/contact` | Contact form |
| Changelog | `/changelog` | Version history |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |
| VPAT | `/vpat` | Accessibility template |
| Accessibility | `/accessibility-statement` | Accessibility statement |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All PRs are reviewed with [CodeRabbit](https://coderabbit.ai/) for automated code review.

---

## License

Copyright (c) 2024-2026 Audrey Evans / GlowStarLabs. All Rights Reserved.

This is proprietary software. See [LICENSE](LICENSE) for details.

---

## Links

- **GlowStarLabs Hub**: [meetaudreyevans.com](https://meetaudreyevans.com)
- **GlowStarLabs**: [glowstarlabs.com](https://glowstarlabs.com)
- **WCAG Guidelines**: [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Built with care for accessibility, sustainability, and the open web.*
*© 2024-2026 Audrey Evans / GlowStarLabs. All rights reserved.*
