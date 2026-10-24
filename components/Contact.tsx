"use client";

import { useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { Send, Mail, Github, Linkedin, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Reveal from "@/components/Reveal";
import FloatingShapes from "@/components/FloatingShapes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MagneticButton from "@/components/MagneticButton";
import { useContent } from "@/components/ContentProvider";

type Status = "idle" | "sending" | "success" | "error";

const infoIcons: Record<string, typeof Mail> = {
  Email: Mail,
  LinkedIn: Linkedin,
  GitHub: Github,
  Location: MapPin,
};

export default function Contact() {
  const { contact, sections } = useContent();
  const head = sections.items.contact;
  const contactInfo = contact.info;
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setStatus("sending");
    const form = formRef.current;
    const fd = new FormData(form);
    let saved = false;
    try {
      // 1) store in the admin inbox (MongoDB)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      saved = res.ok;
    } catch {
      /* fall through to EmailJS */
    }

    // 2) optional: also email it through EmailJS when its env vars are configured
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    let emailed = false;
    if (serviceId && templateId && publicKey) {
      try {
        await emailjs.sendForm(serviceId, templateId, form, { publicKey });
        emailed = true;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }

    if (saved || emailed) {
      setStatus("success");
      form.reset();
    } else setStatus("error");
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section id="contact" className="section-padding relative">
      <FloatingShapes side="left" />
      <div className="absolute inset-0 bg-mesh-1 opacity-30 -z-10" />
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal variant="fade-up">
          <p className="eyebrow mb-4">{head.eyebrow}</p>
        </Reveal>
        <Reveal variant="blur" delay={0.05}>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-14 max-w-2xl">
            {head.heading}
          </h2>
        </Reveal>

        <div className={contact.formEnabled ? "grid lg:grid-cols-[1fr_0.7fr] gap-10 [&>*]:min-w-0" : "grid max-w-xl gap-10"}>
          {contact.formEnabled && (
          <Reveal variant="fade-up" delay={0.1}>
            <form ref={formRef} onSubmit={handleSubmit} className="glass rounded-2xl p-5 sm:p-8 space-y-5">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="eyebrow mb-2 block">
                    Name
                  </label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div>
                  <label htmlFor="email" className="eyebrow mb-2 block">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" placeholder="you@email.com" required />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="eyebrow mb-2 block">
                  Subject
                </label>
                <Input id="subject" name="subject" placeholder="What's this about?" required />
              </div>

              <div>
                <label htmlFor="message" className="eyebrow mb-2 block">
                  Message
                </label>
                <Textarea id="message" name="message" placeholder="Tell me a bit more…" required />
              </div>

              <MagneticButton>
                <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto">
                  {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {status === "success" && <CheckCircle2 className="h-4 w-4" />}
                  {status === "error" && <AlertCircle className="h-4 w-4" />}
                  {status === "idle" && <Send className="h-4 w-4" />}
                  {status === "sending"
                    ? "Sending…"
                    : status === "success"
                    ? "Message Sent"
                    : status === "error"
                    ? "Couldn't Send — Try Again"
                    : "Send Message"}
                </Button>
              </MagneticButton>
            </form>
          </Reveal>
          )}

          <Reveal variant="fade-up" delay={0.2}>
            <div className="grid gap-5">
              {contactInfo.map((item, i) => {
                const Icon = infoIcons[item.label] ?? Mail;
                const content = (
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="glass rounded-2xl p-6 flex items-center gap-4 transition-shadow duration-500 hover:shadow-glow-accent"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/25 text-accent shrink-0">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="eyebrow mb-1">{item.label}</p>
                      <p className="text-sm text-ink/90 break-words">{item.value}</p>
                    </div>
                  </motion.div>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" data-cursor="hover">
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
