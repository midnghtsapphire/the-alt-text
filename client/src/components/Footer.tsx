import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Tax Software Attribution */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Tax Software</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Powered by open-source tax tools:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com/ustaxes/UsTaxes" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  UsTaxes
                </a>
                <span className="text-muted-foreground"> - Federal 1040 filing</span>
              </li>
              <li>
                <a 
                  href="https://github.com/habutax/habutax" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  HabuTax
                </a>
                <span className="text-muted-foreground"> - Tax computation engine</span>
              </li>
              <li>
                <a 
                  href="https://github.com/PSLmodels/Tax-Calculator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Tax-Calculator
                </a>
                <span className="text-muted-foreground"> - Policy analysis</span>
              </li>
              <li>
                <a 
                  href="https://github.com/habutax/ustaxlib" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ustaxlib
                </a>
                <span className="text-muted-foreground"> - Tax form framework</span>
              </li>
            </ul>
          </div>

          {/* Security Tools Attribution */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Security Tools</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Powered by open-source security software:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://wazuh.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Wazuh
                </a>
                <span className="text-muted-foreground"> - SIEM & XDR</span>
              </li>
              <li>
                <a 
                  href="https://nmap.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Nmap
                </a>
                <span className="text-muted-foreground"> - Network scanner</span>
              </li>
              <li>
                <a 
                  href="https://www.metasploit.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Metasploit
                </a>
                <span className="text-muted-foreground"> - Penetration testing</span>
              </li>
              <li>
                <a 
                  href="https://www.wireshark.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Wireshark
                </a>
                <span className="text-muted-foreground"> - Network analysis</span>
              </li>
              <li>
                <a 
                  href="https://github.com/projectdiscovery/nuclei" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Nuclei
                </a>
                <span className="text-muted-foreground"> - Vulnerability scanner</span>
              </li>
              <li>
                <a 
                  href="https://arkime.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Arkime
                </a>
                <span className="text-muted-foreground"> - Packet capture</span>
              </li>
            </ul>
          </div>

          {/* APIs & Data Sources */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">APIs & Data Sources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.bls.gov/developers/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Bureau of Labor Statistics API
                </a>
              </li>
              <li>
                <a 
                  href="https://www.census.gov/data/developers.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  U.S. Census Bureau API
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ssrn.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  SSRN Research Papers
                </a>
              </li>
              <li>
                <a 
                  href="https://openrouter.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenRouter AI
                </a>
                <span className="text-muted-foreground"> - Expense categorization</span>
              </li>
            </ul>
          </div>

          {/* Code Quality & Tools */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Code Quality</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Built with modern, type-safe tools:
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.typescriptlang.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  TypeScript
                </a>
              </li>
              <li>
                <a 
                  href="https://vitest.dev/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vitest
                </a>
              </li>
              <li>
                <a 
                  href="https://eslint.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ESLint
                </a>
              </li>
              <li>
                <a 
                  href="https://trpc.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  tRPC
                </a>
              </li>
              <li>
                <a 
                  href="https://orm.drizzle.team/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Drizzle ORM
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Code review powered by:
              </p>
              <a 
                href="https://coderabbit.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                CodeRabbit AI
              </a>
              <span className="text-muted-foreground text-sm"> - Free automated code review</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              All code undergoes rigorous review before deployment.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Mechatronopolis - Interdisciplinary Engineering Hub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/partners">
              <a className="text-muted-foreground hover:text-primary transition-colors">
                Partners
              </a>
            </Link>
            <Link href="/sources">
              <a className="text-muted-foreground hover:text-primary transition-colors">
                Sources
              </a>
            </Link>
            <Link href="/changelog">
              <a className="text-muted-foreground hover:text-primary transition-colors">
                Changelog
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
