'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/magnetic';
import { EASE_OUT } from '@/lib/motion';

export interface CampaignBrief {
  song: string;
  vibe: string;
  audience: string;
  budgetUsd: number;
  tiktokUrl: string;
}

interface BriefFormProps {
  onSubmit: (brief: CampaignBrief) => void;
  disabled?: boolean;
  urlError?: string;
}

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.28, ease: EASE_OUT },
  }),
};

export function BriefForm({ onSubmit, disabled, urlError }: BriefFormProps) {
  const [song, setSong] = useState('Neon Tide');
  const [vibe, setVibe] = useState('latin pop / afrobeats crossover, high-energy summer anthem');
  const [audience, setAudience] = useState('18-24, US/MX, dance-forward TikTok culture');
  const [budgetUsd, setBudgetUsd] = useState(25000);
  const [tiktokUrl, setTiktokUrl] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ song, vibe, audience, budgetUsd, tiktokUrl });
  }

  return (
    <Card className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Campaign brief</CardTitle>
          <CardDescription>
            Tell Resona about the song. It&apos;ll analyze a reference video and match it
            against the creator roster.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fieldVariants}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="song">Song / artist</Label>
              <Input
                id="song"
                value={song}
                onChange={e => setSong(e.target.value)}
                required
                disabled={disabled}
              />
            </div>
          </motion.div>
          <motion.div custom={1} initial="hidden" animate="visible" variants={fieldVariants}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vibe">Genre / vibe</Label>
              <Textarea
                id="vibe"
                value={vibe}
                onChange={e => setVibe(e.target.value)}
                required
                disabled={disabled}
                rows={2}
              />
            </div>
          </motion.div>
          <motion.div custom={2} initial="hidden" animate="visible" variants={fieldVariants}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="audience">Target audience</Label>
              <Input
                id="audience"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                required
                disabled={disabled}
              />
            </div>
          </motion.div>
          <motion.div custom={3} initial="hidden" animate="visible" variants={fieldVariants}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                step={1}
                value={budgetUsd}
                onChange={e => setBudgetUsd(Number(e.target.value) || 0)}
                required
                disabled={disabled}
              />
            </div>
          </motion.div>
          <motion.div custom={4} initial="hidden" animate="visible" variants={fieldVariants}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tiktokUrl">TikTok reference URL</Label>
              <Input
                id="tiktokUrl"
                type="url"
                value={tiktokUrl}
                onChange={e => setTiktokUrl(e.target.value)}
                placeholder="Paste any public TikTok video URL, or try your own"
                disabled={disabled}
                aria-invalid={!!urlError}
              />
              {urlError && <p className="text-sm text-destructive">{urlError}</p>}
            </div>
          </motion.div>
        </CardContent>
        <CardFooter>
          <Magnetic className="w-full" strength={0.3}>
            <Button type="submit" disabled={disabled} className="w-full">
              {disabled ? 'Analyzing…' : 'Find my creators'}
            </Button>
          </Magnetic>
        </CardFooter>
      </form>
    </Card>
  );
}
