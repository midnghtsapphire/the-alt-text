import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-20 container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Questions about pricing, enterprise features, or accessibility compliance? We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Mail, title: "Email", desc: "support@thealttext.com", sub: "Response within 24 hours" },
              { icon: MessageSquare, title: "Sales", desc: "sales@thealttext.com", sub: "Enterprise & custom plans" },
              { icon: Building2, title: "Partnerships", desc: "partners@thealttext.com", sub: "Agency & integration partners" },
            ].map((c, i) => (
              <div key={i} className="glass-card p-5 text-center">
                <c.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-primary">{c.desc}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 max-w-2xl mx-auto">
            {submitted ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-success-green mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
                <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-semibold text-lg mb-2">Send us a message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name</label>
                    <Input placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input type="email" placeholder="you@company.com" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Subject</label>
                  <Input placeholder="How can we help?" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea placeholder="Tell us more..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
