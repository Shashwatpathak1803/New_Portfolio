import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Inter, JetBrains_Mono, Noto_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });

// Italic serif used for the big hero name (matches the 3D scene's editorial look)
const serifDisplay = Noto_Serif_Display({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-serif-display",
  display: "swap",
});

// Hero headline font (Aurora hero)
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500"] });

// Title / description / OG tags are generated per-page from the admin panel (see app/(site)/layout.tsx).
export const metadata: Metadata = { icons: { icon: "/favicon.ico" } };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { settings } = await getContent();
  const def = settings.defaultTheme === "dark" ? "dark" : "light";

  return (
    <html lang="en" className={def} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint (falls back to the default chosen in the admin panel) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'${def}';var r=document.documentElement;if(t==='dark'){r.classList.remove('light');r.classList.add('dark')}else{r.classList.add('light');r.classList.remove('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${display.variable} ${serifDisplay.variable} ${body.variable} ${mono.variable} ${jakarta.variable} font-body antialiased text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
