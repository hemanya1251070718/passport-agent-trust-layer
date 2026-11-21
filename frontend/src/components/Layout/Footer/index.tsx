import React, { FC } from "react";
import Link from "next/link";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "../Header/Logo";
import { Separator } from "@/components/ui/separator";
import { Github, Globe, Shield, ExternalLink } from "lucide-react";

const Footer: FC = () => {
  return (
    <footer className="pt-16 bg-background border-t border-white/10">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 lg:gap-16 md:gap-8 gap-8 pb-14">
          {/* Col 1: Brand & Overview */}
          <div className="sm:col-span-12 lg:col-span-5 flex flex-col gap-5">
            <Logo />
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              Passport is the open-source zero-trust identity, policy, and treasury control plane
              for autonomous AI agents. Built for Homingo Hack Days 2026.
            </p>
            <div className="flex gap-4 items-center">
              <Link
                href="https://github.com/hemanya1251070718/passport-agent-trust-layer"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-primary hover:border-primary/40 transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="https://passport-trust-gateway-58223756937.asia-south1.run.app"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-primary hover:border-primary/40 transition-colors"
                title="Live Cloud Run Gateway"
              >
                <Globe className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Col 2: Product Pages */}
          <div className="sm:col-span-6 lg:col-span-4">
            <h4 className="text-white mb-4 font-semibold text-lg">Product & Control Plane</h4>
            <div className="grid grid-cols-2 gap-2">
              <ul className="space-y-2.5">
                <li>
                  <Link href="/dashboard" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/agents" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Agent Passes
                  </Link>
                </li>
                <li>
                  <Link href="/policies" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Policy Engine
                  </Link>
                </li>
                <li>
                  <Link href="/approvals" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Approvals Queue
                  </Link>
                </li>
              </ul>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/wallet" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Sandboxed Wallet
                  </Link>
                </li>
                <li>
                  <Link href="/audit" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Audit Flight Recorder
                  </Link>
                </li>
                <li>
                  <Link href="/trust-report" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Trust Report (Red-Team)
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="text-white/70 hover:text-primary text-sm transition-colors">
                    Deterministic Demo
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Resources & Docs */}
          <div className="sm:col-span-6 lg:col-span-3">
            <h4 className="text-white mb-4 font-semibold text-lg">Developer Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/documentation" className="text-white/70 hover:text-primary text-sm transition-colors">
                  API & SDK Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="https://passport-trust-gateway-58223756937.asia-south1.run.app/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-primary text-sm transition-colors inline-flex items-center gap-1.5"
                >
                  FastAPI OpenAPI Specs
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://passport-trust-gateway-58223756937.asia-south1.run.app/api/v1/auth/jwks"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-primary text-sm transition-colors inline-flex items-center gap-1.5"
                >
                  RFC 8037 JWKS Keys
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/sandbox" className="text-white/70 hover:text-primary text-sm transition-colors">
                  Interactive Attack Sandbox
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            © 2026 Passport. Open-source under MIT License. Built for Homingo Hack Days.
          </p>
          <p>
            Template UI by{" "}
            <Link
              className="hover:text-primary text-white/70 underline underline-offset-2"
              target="_blank"
              href="https://shadcnspace.com/"
            >
              shadcnspace.com
            </Link>{" "}
            (MIT)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
