# Changelog

All notable changes to TheAltText will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-25

### Added

#### Core Features
- AI-powered alt text generation using vision AI (Gemini 2.5 Flash via built-in LLM)
- WCAG 2.1 AA compliance checking with confidence scoring
- Single image processing via URL input
- Bulk image processing (up to 100 images per batch) for Pro and Enterprise users
- Developer REST API at `/api/v1/generate-alt-text` with Bearer token authentication
- Bulk API endpoint at `/api/v1/bulk-generate` for batch processing
- API health check endpoint at `/api/v1/health`

#### User Management & Authentication
- OAuth-based authentication
- Role-based access control (user, admin)
- User settings page with subscription management

#### Subscription & Billing
- Three-tier pricing model: Free ($0/mo), Pro ($29/mo), Enterprise ($99/mo)
- Free tier: 50 images/month, single upload only
- Pro tier: 2,000 images/month, bulk upload, API access (5,000 calls/mo)
- Enterprise tier: 25,000 images/month, unlimited bulk, API access (50,000 calls/mo)
- Stripe payment integration ready (checkout flow prepared)

#### Dashboard & Analytics
- User dashboard with usage statistics and compliance score
- Images processed counter with monthly tracking
- Average confidence score display
- Recent activity feed with processing history
- Admin dashboard with platform-wide statistics

#### API Key Management
- Create and manage API keys with `tat_live_` prefix
- API key hashing (SHA-256) for secure storage
- Rate limiting per key (60 req/min Pro, 120 req/min Enterprise)
- Monthly usage tracking per key
- Key revocation support

#### Accessibility
- Three priority accessibility modes:
  - **Neurodivergent Mode**: High contrast, reduced motion, Atkinson Hyperlegible font
  - **ECO CODE Mode**: Minimal animations, reduced visual complexity, energy-saving
  - **No Blue Light Mode**: Warm amber palette, blue light elimination
- Accessibility mode toggle in navigation bar
- WCAG 2.1 AA compliant interface
- Full keyboard navigation support
- Screen reader optimized
- Semantic HTML with proper ARIA attributes

#### Frontend
- Glassmorphism dark theme with backdrop blur effects
- Responsive design (mobile-first)
- React 19 + TypeScript + Vite + Tailwind CSS 4
- shadcn/ui component library
- Framer Motion animations
- 20+ pages including:
  - Landing page with hero, features, social proof, CTA sections
  - Pricing page with plan comparison
  - Features page with 12 feature cards
  - ROI Calculator for cost savings estimation
  - API Documentation page with code examples
  - Blog page with 6 articles
  - About, Contact, Changelog pages
  - Privacy Policy, Terms of Service, VPAT, Accessibility Statement

#### SEO & Industry Landing Pages
- 16 industry-specific landing pages:
  - Healthcare, E-commerce, Education, Legal
  - Financial Services, Government, Real Estate, Restaurants
  - Nonprofit, Travel & Hospitality, Media & Publishing
  - SaaS & Technology, Insurance, Automotive
  - Construction, Fitness & Wellness
- Each page includes: compliance requirements, pain points, benefits, statistics
- Industry index page at `/industries`
- SEO-optimized meta titles and descriptions

#### Documentation
- Comprehensive README.md with setup instructions
- API documentation with curl examples
- VPAT (Voluntary Product Accessibility Template)
- Proprietary LICENSE (All Rights Reserved)

#### Testing
- 40 unit tests across 2 test files
- Tests cover: auth, subscriptions, alt text generation, bulk processing, API keys, admin, industry data
- Vitest test runner with mocked database and LLM

### Technical Stack
- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: MySQL/TiDB via Drizzle
- **AI**: Built-in LLM (vision-capable) for image analysis
- **Auth**: OAuth with JWT sessions
- **Testing**: Vitest
