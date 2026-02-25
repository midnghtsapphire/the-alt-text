# TheAltText - Project TODO

## Database & Schema
- [x] Subscriptions table (plan, status, Stripe IDs, usage limits)
- [x] Image analyses table (image URL, generated alt text, confidence, context)
- [x] API keys table (key hash, user, rate limits, usage)
- [x] API usage logs table
- [x] Scan history table (bulk processing jobs)

## Backend / tRPC Routers
- [x] AI alt text generation via built-in LLM (vision model)
- [x] Bulk image processing endpoint
- [x] Subscription management (create/cancel/upgrade)
- [x] Stripe checkout session creation (prepared)
- [ ] Stripe webhook handler (requires Stripe MCP setup)
- [x] API key management (create/revoke/list)
- [x] Developer API endpoint (REST-style via Express)
- [x] Dashboard stats (usage, compliance score, images processed)
- [x] Admin dashboard router

## Frontend Pages
- [x] Landing page (hero, features, social proof, CTA)
- [x] Pricing page (Free/Pro/Enterprise tiers)
- [x] Dashboard (usage stats, compliance score, recent activity)
- [x] Image upload & alt text generator
- [x] Bulk processing page
- [x] API keys management page
- [x] Settings/Profile page
- [x] ROI calculator
- [x] Features page
- [x] About page
- [x] Contact page
- [x] Blog page
- [x] Changelog page
- [x] API Documentation page

## Design & Theme
- [x] Glassmorphism dark theme (CSS variables, backdrop-blur)
- [x] Neurodivergent accessibility mode
- [x] ECO CODE mode (low power)
- [x] No Blue Light mode (warm amber/sepia)
- [x] Responsive mobile-first design
- [x] Custom fonts (Inter + Atkinson Hyperlegible)
- [x] Accessibility toggle in navbar
- [x] AccessibilityContext provider

## SEO Landing Pages (16 industries)
- [x] Healthcare / Medical
- [x] E-commerce / Retail
- [x] Education / Universities
- [x] Legal / Law Firms
- [x] Real Estate
- [x] Financial Services / Banking
- [x] Government / Public Sector
- [x] Restaurants / Food Service
- [x] Travel / Hospitality
- [x] Nonprofits
- [x] Technology / SaaS
- [x] Media / Publishing
- [x] Insurance
- [x] Automotive
- [x] Construction / Trades
- [x] Fitness & Wellness
- [x] Industry index page

## Legal Pages
- [x] Privacy Policy
- [x] Terms of Service
- [x] VPAT (Voluntary Product Accessibility Template)
- [x] Accessibility Statement

## Documentation & Compliance
- [x] CHANGELOG.md
- [x] LICENSE (All Rights Reserved - Audrey Evans / GlowStarLabs)
- [x] README.md (comprehensive)
- [x] API documentation page
- [x] Plans configuration (plans.ts)

## Testing
- [x] Auth logout test
- [x] AI generation router tests
- [x] Subscription router tests
- [x] API key management tests
- [x] Dashboard stats tests
- [x] Bulk processing tests
- [x] Admin stats tests
- [x] Industry data validation tests
- [x] Plans configuration tests
- [x] All 40 tests passing

## Deployment
- [ ] Push to MIDNGHTSAPPHIRE/the-alt-text
- [x] Attribution footer for API providers
