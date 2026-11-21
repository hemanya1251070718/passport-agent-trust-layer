"use client";

import React, { useState, useEffect, useRef, useTransition, Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Cpu,
  FileCheck2,
} from "lucide-react";
import Logo from "@/components/Layout/Header/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces (TypeScript Strict Mode Compatible)
// ============================================================================

export interface NavSubItem {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly badge?: string;
}

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly badge?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly external?: boolean;
  readonly children?: readonly NavSubItem[];
}

export interface NavbarBrand {
  readonly name?: string;
  readonly logo?: ReactNode;
  readonly href?: string;
}

export interface NavbarUser {
  readonly displayName: string;
  readonly email?: string;
  readonly role?: string;
  readonly avatarUrl?: string;
}

export interface NavbarActions {
  readonly primary?: {
    readonly label: string;
    readonly onClick?: () => void;
    readonly href?: string;
  };
  readonly secondary?: {
    readonly label: string;
    readonly onClick?: () => void;
    readonly href?: string;
  };
}

export interface NavbarWithCenteredLinksProps {
  readonly brand?: NavbarBrand;
  readonly links?: readonly NavItem[];
  readonly actions?: NavbarActions;
  readonly user?: NavbarUser | null;
  readonly onSignOut?: () => void;
  readonly onSignInClick?: () => void;
  readonly onSignUpClick?: () => void;
  readonly systemStatus?: {
    readonly label: string;
    readonly status: "operational" | "degraded" | "evaluating";
  };
  readonly sticky?: boolean;
  readonly className?: string;
  readonly variant?: "default" | "glass" | "bordered";
}

// ============================================================================
// Default Navigation Items (Sensible Defaults for Passport Trust Platform)
// ============================================================================

export const DEFAULT_NAV_LINKS: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Cpu },
  { label: "Agents", href: "/agents", icon: Layers, badge: "Live" },
  { label: "Policies", href: "/policies", icon: Lock },
  { label: "Approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Wallet", href: "/wallet", icon: Activity },
  {
    label: "Verify",
    href: "/trust-report",
    icon: Sparkles,
    children: [
      {
        label: "Trust Report",
        href: "/trust-report",
        description: "Zero-Knowledge STARK proofs & verification engine",
        icon: Sparkles,
        badge: "ZKP",
      },
      {
        label: "Flight Recorder",
        href: "/audit",
        description: "SHA-256 hash-chained cryptographic ledger",
        icon: FileCheck2,
      },
      {
        label: "Policy Sandbox",
        href: "/sandbox",
        description: "Simulate adversarial payloads and kernel guardrails",
        icon: Lock,
        badge: "Safe",
      },
      {
        label: "Live Swarm Demo",
        href: "/demo",
        description: "Interactive real-time multi-agent negotiation testbed",
        icon: Activity,
      },
    ],
  },
  { label: "Docs", href: "/documentation", icon: FileCheck2 },
];

// ============================================================================
// 1. Production Error Boundary
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class NavbarErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[NavbarErrorBoundary] Caught navigation error:", error, errorInfo);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <header
          role="banner"
          className="w-full bg-background/95 border-b border-border/40 backdrop-blur-md px-4 py-3 sticky top-0 z-50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-sm text-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Passport</span>
            </Link>
            <span className="text-xs text-muted-foreground font-mono bg-destructive/10 text-destructive px-2 py-0.5 rounded">
              Emergency Safe Navigation
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/agents" className="text-muted-foreground hover:text-foreground">
              Agents
            </Link>
            <Link href="/policies" className="text-muted-foreground hover:text-foreground">
              Policies
            </Link>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-primary hover:underline font-mono"
            >
              Retry
            </button>
          </div>
        </header>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 2. Loading / Suspense Skeleton State
// ============================================================================

export function NavbarSkeleton({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading navigation"
      className={cn(
        "w-full h-18 border-b border-white/5 bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between",
        className
      )}
    >
      {/* Left brand shimmer */}
      <div className="flex-1 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
        <div className="w-28 h-5 rounded-md bg-white/5 animate-pulse hidden sm:block" />
      </div>

      {/* Center navigation links shimmer */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
        <div className="w-16 h-7 rounded-full bg-white/10 animate-pulse" />
        <div className="w-16 h-7 rounded-full bg-white/10 animate-pulse" />
        <div className="w-16 h-7 rounded-full bg-white/10 animate-pulse" />
        <div className="w-16 h-7 rounded-full bg-white/10 animate-pulse" />
        <div className="w-16 h-7 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Right actions shimmer */}
      <div className="flex-1 flex items-center justify-end gap-3">
        <div className="w-24 h-8 rounded-lg bg-white/5 animate-pulse hidden sm:block" />
        <div className="w-20 h-9 rounded-lg bg-primary/20 animate-pulse" />
      </div>
    </div>
  );
}

// ============================================================================
// 3. Navbar With Centered Links (Main Production Block)
// ============================================================================

export function NavbarWithCenteredLinks({
  brand,
  links = DEFAULT_NAV_LINKS,
  actions,
  user,
  onSignOut,
  onSignInClick,
  onSignUpClick,
  systemStatus = { label: "Zero-Trust Active", status: "operational" },
  sticky = true,
  className,
  variant = "glass",
}: NavbarWithCenteredLinksProps): React.JSX.Element {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [, startTransition] = useTransition();

  // Scroll detection for dynamic backdrop adaptation
  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    startTransition(() => {
      setMobileMenuOpen(false);
      setActiveDropdown(null);
    });
  }, [pathname]);

  const isLinkActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      role="banner"
      className={cn(
        "w-full transition-all duration-300 z-50",
        sticky ? "sticky top-0" : "relative",
        variant === "glass" && (
          isScrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] py-2.5"
            : "bg-background/40 backdrop-blur-md border-b border-white/5 py-3.5"
        ),
        variant === "bordered" && "bg-background border-b border-border py-3",
        variant === "default" && "bg-background/90 backdrop-blur-md py-3",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* ============================================================ */}
          {/* LEFT: Brand Logo & Wordmark (flex-1)                         */}
          {/* ============================================================ */}
          <div className="flex-1 flex items-center justify-start gap-4">
            <Link
              href={brand?.href || "/"}
              className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label="Passport Trust Home"
            >
              {brand?.logo ? (
                brand.logo
              ) : (
                <div className="flex items-center">
                  <Logo />
                </div>
              )}
            </Link>

            {/* Subtle Operational Health Pill */}
            <div
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 select-none"
              title="Autonomous Policy Enforcement Gateways Online"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{systemStatus.label}</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CENTER: Mathematical Centered Links                          */}
          {/* ============================================================ */}
          <nav
            role="navigation"
            aria-label="Primary Navigation"
            className="hidden lg:flex flex-shrink-0 items-center justify-center"
            ref={dropdownRef}
          >
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-md">
              {links.map((item) => {
                const active = isLinkActive(item.href);
                const hasChildren = item.children && item.children.length > 0;
                const isDropdownOpen = activeDropdown === item.label;

                if (hasChildren) {
                  return (
                    <div key={item.label} className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(isDropdownOpen ? null : item.label)}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                        className={cn(
                          "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          active || isDropdownOpen
                            ? "text-white bg-white/10 shadow-sm"
                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                      >
                        {item.icon && <item.icon className="w-3.5 h-3.5 opacity-80" />}
                        <span>{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-3 h-3 transition-transform duration-200 opacity-60",
                            isDropdownOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-2xl backdrop-blur-2xl p-2 z-50"
                          >
                            <div className="grid gap-1">
                              {item.children?.map((child) => (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className={cn(
                                    "flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 group/item",
                                    isLinkActive(child.href)
                                      ? "bg-primary/15 border border-primary/30 text-white"
                                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
                                  )}
                                >
                                  {child.icon ? (
                                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-primary group-hover/item:text-cyan-400 group-hover/item:border-cyan-500/30 transition-colors">
                                      <child.icon className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    <ShieldCheck className="w-4 h-4 mt-0.5 text-primary" />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground group-hover/item:text-white">
                                      <span>{child.label}</span>
                                      {child.badge && (
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] py-0 px-1 border-primary/40 text-primary font-mono"
                                        >
                                          {child.badge}
                                        </Badge>
                                      )}
                                    </div>
                                    {child.description && (
                                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                        {child.description}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      active
                        ? "text-white"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.icon && <item.icon className="w-3.5 h-3.5 opacity-80" />}
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary/20 text-cyan-300 font-mono border border-primary/30">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ============================================================ */}
          {/* RIGHT: Actions / User Profile / Mobile Toggle (flex-1)       */}
          {/* ============================================================ */}
          <div className="flex-1 flex items-center justify-end gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="text-white/90 font-mono font-medium max-w-[110px] truncate">
                    {user.displayName.split(" ")[0]}
                  </span>
                  {user.role && (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-1.5 border-primary/40 text-primary uppercase font-mono hidden sm:inline-flex"
                    >
                      {user.role}
                    </Badge>
                  )}
                </div>
                {onSignOut && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onSignOut}
                    className="border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs h-8 px-2.5 rounded-full transition-colors"
                    title="Sign Out"
                    aria-label="Sign out of account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                {actions?.secondary ? (
                  actions.secondary.href ? (
                    <Link
                      href={actions.secondary.href}
                      className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
                    >
                      {actions.secondary.label}
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={actions.secondary.onClick || onSignInClick}
                      className="text-xs font-medium text-white/70 hover:text-white px-3 h-8 rounded-full hover:bg-white/5"
                    >
                      {actions.secondary.label}
                    </Button>
                  )
                ) : (
                  onSignInClick && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onSignInClick}
                      className="text-xs font-medium text-white/80 hover:text-white px-3 h-8 rounded-full hover:bg-white/5"
                    >
                      Sign In
                    </Button>
                  )
                )}

                {actions?.primary ? (
                  actions.primary.href ? (
                    <Link
                      href={actions.primary.href}
                      className="text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                    >
                      {actions.primary.label}
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      onClick={actions.primary.onClick || onSignUpClick}
                      className="text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 px-4 h-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                    >
                      {actions.primary.label}
                    </Button>
                  )
                ) : (
                  onSignUpClick && (
                    <Button
                      size="sm"
                      onClick={onSignUpClick}
                      className="text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 px-4 h-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                    >
                      Sign Up
                    </Button>
                  )
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE DRAWER / OVERLAY                                      */}
      {/* ============================================================ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-b border-white/10 bg-zinc-950/98 backdrop-blur-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              {/* Mobile System Status */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-white/80 font-mono">{systemStatus.label}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 font-mono">
                  ACTIVE
                </Badge>
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {links.map((item) => {
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                        active
                          ? "bg-primary/20 text-white border border-primary/40 font-semibold"
                          : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {item.icon && <item.icon className="w-3.5 h-3.5 text-primary" />}
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[9px] px-1 py-0.2 rounded bg-primary/20 text-primary font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Sub-items list if any */}
              {links
                .filter((l) => l.children && l.children.length > 0)
                .map((parent) => (
                  <div key={parent.label} className="border-t border-white/5 pt-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-1">
                      {parent.label} Verification Suite
                    </span>
                    <div className="grid gap-1 mt-1">
                      {parent.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg text-xs transition-colors",
                            isLinkActive(child.href)
                              ? "bg-white/10 text-white font-medium"
                              : "text-muted-foreground hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {child.icon && <child.icon className="w-3.5 h-3.5 text-primary" />}
                            <span>{child.label}</span>
                          </span>
                          {child.badge && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-cyan-400 font-mono">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

              {/* Mobile Auth Actions */}
              <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                {user ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-white font-medium">{user.displayName}</span>
                    </div>
                    {onSignOut && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSignOut();
                        }}
                        className="text-xs h-7 px-2.5 border-white/20 text-white/70 hover:text-white"
                      >
                        Sign Out
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSignInClick?.();
                      }}
                      className="border-white/20 text-white hover:bg-white/10 text-xs h-9 rounded-xl"
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSignUpClick?.();
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs h-9 rounded-xl font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Default export for drop-in usage
export default NavbarWithCenteredLinks;
