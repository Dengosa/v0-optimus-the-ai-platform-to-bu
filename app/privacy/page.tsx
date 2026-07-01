export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="mb-12">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Privacy</div>
          <h1 className="mt-4 text-4xl lg:text-5xl font-display tracking-tight">Your data, your control.</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            We know many people using Kommune are worried about who sees their information. This page explains exactly what we collect, why, and who it goes to — in plain language.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">What we collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your email or WhatsApp number, the messages you send our agents, and any documents you choose to upload to your Vault (such as permits, leases, or letters). We do not collect more than we need to help you.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">Who can see it</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is visible to you, to the Kommune system that powers your agents, and — only when a case needs human review (for example, a complex legal matter) — to a trained reviewer at one of our partner organisations. We do not sell your data, and we do not share it with advertisers.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">Home Affairs, police, and other authorities</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kommune does not proactively report your status, your case details, or your documents to Home Affairs, the police, or any immigration authority. We do not exist to monitor you. That said, like any organisation operating in South Africa, Kommune could be legally compelled by a valid court order to disclose specific information. We are telling you this honestly rather than promising something we cannot guarantee — if this matters to your situation, please also speak to one of our legal partners (Scalabrini, LHR, or SIHMA) about what protections apply to you.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">How it is stored</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Documents in your Vault are encrypted at rest (AES-256). Every action taken on your behalf is logged so you can see exactly what happened and when — this record is for your protection, not surveillance.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">Your rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can ask us what data we hold about you, correct it, or request that it be deleted, at any time. Email us at hello@kommune.app and we will respond within a reasonable time, in line with South Africa's Protection of Personal Information Act (POPIA).
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3 text-yellow-700">A note on this page</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is a plain-language summary, not a substitute for formal legal advice. Kommune is a young platform and this policy will be reviewed and finalised with a POPIA-qualified lawyer before full launch.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
