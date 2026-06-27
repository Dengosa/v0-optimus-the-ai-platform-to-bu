export default function CareersPage() {
  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="mb-12">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Careers</div>
          <h1 className="mt-4 text-4xl lg:text-6xl font-display tracking-tight">Built by people who care.</h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
            Kommune is on a mission to give every migrant the tools to survive, thrive, and belong — wherever they are in the world.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-2">Our mission</div>
            <h2 className="text-2xl font-display mb-3">Migrant-led. Community-first.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We believe technology should serve the people who need it most. Migrants around the world face legal barriers, financial exclusion, and administrative complexity every day. Kommune exists to change that.
            </p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-2">Who we want</div>
            <h2 className="text-2xl font-display mb-3">Builders with purpose.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not care where you went to school. We care what you have built, who you have helped, and whether you understand what it means to navigate life in a country that was not made for you.
            </p>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-6">Open roles</div>
          <div className="space-y-4">
            {[
              { role: "Legal Research Intern", type: "Internship", description: "Help us map the legal landscape for migrants globally. Immigration law, asylum processes, permit pathways across different countries." },
              { role: "Community Growth Intern", type: "Internship", description: "Help us reach migrant communities worldwide. WhatsApp, Facebook groups, on the ground." },
              { role: "Product Intern", type: "Internship", description: "Work directly with the founder on features, user research, and making Kommune feel like it was built for real people." },
              { role: "AI & Engineering Intern", type: "Internship", description: "Help build and improve the AI agents. Python, FastAPI, Next.js. Passion for impact required." },
              { role: "Full Stack Engineer", type: "Coming Soon", description: "Senior role opening as we scale. Next.js, FastAPI, Supabase. Equity on the table." },
              { role: "Head of Partnerships", type: "Coming Soon", description: "NGOs, clinics, legal aid orgs, banks. We need someone to build our global ecosystem." },
            ].map((job) => (
              <div key={job.role} className="rounded-2xl border border-foreground/10 bg-background p-6 flex items-start justify-between gap-6">
                <div>
                  <div className="font-medium text-base">{job.role}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{job.description}</div>
                </div>
                <span className={`shrink-0 font-mono text-xs px-3 py-1 rounded-full border ${job.type === "Internship" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-foreground/5 text-muted-foreground border-foreground/10"}`}>
                  {job.type}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8 text-center">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3">Apply</div>
          <h2 className="text-2xl font-display mb-3">Ready to build something that matters?</h2>
          <p className="text-sm text-muted-foreground mb-6">Send us a short note about who you are and why Kommune. No CV required.</p>
          <a href="mailto:hello@kommune.app" className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-8 h-12 text-sm font-medium hover:bg-foreground/90 transition-colors">
            Get in touch
          </a>
        </div>
      </div>
    </main>
  );
}
