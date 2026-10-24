"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Instagram, Mail, ArrowUp, Twitter, Youtube, Globe } from "lucide-react";
import { useContent } from "@/components/ContentProvider";
import { scrollToTop } from "@/lib/scroll";

export default function Footer() {
  const { profile, settings } = useContent();
  const [first, ...rest] = profile.name.split(" ");
  const socials = [
    { icon: Github, href: profile.social.github, label: "GitHub" },
    { icon: Linkedin, href: profile.social.linkedin, label: "LinkedIn" },
    { icon: Instagram, href: profile.social.instagram, label: "Instagram" },
    { icon: Twitter, href: profile.social.twitter, label: "X / Twitter" },
    { icon: Youtube, href: profile.social.youtube, label: "YouTube" },
    { icon: Globe, href: profile.social.website, label: "Website" },
    { icon: Mail, href: profile.social.email, label: "Email" },
  ].filter((s) => s.href);

  return (
    <footer className="relative pt-16 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent mb-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-display text-lg font-semibold tracking-tight">
            {first} <span className="text-gradient">{rest.join(" ")}</span>
          </p>

          <div className="flex items-center gap-5">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                data-cursor="hover"
                className="text-muted hover:text-accent transition-colors duration-300"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3 }}
            data-cursor="hover"
            aria-label="Back to top"
            className="flex h-10 w-10 items-center justify-center rounded-full glass text-muted hover:text-ink hover:shadow-glow-accent transition-all duration-300"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        </div>

        <p className="mt-10 text-center sm:text-left font-mono text-xs text-muted">
          © {new Date().getFullYear()} {profile.name}. {settings.footerText}
        </p>
      </div>
    </footer>
  );
}
