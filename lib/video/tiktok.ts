/**
 * TikTok URL normalization + oEmbed fetching + caption/hashtag extraction.
 *
 * No API key required — TikTok's oEmbed endpoint (https://www.tiktok.com/oembed)
 * is public and keyless. This file must never throw on bad/hostile input; every
 * exported function returns a typed result.
 */

// -------------------------------------------------------------------------
// normalizeTikTokUrl
// -------------------------------------------------------------------------

export type NormalizedTikTokUrl =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** TikTok's native share sheet copies short links from these hosts. */
const SHORT_LINK_HOSTS = new Set(['vm.tiktok.com', 'vt.tiktok.com']);

const VIDEO_PATH_RE = /^\/@([^/]+)\/video\/(\d+)/;

function isTikTokHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'tiktok.com' || h.endsWith('.tiktok.com');
}

/** Strips tracking query params/hash, keeps only the canonical @user/video/id path. */
function toCanonicalForm(url: URL): string {
  const match = VIDEO_PATH_RE.exec(url.pathname);
  if (!match) {
    url.hash = '';
    return `https://www.tiktok.com${url.pathname}`;
  }
  const [, user, id] = match;
  return `https://www.tiktok.com/@${user}/video/${id}`;
}

async function resolveRedirect(inputUrl: string): Promise<string | null> {
  const attempt = async (method: 'HEAD' | 'GET') => {
    const res = await fetch(inputUrl, {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    });
    return res.url || null;
  };

  try {
    return await attempt('HEAD');
  } catch {
    try {
      return await attempt('GET');
    } catch {
      return null;
    }
  }
}

export async function normalizeTikTokUrl(input: string): Promise<NormalizedTikTokUrl> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'Empty URL.' };

  let candidate: URL;
  try {
    candidate = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  const hostname = candidate.hostname.toLowerCase();

  if (!isTikTokHost(hostname) && !SHORT_LINK_HOSTS.has(hostname)) {
    return { ok: false, error: `"${hostname}" isn't a TikTok domain.` };
  }

  let resolvedUrl = candidate;

  const needsResolution =
    SHORT_LINK_HOSTS.has(hostname) ||
    (isTikTokHost(hostname) && candidate.pathname.startsWith('/t/'));

  if (needsResolution) {
    const finalHref = await resolveRedirect(candidate.toString());
    if (!finalHref) {
      return {
        ok: false,
        error: "Couldn't resolve that short link — the redirect target didn't respond.",
      };
    }
    try {
      resolvedUrl = new URL(finalHref);
    } catch {
      return { ok: false, error: 'Short link resolved to an invalid URL.' };
    }
    if (!isTikTokHost(resolvedUrl.hostname)) {
      return {
        ok: false,
        error: `Short link resolved to "${resolvedUrl.hostname}", not a TikTok domain.`,
      };
    }
  }

  if (!VIDEO_PATH_RE.test(resolvedUrl.pathname)) {
    return {
      ok: false,
      error:
        'That TikTok link doesn\'t point to a specific video (it may have expired or resolved to a profile/home page).',
    };
  }

  return { ok: true, url: toCanonicalForm(resolvedUrl) };
}

// -------------------------------------------------------------------------
// fetchTikTokOEmbed
// -------------------------------------------------------------------------

export type OEmbedResult =
  | {
      ok: true;
      data: {
        title: string;
        author_name: string;
        author_url: string;
        thumbnail_url: string;
        html: string;
      };
    }
  | { ok: false; error: string; suggestion: string };

const GENERIC_SUGGESTION =
  'This video might be private or deleted — try a different public TikTok link.';

export async function fetchTikTokOEmbed(canonicalUrl: string): Promise<OEmbedResult> {
  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`;

  let res: Response;
  try {
    res = await fetch(endpoint, { signal: AbortSignal.timeout(10_000) });
  } catch (err) {
    const isTimeout =
      err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return {
      ok: false,
      error: isTimeout
        ? 'Request to TikTok timed out.'
        : `Network error reaching TikTok: ${err instanceof Error ? err.message : String(err)}`,
      suggestion: isTimeout
        ? 'TikTok took too long to respond — try again in a moment.'
        : GENERIC_SUGGESTION,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `TikTok oEmbed returned HTTP ${res.status}.`,
      suggestion: GENERIC_SUGGESTION,
    };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return {
      ok: false,
      error: "TikTok returned a response that wasn't valid JSON.",
      suggestion: GENERIC_SUGGESTION,
    };
  }

  if (
    typeof json !== 'object' ||
    json === null ||
    typeof (json as Record<string, unknown>).title !== 'string' ||
    typeof (json as Record<string, unknown>).author_name !== 'string' ||
    typeof (json as Record<string, unknown>).thumbnail_url !== 'string' ||
    typeof (json as Record<string, unknown>).html !== 'string'
  ) {
    return {
      ok: false,
      error: "TikTok's oEmbed response was missing expected fields.",
      suggestion: GENERIC_SUGGESTION,
    };
  }

  const data = json as Record<string, unknown>;
  return {
    ok: true,
    data: {
      title: data.title as string,
      author_name: data.author_name as string,
      author_url: typeof data.author_url === 'string' ? data.author_url : '',
      thumbnail_url: data.thumbnail_url as string,
      html: data.html as string,
    },
  };
}

// -------------------------------------------------------------------------
// extractCaptionSignals
// -------------------------------------------------------------------------

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;

export function extractCaptionSignals(oembedTitle: string): {
  caption: string;
  hashtags: string[];
} {
  const hashtags = Array.from(oembedTitle.matchAll(HASHTAG_RE)).map(m => m[0]);
  const caption = oembedTitle.replace(HASHTAG_RE, '').replace(/\s{2,}/g, ' ').trim();
  return { caption, hashtags };
}
