import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type LegalPageProps = {
  title: string;
  content: { heading: string; text: string }[];
};

function LegalPage({ title, content }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20 container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 25, 2026</p>
          <div className="space-y-8">
            {content.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-semibold mb-3">{section.heading}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      content={[
        { heading: "Information We Collect", text: "We collect information you provide directly, including account registration data (name, email), images you upload for processing, and usage data. We do not store your images after processing unless you explicitly save them to your account." },
        { heading: "How We Use Your Information", text: "We use your information to provide and improve our alt text generation service, process payments, communicate with you about your account, and ensure compliance with applicable laws." },
        { heading: "Data Retention", text: "Uploaded images are processed in real-time and not stored on our servers beyond the processing session. Generated alt text and metadata are stored in your account for your reference. You can delete your data at any time from your dashboard." },
        { heading: "Third-Party Services", text: "We use third-party services for payment processing (Stripe), AI processing, and analytics. These services have their own privacy policies governing the use of your information." },
        { heading: "Security", text: "We implement industry-standard security measures including encryption in transit (TLS 1.3), encryption at rest, and regular security audits. API keys are hashed before storage." },
        { heading: "Your Rights", text: "You have the right to access, correct, or delete your personal information. Contact privacy@thealttext.com for data requests." },
        { heading: "Contact", text: "For privacy-related inquiries, contact privacy@thealttext.com." },
      ]}
    />
  );
}

export function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      content={[
        { heading: "Acceptance of Terms", text: "By accessing or using TheAltText, you agree to be bound by these Terms of Service. If you do not agree, do not use the service." },
        { heading: "Service Description", text: "TheAltText provides AI-powered alt text generation for images. While we strive for accuracy, generated alt text should be reviewed before deployment to production websites. We do not guarantee 100% WCAG compliance without human review." },
        { heading: "Account Responsibilities", text: "You are responsible for maintaining the confidentiality of your account credentials and API keys. You agree not to share API keys or allow unauthorized access to your account." },
        { heading: "Usage Limits", text: "Each subscription plan has defined usage limits. Exceeding these limits may result in service throttling or additional charges. Abuse of the service, including automated scraping or reselling, is prohibited." },
        { heading: "Intellectual Property", text: "TheAltText and all associated intellectual property are owned by Audrey Evans / GlowStarLabs. Generated alt text becomes your property upon generation. You retain all rights to your uploaded images." },
        { heading: "Limitation of Liability", text: "TheAltText is provided 'as is' without warranties of any kind. We are not liable for any damages arising from the use of generated alt text, including but not limited to ADA compliance failures." },
        { heading: "Termination", text: "We reserve the right to terminate accounts that violate these terms. You may cancel your subscription at any time." },
      ]}
    />
  );
}

export function Vpat() {
  return (
    <LegalPage
      title="Voluntary Product Accessibility Template (VPAT)"
      content={[
        { heading: "Product Information", text: "Product: TheAltText\nVersion: 1.0.0\nDate: February 25, 2026\nVendor: GlowStarLabs (Audrey Evans)" },
        { heading: "WCAG 2.1 Level AA Conformance", text: "TheAltText is designed to conform to WCAG 2.1 Level AA standards. Our application includes:\n\n• Semantic HTML structure with proper heading hierarchy\n• ARIA labels and roles for interactive elements\n• Keyboard navigation support throughout the application\n• Color contrast ratios meeting AA standards (4.5:1 for normal text)\n• Focus indicators on all interactive elements\n• Screen reader compatible interface\n• Three accessibility modes: Neurodivergent, ECO CODE, No Blue Light" },
        { heading: "Section 508 Compliance", text: "TheAltText supports Section 508 compliance requirements for federal agencies and contractors. Our API enables automated alt text generation for government websites." },
        { heading: "Known Limitations", text: "• AI-generated alt text should be reviewed by a human for critical content\n• Some complex images (charts, infographics) may require manual refinement\n• Third-party embedded content may not meet all accessibility standards" },
        { heading: "Contact", text: "For accessibility-related inquiries or to request this VPAT in an alternative format, contact accessibility@thealttext.com." },
      ]}
    />
  );
}

export function AccessibilityStatement() {
  return (
    <LegalPage
      title="Accessibility Statement"
      content={[
        { heading: "Our Commitment", text: "TheAltText is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying relevant accessibility standards." },
        { heading: "Standards", text: "We aim to conform to WCAG 2.1 Level AA standards. Our application is designed with accessibility as a core principle, not an afterthought." },
        { heading: "Accessibility Features", text: "• Three priority accessibility modes: Neurodivergent (high contrast, reduced motion), ECO CODE (low power), No Blue Light (warm amber palette)\n• Full keyboard navigation\n• Screen reader optimized\n• Semantic HTML with proper ARIA attributes\n• High contrast color schemes\n• Resizable text without loss of functionality\n• Clear focus indicators" },
        { heading: "Feedback", text: "We welcome your feedback on the accessibility of TheAltText. Please contact us at accessibility@thealttext.com if you encounter any barriers." },
      ]}
    />
  );
}
