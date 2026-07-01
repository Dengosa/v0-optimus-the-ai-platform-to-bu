export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="mb-12">
          <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Terms</div>
          <h1 className="mt-4 text-4xl lg:text-5xl font-display tracking-tight">How Kommune works.</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            The short version of what you're agreeing to when you activate Kommune.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">What you get</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A once-off payment of R300 gives you lifetime access to Kommune's five AI agents (legal, credit, health, education, journey planning), your Vault, and one transferable Support Pass for a friend. There is no subscription and no recurring fee.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">What Kommune is — and is not</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kommune's agents give you information and draft actions (letters, applications, dispute submissions) based on publicly available rules and processes. Kommune is not a law firm, a bank, or a medical provider, and nothing an agent tells you is a substitute for advice from a qualified professional in a specific, serious situation. Where a case is complex or urgent, our agents route it to a human reviewer at a partner organisation.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">Refunds</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you pay and your account is not activated within 48 hours of payment confirmation, or Kommune is unable to assist with your case at all, email hello@kommune.app for a full refund.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">Your responsibilities</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Information you give your agents should be accurate to the best of your knowledge — agents act on what you tell them. Documents you upload to your Vault should be your own.
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3">Changes</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these terms as Kommune grows. If a change materially affects what you're entitled to, we will notify active users by email or WhatsApp before it takes effect.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6 lg:p-8">
            <h2 className="text-xl font-display mb-3 text-yellow-700">A note on this page</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is a plain-language summary, not finalised legal terms. It will be reviewed by a lawyer before full launch.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
