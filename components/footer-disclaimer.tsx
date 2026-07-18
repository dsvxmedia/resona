export function FooterDisclaimer() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-foreground/70">
          Resona is a portfolio demo built for Influur&apos;s AI Engineer role.
          It is not affiliated with Influur. The creator roster is synthetic,
          and the video analysis is real.
        </p>
        <a
          href="/Resona-Build-Explained.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
        >
          How this was built (PDF) →
        </a>
      </div>
    </footer>
  );
}
