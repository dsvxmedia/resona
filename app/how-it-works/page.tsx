import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Resona works',
  description: 'How the Resona demo works, and how to get the most out of it.',
};

export default function HowItWorks() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <div>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to Resona
        </Link>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight">
          How this demo works
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          A short guide to what happens when you click &quot;Find my creators,&quot; and how
          to get the most out of it.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">What happens on a run</h2>
        <p className="text-sm text-muted-foreground">
          Every run does three real things, in order, streamed live to the screen:
        </p>
        <ol className="flex flex-col gap-3 text-sm">
          <li>
            <span className="font-medium text-foreground">1. Analyze.</span>{' '}
            <span className="text-muted-foreground">
              If you paste a TikTok URL, a real Claude vision call looks at the actual video
              and classifies its storytelling pattern, pacing, and energy. No TikTok URL,
              no fake result, that stage is just skipped.
            </span>
          </li>
          <li>
            <span className="font-medium text-foreground">2. Match.</span>{' '}
            <span className="text-muted-foreground">
              Your brief (and the video signal, if there is one) gets embedded with a real
              OpenAI embeddings call, then compared against a synthetic 33-creator roster
              using cosine similarity. A transparent, unit-tested scoring formula, not an
              LLM, ranks the candidates.
            </span>
          </li>
          <li>
            <span className="font-medium text-foreground">3. Draft.</span>{' '}
            <span className="text-muted-foreground">
              Claude Haiku drafts a short, personalized outreach message for each of the
              top matches, citing the actual match reasoning. These are drafts only. Nothing
              is ever sent.
            </span>
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">What to actually type in</h2>
        <p className="text-sm text-muted-foreground">
          The form comes pre-filled so you can just click through, but the fields that
          actually move the results are:
        </p>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Genre / vibe</span> and{' '}
            <span className="font-medium text-foreground">Target audience</span> carry the
            most weight in matching. Change both together for a genuinely different result,
            changing just one and leaving the other on a dance/TikTok default will keep
            pulling toward dance-oriented creators.
          </li>
          <li>
            <span className="font-medium text-foreground">TikTok reference URL</span> is
            optional but adds a second real signal (the video&apos;s actual pacing and energy) on
            top of the text brief. Any public tiktok.com URL works, not just the pre-filled
            one.
          </li>
          <li>
            <span className="font-medium text-foreground">Budget</span> filters which
            creators are affordable per-creator before ranking, it does not affect who wins
            the ranking itself.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">
          Why the same input gives the same result
        </h2>
        <p className="text-sm text-muted-foreground">
          The creator ranking is deliberately deterministic, not an LLM improvising a score.
          Same brief text in, same embedding, same ranking out, every time. That is by
          design: it means the score breakdown you see is something you can actually trust
          and audit, not a number a model made up on the spot. Only the drafted outreach
          messages vary between runs, since those come from a live generation call, the
          creator selection itself will not change unless the brief genuinely does.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-medium">What is real, what is not</h2>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Real:</span> video classification,
            embeddings, the scoring math, the drafted outreach copy, all live API calls made
            when you click submit.
          </li>
          <li>
            <span className="font-medium text-foreground">Synthetic:</span> the 33-creator
            roster. These are not real people, they are a hand-authored dataset built to
            demonstrate the matching pipeline.
          </li>
          <li>
            <span className="font-medium text-foreground">Never sent:</span> outreach drafts
            are for review only. This demo does not contact anyone.
          </li>
        </ul>
      </section>

      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Try it yourself
        </Link>
        <a
          href="/Resona-Build-Explained.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Read the full behind-the-scenes build writeup (PDF) →
        </a>
      </div>
    </div>
  );
}
