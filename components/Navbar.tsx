"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContent } from "@/components/ContentProvider";
import type { SectionId } from "@/lib/types";

import ThemeToggle from "@/components/ThemeToggle";
import { scrollToId } from "@/lib/scroll";



const NAV_LABEL: Record<SectionId, string> = {
  about: "About",
  skills: "Skills",
  experience: "Experience",
  services: "Services",
  projects: "Projects",
  contact: "Contact",
};

export default function Navbar() {
  const pathname = usePathname();
  const isComposer = pathname === "/message-composer" || pathname === "/email-composer";
  const { profile, sections } = useContent();
  const links = sections.order
    .filter((id) => sections.items[id]?.visible)
    .map((id) => ({ id, label: NAV_LABEL[id] }));
  const [first, ...rest] = profile.name.split(" ");

  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [active, setActive] = useState(isComposer ? "message-composer" : "home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isComposer) {
      setOverHero(false);
      return;
    }
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // The hero is a bright 3D scene: while the navbar floats over it, use dark ink
      const hero = document.getElementById("home");
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      setOverHero(window.scrollY < heroBottom - 90);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isComposer]);

  useEffect(() => {
    const ids = ["home", ...links.map((l) => l.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links.length]);

  const goTo = (id: string) => {
    if (isComposer) {
      window.location.href = `/#${id}`;
    } else {
      scrollToId(id);
    }
    setMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        overHero && "nav-on-hero",
        scrolled ? "py-3" : "py-6"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div
          className={cn(
            "w-full flex items-center justify-between rounded-full transition-all duration-500",
            scrolled ? "glass py-2 px-4 sm:px-6 lg:px-8 shadow-glow-flame" : "py-0 px-2 lg:px-0"
          )}
        >
          <motion.button
            onClick={() => (isComposer ? (window.location.href = "/") : goTo("home"))}
            data-cursor="hover"
            className="flex items-center gap-2 shrink-0"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-ink" aria-hidden="true">
              <path d="m8 7-5 5 5 5" />
              <path d="m16 7 5 5-5 5" />
              <path d="m13.5 5-3 14" />
            </svg>
            <span className="font-display font-semibold text-lg tracking-tight text-ink whitespace-nowrap">{first} <span className="text-gradient">{rest.join(" ")}</span></span>
          </motion.button>

          <nav className="hidden xl:flex items-center gap-6 2xl:gap-8">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => goTo(link.id)}
                data-cursor="hover"
                className={cn(
                  "relative whitespace-nowrap font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-300",
                  !isComposer && active === link.id ? "text-ink" : "text-muted hover:text-ink"
                )}
              >
                {link.label}
                {!isComposer && active === link.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-accent to-teal"
                  />
                )}
              </button>
            ))}
            <Link
              href="/message-composer"
              data-cursor="hover"
              className={cn(
                "relative whitespace-nowrap font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-300",
                isComposer ? "text-ink font-semibold" : "text-muted hover:text-ink"
              )}
            >
              Message Composer
              {isComposer && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-accent to-teal"
                />
              )}
            </Link>
          </nav>

          <div className="hidden xl:flex items-center gap-4 2xl:gap-5 shrink-0">
            <motion.a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                goTo("contact");
              }}
              data-cursor="hover"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "whitespace-nowrap rounded-full px-6 py-[11px] text-sm font-semibold shadow-[0_4px_18px_rgba(0,0,0,0.25)] transition-all duration-500",
                overHero ? "bg-[#EDE0C8] text-[#123B40] hover:bg-white" : "bg-accent text-white shadow-glow-accent hover:brightness-110"
              )}
            >
              Contact Us
            </motion.a>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <ThemeToggle />
            <button
              className="text-ink"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="xl:hidden mt-3 glass rounded-2xl p-6 flex flex-col gap-4 max-h-[calc(100svh-6rem)] overflow-y-auto"
            >
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => goTo(link.id)}
                  className="text-left font-mono text-sm uppercase tracking-[0.15em] text-muted hover:text-ink py-1"
                >
                  {link.label}
                </button>
              ))}
              <Link
                href="/message-composer"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "text-left font-mono text-sm uppercase tracking-[0.15em] py-1 transition-colors",
                  isComposer ? "text-accent font-semibold" : "text-muted hover:text-ink"
                )}
              >
                Message Composer
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
