import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Wand2, Image as ImageIcon, Video, Layers, Zap, Palette, Download, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BrandShot AI — Create. Edit. Transform." },
      { name: "description", content: "Turn one photo into professional-grade images, designs and videos. AI creative studio for creators and businesses. 5 free credits on signup." },
      { property: "og:title", content: "BrandShot AI — Create. Edit. Transform." },
      { property: "og:description", content: "Turn one photo into content that looks professionally made. 5 free credits on signup." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TransformDemo />
      <WhatYouCanCreate />
      <FeatureBlock
        eyebrow="AI Studio"
        title="Studio-quality photos, without the studio."
        body="Make products, portraits, food and outfits look professionally shot. Change backgrounds, remove distractions, or generate a full advertisement from a single upload."
        icon={<Wand2 className="h-5 w-5" />}
        align="left"
      />
      <FeatureBlock
        eyebrow="Magic Editor"
        title="Design without the learning curve."
        body="Add text, adjust layers, swap backgrounds and drop in logos. The tools you need appear when you need them — nothing more."
        icon={<Palette className="h-5 w-5" />}
        align="right"
      />
      <FeatureBlock
        eyebrow="Video Studio"
        title="Short videos that stop the scroll."
        body="Pick a template, drop in your images, and export polished vertical or horizontal videos. No timeline gymnastics required."
        icon={<Video className="h-5 w-5" />}
        align="left"
      />
      <HowItWorks />
      <UseCases />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">BrandShot AI</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#studio" className="transition-colors hover:text-foreground">AI Studio</a>
          <a href="#editor" className="transition-colors hover:text-foreground">Magic Editor</a>
          <a href="#video" className="transition-colors hover:text-foreground">Video</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">Login</Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Creating
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
      <Sparkles className="h-4 w-4" />
    </span>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="container-page relative pt-16 pb-20 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/60 px-3 py-1 text-xs text-muted-foreground shadow-soft" style={{ animationDelay: "50ms" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-soft-pulse" />
            5 free AI credits on signup
          </div>
          <h1 className="animate-fade-up mt-6 text-display text-5xl text-foreground md:text-7xl" style={{ animationDelay: "150ms" }}>
            Turn one photo into content that looks <em className="font-normal text-primary">professionally made</em>.
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg" style={{ animationDelay: "300ms" }}>
            Create polished photos, designs and videos with AI — without needing professional editing skills.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "450ms" }}>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Creating Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransformDemo() {
  const steps = [
    { label: "Original", tone: "bg-muted", icon: <ImageIcon className="h-6 w-6 text-muted-foreground" /> },
    { label: "AI Result", tone: "bg-primary/10", icon: <Sparkles className="h-6 w-6 text-primary" /> },
    { label: "Editable Design", tone: "bg-accent", icon: <Layers className="h-6 w-6 text-accent-foreground" /> },
    { label: "Video", tone: "bg-foreground/5", icon: <Video className="h-6 w-6 text-foreground" /> },
  ];
  return (
    <section id="features" className="container-page py-16 md:py-24">
      <div className="surface-card overflow-hidden p-6 shadow-lift md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">One upload. Endless output.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {steps.map((s, i) => (
            <div key={s.label} className="group relative">
              <div className={`aspect-[4/5] rounded-xl ${s.tone} flex items-center justify-center border border-border/60 transition-transform duration-300 ease-out group-hover:-translate-y-1`}>
                {s.icon}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{s.label}</span>
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatYouCanCreate() {
  const items = [
    { title: "Product photos", body: "Studio-grade shots for your store." },
    { title: "Personal portraits", body: "Turn a phone photo into a polished headshot." },
    { title: "Ads & social", body: "Ready-to-post creative in seconds." },
    { title: "Food & menu", body: "Appetising visuals for delivery & socials." },
    { title: "Fashion & outfits", body: "Editorial-style looks from any snapshot." },
    { title: "Short videos", body: "Vertical, square or horizontal — with music." },
  ];
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-display text-3xl md:text-5xl">What can you create?</h2>
        <p className="mt-4 text-muted-foreground">Personal photos to full campaigns. BrandShot adapts to what you're making.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <div key={i.title} className="surface-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft">
            <h3 className="text-base font-semibold text-foreground">{i.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureBlock({ eyebrow, title, body, icon, align }: { eyebrow: string; title: string; body: string; icon: React.ReactNode; align: "left" | "right" }) {
  const id = eyebrow.toLowerCase().split(" ")[0];
  return (
    <section id={id} className="container-page py-16 md:py-24">
      <div className={`grid gap-10 md:grid-cols-2 md:items-center ${align === "right" ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-muted-foreground">
            <span className="text-primary">{icon}</span>
            {eyebrow}
          </div>
          <h2 className="mt-4 text-display text-3xl md:text-5xl">{title}</h2>
          <p className="mt-4 max-w-md text-muted-foreground">{body}</p>
        </div>
        <div className="surface-card aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 via-accent to-surface-elevated p-8 shadow-lift">
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <span className="text-primary/60">{icon}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload", d: "Drop in any image from your phone or computer." },
    { n: "02", t: "Choose your goal", d: "Product photo, background swap, ad, or video." },
    { n: "03", t: "Let AI work", d: "BrandShot generates options you can refine." },
    { n: "04", t: "Edit & export", d: "Polish in the Magic Editor and download." },
  ];
  return (
    <section id="how" className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-display text-3xl md:text-5xl">Four steps. Done.</h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="surface-card p-6">
            <span className="text-xs font-mono text-primary">{s.n}</span>
            <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function UseCases() {
  const groups = [
    { t: "For creators & individuals", items: ["Personal photos", "Social content", "Portraits", "Artwork"] },
    { t: "For businesses", items: ["Product shots", "Advertisements", "Menus & food", "Brand videos"] },
  ];
  return (
    <section className="container-page py-16 md:py-24">
      <div className="grid gap-6 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.t} className="surface-card p-8">
            <h3 className="text-display text-2xl">{g.t}</h3>
            <ul className="mt-6 space-y-3">
              {g.items.map((i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-display text-3xl md:text-5xl">Start free. Upgrade when you need more.</h2>
        <p className="mt-4 text-muted-foreground">Every new account gets 5 AI credits. Editing is always free.</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="surface-card p-8">
          <p className="text-sm font-medium text-muted-foreground">Free</p>
          <p className="mt-3 text-display text-4xl">$0</p>
          <p className="mt-1 text-sm text-muted-foreground">5 AI credits on signup</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <PricingLine>Full editor & video studio</PricingLine>
            <PricingLine>Unlimited manual editing</PricingLine>
            <PricingLine>Private project library</PricingLine>
          </ul>
        </div>
        <div className="surface-card border-primary/40 p-8 shadow-glow">
          <p className="text-sm font-medium text-primary">Pro (coming soon)</p>
          <p className="mt-3 text-display text-4xl">—</p>
          <p className="mt-1 text-sm text-muted-foreground">Monthly credits & higher limits</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <PricingLine>More AI generations</PricingLine>
            <PricingLine>Higher-resolution exports</PricingLine>
            <PricingLine>Brand Kit & priority queue</PricingLine>
          </ul>
        </div>
      </div>
    </section>
  );
}

function PricingLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-foreground">
      <Check className="h-4 w-4 text-primary" />
      {children}
    </li>
  );
}

function FAQ() {
  const qs = [
    { q: "Do I need editing experience?", a: "No. BrandShot is designed so a total beginner can go from upload to export in under a minute." },
    { q: "What counts as one credit?", a: "Manual editing is free. AI operations (making a product photo professional, changing a background, generating an ad, rendering a video) use credits." },
    { q: "Are my uploads private?", a: "Yes. Your files are stored in your private space and are only accessible to you." },
    { q: "Can I use it for a business?", a: "Yes — BrandShot works for personal creators, e-commerce, food, fashion, agencies and more." },
  ];
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-display text-3xl md:text-5xl">Questions.</h2>
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface-elevated">
          {qs.map((q) => (
            <details key={q.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
                {q.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="surface-card relative overflow-hidden bg-foreground p-10 text-background shadow-lift md:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-display text-4xl md:text-6xl">Ready when you are.</h2>
          <p className="mt-4 text-background/70">Sign up in 30 seconds. Your first 5 credits are on us.</p>
          <div className="mt-8">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Creating Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-sm font-medium">BrandShot AI</span>
        </div>
        <p className="text-xs text-muted-foreground">Create. Edit. Transform. © {new Date().getFullYear()} BrandShot AI.</p>
      </div>
    </footer>
  );
}
