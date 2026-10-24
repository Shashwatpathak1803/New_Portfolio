# Shashwat Pathak's Portfolio

Personal portfolio showcasing web development projects, technical skills, AI integrations, and interactive experiences.

> An award-winning personal portfolio website built with Next.js 15, React, TypeScript, and Framer Motion. Designed to impress on first sight and engineered for performance.

## 🎯 Features

✨ **Premium Design**
- Dark futuristic aesthetic with glowing gradients
- Glassmorphism cards with subtle blur effects
- Animated mesh gradients and particle effects
- Smooth parallax and scroll-triggered animations

🎬 **Animation & Interaction**
- Cinematic page load sequence
- Letter-by-letter text reveals
- Magnetic button hover effects
- 3D tilt cards that follow mouse movement
- Smooth Lenis scroll with GSAP integration
- Scroll progress indicator

📱 **Fully Responsive**
- Desktop, tablet, and mobile optimized
- Touch-friendly interactions
- Adaptive typography and spacing
- Custom cursor (desktop only)

⚡ **Performance**
- Next.js 15 with App Router
- Lazy-loaded components
- Optimized images
- SEO-ready with metadata
- Accessibility-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or download the portfolio
cd portfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your EmailJS credentials (optional)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Environment Variables

Create `.env.local` for EmailJS integration (optional):

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

Get these from [EmailJS Dashboard](https://dashboard.emailjs.com/admin).

If not configured, the contact form will show a warning but won't break.

## 📝 Customization

### 1. Update Personal Information

Edit `lib/data.ts` to customize all content:

```typescript
export const profile = {
  name: "Your Name",
  roles: ["Your Role 1", "Your Role 2"],
  email: "your.email@domain.com",
  // ... more fields
};
```

All sections pull from `lib/data.ts`, so update once and it flows everywhere.

### 2. Replace Images

Place images in `public/images/`:
- `profile.jpg` — Your headshot (800×800px)
- `projects/` — Project screenshots (1280×800px)
- `og-cover.jpg` — Open Graph preview (1200×630px)

### 3. Update Resume

Replace `public/resume/Shashwat_Pathak_Resume.pdf` with your actual resume.

### 4. Customize Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  tangerine: "#FF7A1A", // Primary accent
  flame: "#FF4D17",  // Secondary accent
  gold: "#D4AF7A",   // Tertiary accent
  // ... more colors
}
```

Colors flow through gradients, glows, and borders automatically.

### 5. Change Fonts

Fonts are loaded in `app/layout.tsx`:

```typescript
const display = Bricolage_Grotesque(/* ... */);
const body = Inter(/* ... */);
const mono = JetBrains_Mono(/* ... */);
```

Swap these for any Google Font. Update the `@apply` rules in `globals.css` if needed.

### 6. Customize Animations

**Stagger delay in sections:**
```tsx
<RevealGroup stagger={0.15}>  {/* Change 0.15 to your value */}
```

**Particle field intensity:**
Open `components/ParticlesField.tsx` and adjust:
- `count` — Number of particles (900 default)
- `size` — Particle size (0.025 default)
- `opacity` — Visibility (0.65 default)

**Scroll speed:**
In `components/SmoothScrollProvider.tsx`:
```typescript
const lenis = new Lenis({
  duration: 1.2,  // Change this (higher = slower)
  easing: ...,
});
```

## 🎨 Design System

### Colors (Tailwind Config)
- `base` — Background (#090909)
- `surface` — Layered surfaces (#0F0F13, #15151B)
- `ink` — Text (#F5F5F0)
- `muted` — Secondary text (#9A9AA5)
- `tangerine` — Primary accent (#FF7A1A)
- `flame` — Secondary accent (#FF4D17)
- `cyan` — Tertiary (#22D3EE)
- `gold` — Accent (#D4AF7A)

### Typography
- **Display:** Bricolage Grotesque (headings)
- **Body:** Inter (paragraphs, UI)
- **Mono:** JetBrains Mono (code, stats)

### Spacing
Uses Tailwind's default scale (4px base):
- Sections: `section-padding` (5-8rem top/bottom)
- Cards: `p-6` or `p-7` (24-28px padding)
- Gaps: `gap-6` / `gap-8` (24-32px between items)

## 📂 Folder Structure

```
portfolio/
├── app/
│   ├── layout.tsx          # Root layout + fonts + metadata
│   ├── page.tsx            # Main page (all sections assembled)
│   ├── globals.css         # Global styles + utilities
│   ├── robots.ts           # SEO robots.txt
│   └── sitemap.ts          # SEO sitemap
├── components/
│   ├── ui/                 # shadcn-style components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   ├── AnimatedCounter.tsx # Counts up numbers on scroll
│   ├── About.tsx           # About section
│   ├── Contact.tsx         # Contact form + info cards
│   ├── CustomCursor.tsx    # Glowing mouse cursor
│   ├── Experience.tsx      # Timeline section
│   ├── Footer.tsx          # Footer with socials
│   ├── Hero.tsx            # Hero section
│   ├── Loader.tsx          # Intro loading screen
│   ├── MagneticButton.tsx  # Magnetic hover wrapper
│   ├── Navbar.tsx          # Fixed navigation
│   ├── ParticlesField.tsx  # React Three Fiber particles
│   ├── Projects.tsx        # Projects showcase
│   ├── Reveal.tsx          # Scroll-triggered animations
│   ├── ScrollProgress.tsx  # Top progress bar
│   ├── Services.tsx        # Services cards
│   ├── Skills.tsx          # Skills section
│   ├── SmoothScrollProvider.tsx  # Lenis + GSAP setup
│   ├── ThemeToggle.tsx     # Dark/light mode
│   └── TiltCard.tsx        # 3D mouse-following tilt
├── lib/
│   ├── data.ts             # Content (EDIT THIS!)
│   └── utils.ts            # cn() helper
├── public/
│   ├── images/
│   │   ├── profile.jpg
│   │   ├── projects/
│   │   │   ├── food-delivery.jpg
│   │   │   ├── ecommerce.jpg
│   │   │   ├── portfolio-v1.jpg
│   │   │   └── crm-tracker.jpg
│   │   ├── og-cover.jpg
│   │   └── favicon.ico
│   └── resume/
│       └── Shashwat_Pathak_Resume.pdf
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── .env.local.example
├── .gitignore
└── README.md (this file)
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in project settings
# NEXT_PUBLIC_EMAILJS_SERVICE_ID
# NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
# NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Other Platforms

**Netlify:**
```bash
npm run build
# Deploy the 'out' folder
```

**Self-hosted (Node.js):**
```bash
npm run build
npm start
```

## 🔧 Scripts

```bash
npm run dev      # Start dev server on :3000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📊 Performance Tips

1. **Compress images** before adding them to `public/images/`
2. **Use WebP format** for better compression
3. **Enable Vercel Image Optimization** if deployed on Vercel
4. **Monitor with Lighthouse** (`npm run build && npm start`, then DevTools → Lighthouse)

Target scores:
- Lighthouse Performance: >90
- Core Web Vitals: All green

## 🎯 Customization Checklist

- [ ] Edit `lib/data.ts` with your info
- [ ] Replace images in `public/images/`
- [ ] Add your resume to `public/resume/`
- [ ] Set up EmailJS and add `.env.local`
- [ ] Customize colors in `tailwind.config.ts`
- [ ] Test on mobile, tablet, desktop
- [ ] Check Lighthouse scores
- [ ] Deploy to Vercel or host of choice
- [ ] Update domain in metadata if needed

## 🐛 Troubleshooting

### Contact form not sending
- Check `.env.local` for EmailJS variables
- Verify service ID, template ID, and public key are correct
- Test email template in EmailJS dashboard

### Animations feel janky
- Disable Chrome DevTools while testing
- Check GPU acceleration in DevTools → Rendering → Paint flashing
- Reduce particle count if on low-end device

### Images not loading
- Ensure images are in `public/` directory
- Check image paths in `lib/data.ts`
- Use relative paths like `/images/profile.jpg`

### Scroll feels laggy
- Reduce particle count in `ParticlesField.tsx`
- Disable heavy animations on mobile
- Check DevTools Performance tab for bottlenecks

### Dark mode not persisting
- Check browser localStorage
- Clear site data and reload
- Verify `ThemeToggle.tsx` is mounted

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari 15+, Chrome Mobile)

## 📄 License

This portfolio template is provided as-is for personal use. Feel free to customize and use it however you'd like.

## 🙌 Credits

Built with:
- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [GSAP](https://gsap.com/)
- [Three.js / React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Lenis](https://lenis.darkroom.engineering/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://shadcn-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Made with ❤️ by Shashwat Pathak**

## 🔐 Admin Panel (`/admin`)

Edit everything on the site without touching code.

**Setup**
1. `npm install`
2. Copy `.env.local.example` → `.env.local` and fill `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`
3. `npm run dev` → open `/admin` and log in
4. On Vercel, add the same 4 env vars (Project → Settings → Environment Variables)

**What you can manage**
Profile, hero, resume & photo · section order / visibility / headings · about, highlights, stats · skills · experience · services · projects (reorder, hide, image upload) · tech marquee · contact info & form · messages inbox (read, star, reply, delete, CSV) · media library · SEO / Open Graph / noindex · theme, loader, cursor, footer · maintenance mode · page-view stats · password change · JSON backup / restore / reset.

Without `MONGODB_URI` the site simply shows the defaults from `lib/data.ts`.
