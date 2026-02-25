import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Link } from "wouter";

const posts = [
  { slug: "ada-lawsuits-2026", title: "ADA Web Accessibility Lawsuits Hit Record High in 2026", excerpt: "Federal ADA lawsuits targeting websites increased 300% since 2018. Learn what this means for your business and how to protect yourself.", date: "Feb 25, 2026", readTime: "5 min", author: "Audrey Evans", category: "Compliance" },
  { slug: "wcag-21-guide", title: "The Complete Guide to WCAG 2.1 Alt Text Requirements", excerpt: "Everything you need to know about writing WCAG-compliant alt text, including examples for different image types.", date: "Feb 24, 2026", readTime: "8 min", author: "Audrey Evans", category: "Guide" },
  { slug: "ai-alt-text-accuracy", title: "How AI-Generated Alt Text Achieves 98% Accuracy", excerpt: "A deep dive into the vision AI technology behind TheAltText and how it generates contextually accurate descriptions.", date: "Feb 23, 2026", readTime: "6 min", author: "Audrey Evans", category: "Technology" },
  { slug: "ecommerce-accessibility", title: "Why E-commerce Sites Are the #1 Target for ADA Lawsuits", excerpt: "Product images without alt text are the most common ADA violation. Here's how to fix it at scale.", date: "Feb 22, 2026", readTime: "4 min", author: "Audrey Evans", category: "Industry" },
  { slug: "alt-text-seo-benefits", title: "Alt Text Isn't Just for Accessibility — It's an SEO Goldmine", excerpt: "Properly written alt text improves image search rankings, drives organic traffic, and boosts overall SEO performance.", date: "Feb 21, 2026", readTime: "5 min", author: "Audrey Evans", category: "SEO" },
  { slug: "section-508-compliance", title: "Section 508 Compliance: What Government Contractors Need to Know", excerpt: "Federal agencies and contractors must meet Section 508 standards. Here's how TheAltText helps you comply.", date: "Feb 20, 2026", readTime: "7 min", author: "Audrey Evans", category: "Compliance" },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Blog</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Insights on web accessibility, ADA compliance, and AI-powered solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {posts.map((post, i) => (
            <article key={i} className="glass-card overflow-hidden group hover:border-primary/20 transition-all">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{post.category}</span>
                </div>
                <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h2>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
