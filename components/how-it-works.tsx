import { Video, Search, Send } from 'lucide-react';

const STEPS = [
  {
    icon: Video,
    title: 'Analyze',
    desc: "Real Claude vision classifies your reference video's storytelling pattern, pacing, and energy.",
  },
  {
    icon: Search,
    title: 'Match',
    desc: 'Embeddings find candidate creators, then a deterministic formula scores and ranks them.',
  },
  {
    icon: Send,
    title: 'Draft',
    desc: 'Personalized outreach gets drafted for your top picks, citing the actual match reasoning. Never sent.',
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {STEPS.map(({ icon: Icon, title, desc }, i) => (
        <div key={title} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="size-4 text-primary" />
            </span>
            <span className="text-xs text-muted-foreground">Step {i + 1}</span>
          </div>
          <h3 className="font-heading text-base font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>
  );
}
