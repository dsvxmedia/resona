import { embedMany } from 'ai';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { models, EMBEDDING_DIMENSIONS } from '../lib/ai/models';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface RawCreator {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  follower_count: number;
  engagement_rate: number;
  avg_views: number;
  genres: string[];
  region: string;
  base_rate_usd: number;
  sound_usage_rate: number;
  completion_reliability: number;
  content_tags: string[];
  profile_text: string;
}

// Synthetic, clearly-fictional creator roster — labeled as such throughout the app.
const creators: RawCreator[] = [
  {
    id: 'luzmaria-moves', handle: 'luzmaria.moves', display_name: 'Luz Maria',
    bio: 'Dancer and choreographer from Guadalajara turning latin pop hooks into 15-second routines that actually get repeated.',
    follower_count: 42_000, engagement_rate: 0.071, avg_views: 65_000,
    genres: ['latin pop', 'afrobeats'], region: 'MX', base_rate_usd: 350,
    sound_usage_rate: 0.82, completion_reliability: 0.95,
    content_tags: ['dance_performance', 'beat_synced_cuts', 'high_energy', 'neon'],
    profile_text: 'Luz Maria is a Guadalajara-based dancer and choreographer known for turning latin pop and afrobeats hooks into tight, repeatable 15-second routines. Her rapid, beat-synced cuts and neon-lit studio setup consistently drive sound adoption among her 42k highly-engaged followers, who show up specifically for new choreography drops.',
  },
  {
    id: 'kwame-frames', handle: 'kwame.frames', display_name: 'Kwame Adjei',
    bio: 'Lagos-based creator blending afrobeats energy with cinematic street footage.',
    follower_count: 128_000, engagement_rate: 0.038, avg_views: 210_000,
    genres: ['afrobeats', 'pop'], region: 'NG', base_rate_usd: 900,
    sound_usage_rate: 0.61, completion_reliability: 0.88,
    content_tags: ['vibe_montage', 'cinematic', 'golden_hour', 'chill'],
    profile_text: 'Kwame Adjei films cinematic afrobeats montages across Lagos streets and rooftops, pairing golden-hour visuals with a relaxed, vibe-forward pacing. His content favors mood over spectacle, and his audience trusts his sound picks enough that features regularly spike outside his usual region.',
  },
  {
    id: 'daniela-cortes', handle: 'daniela.cortes', display_name: 'Daniela Cortes',
    bio: 'Bogotá pop-culture commentator with a sharp comedic edit style.',
    follower_count: 875_000, engagement_rate: 0.019, avg_views: 640_000,
    genres: ['pop', 'latin pop'], region: 'CO', base_rate_usd: 4200,
    sound_usage_rate: 0.22, completion_reliability: 0.7,
    content_tags: ['comedic_skit', 'rapid_cuts', 'chaotic_fun'],
    profile_text: 'Daniela Cortes built a large Bogota-based following on rapid-fire comedic skits reacting to pop culture, with chaotic, high-cut-rate editing. Sound usage is inconsistent since comedy often overrides music trends, but reach is substantial when a sound does land.',
  },
  {
    id: 'jinsoo-edits', handle: 'jinsoo.edits', display_name: 'Jin-soo Park',
    bio: 'Seoul-based editor specializing in K-pop-adjacent transition edits.',
    follower_count: 310_000, engagement_rate: 0.045, avg_views: 480_000,
    genres: ['pop', 'EDM/dance'], region: 'KR', base_rate_usd: 1800,
    sound_usage_rate: 0.74, completion_reliability: 0.93,
    content_tags: ['transition_edit', 'rapid_cuts', 'studio_clean', 'high_energy'],
    profile_text: 'Jin-soo Park produces studio-clean transition edits synced tightly to drop moments, drawing heavily from K-pop editing conventions but applying them to any high-energy pop or dance track. Reliability is excellent — content ships on schedule and sound adoption among followers is strong.',
  },
  {
    id: 'amara-lights', handle: 'amara.lights', display_name: 'Amara Whitfield',
    bio: 'London R&B vocalist doing acoustic-to-full-production sound reveals.',
    follower_count: 19_000, engagement_rate: 0.088, avg_views: 22_000,
    genres: ['R&B', 'pop'], region: 'UK', base_rate_usd: 200,
    sound_usage_rate: 0.9, completion_reliability: 0.97,
    content_tags: ['hook_payoff', 'intimate', 'moody_dark', 'single_take'],
    profile_text: 'Amara Whitfield is a small but fiercely engaged London R&B creator who performs acoustic-to-full-production reveals of new songs, single-take and intimate in a moodily lit bedroom studio. Her followers are music-discovery focused and her sound-adoption rate is exceptional relative to her size.',
  },
  {
    id: 'theo-bpm', handle: 'theo.bpm', display_name: 'Theo Marchetti',
    bio: 'Berlin EDM DJ posting rooftop and warehouse set clips.',
    follower_count: 640_000, engagement_rate: 0.026, avg_views: 510_000,
    genres: ['EDM/dance'], region: 'DE', base_rate_usd: 3100,
    sound_usage_rate: 0.55, completion_reliability: 0.8,
    content_tags: ['dance_performance', 'beat_synced_cuts', 'high_energy', 'moody_dark'],
    profile_text: 'Theo Marchetti shares warehouse and rooftop DJ set clips from Berlin, all beat-synced with high energy and moody lighting. His scale gives sounds broad reach, though engagement rate trails smaller, more intimate creators in the roster.',
  },
  {
    id: 'priya-frames', handle: 'priya.frames', display_name: 'Priya Nair',
    bio: 'Mumbai lifestyle creator with a day-in-the-life format and pop soundtracks.',
    follower_count: 260_000, engagement_rate: 0.034, avg_views: 190_000,
    genres: ['pop', 'indie'], region: 'IN', base_rate_usd: 1400,
    sound_usage_rate: 0.48, completion_reliability: 0.91,
    content_tags: ['pov_storytelling', 'golden_hour', 'chill', 'cinematic'],
    profile_text: 'Priya Nair produces cinematic day-in-the-life content from Mumbai, favoring golden-hour lighting, POV storytelling, and a chill emotional register. Music selection is deliberate rather than trend-chasing, which means lower volume but higher-intent sound adoption when she does feature a track.',
  },
  {
    id: 'mateus-flow', handle: 'mateus.flow', display_name: 'Mateus Silva',
    bio: 'São Paulo hip-hop freestyler with rapid-response trend edits.',
    follower_count: 95_000, engagement_rate: 0.052, avg_views: 130_000,
    genres: ['hip-hop'], region: 'BR', base_rate_usd: 700,
    sound_usage_rate: 0.69, completion_reliability: 0.85,
    content_tags: ['hook_payoff', 'rapid_cuts', 'chaotic_fun', 'high_energy'],
    profile_text: 'Mateus Silva freestyles rapid-response hip-hop content out of São Paulo, chasing trending sounds within hours of release. His content is high-energy and slightly chaotic by design, and his audience rewards fast, hook-forward turnarounds with strong sound uptake.',
  },
  {
    id: 'ines-quietframes', handle: 'ines.quietframes', display_name: 'Inès Delacroix',
    bio: 'Paris indie creator making slow-pan aesthetic films with original-sounding soundtracks.',
    follower_count: 31_000, engagement_rate: 0.063, avg_views: 28_000,
    genres: ['indie'], region: 'FR', base_rate_usd: 320,
    sound_usage_rate: 0.58, completion_reliability: 0.9,
    content_tags: ['vibe_montage', 'slow_pan', 'grainy_lofi', 'intimate'],
    profile_text: 'Inès Delacroix shoots slow-pan, grainy lo-fi aesthetic films from Paris apartments and cafés, favoring intimate indie soundtracks over trending pop. Her audience is small but highly loyal, prizing discovery over virality, which shows up as unusually strong completion reliability.',
  },
  {
    id: 'destiny-glow', handle: 'destiny.glow', display_name: 'Destiny Cole',
    bio: 'Atlanta beauty-and-music crossover creator with studio-clean transitions.',
    follower_count: 1_900_000, engagement_rate: 0.012, avg_views: 1_100_000,
    genres: ['pop', 'hip-hop'], region: 'US', base_rate_usd: 9500,
    sound_usage_rate: 0.15, completion_reliability: 0.6,
    content_tags: ['transition_edit', 'studio_clean', 'chaotic_fun'],
    profile_text: 'Destiny Cole is a large-scale Atlanta creator crossing beauty content with music transitions in a studio-clean style. Reach is massive, but music is a secondary focus behind beauty, so sound-usage rate and reliability lag well behind smaller music-first creators in the roster.',
  },
  {
    id: 'noor-basslines', handle: 'noor.basslines', display_name: 'Noor Haddad',
    bio: 'Dubai-based DJ and producer covering afrobeats-to-EDM crossovers.',
    follower_count: 180_000, engagement_rate: 0.041, avg_views: 155_000,
    genres: ['EDM/dance', 'afrobeats'], region: 'AE', base_rate_usd: 1100,
    sound_usage_rate: 0.72, completion_reliability: 0.89,
    content_tags: ['dance_performance', 'beat_synced_cuts', 'neon', 'high_energy'],
    profile_text: 'Noor Haddad produces afrobeats-to-EDM crossover sets from Dubai clubs, beat-synced and neon-lit with consistently high energy. She reliably drives sound adoption in the crossover space between the two genres, a niche few other creators in the roster occupy.',
  },
  {
    id: 'sofia-rewind', handle: 'sofia.rewind', display_name: 'Sofia Reyes Muñoz',
    bio: 'Madrid pop creator doing before-after glow-up edits set to hook drops.',
    follower_count: 410_000, engagement_rate: 0.029, avg_views: 340_000,
    genres: ['pop', 'latin pop'], region: 'ES', base_rate_usd: 2200,
    sound_usage_rate: 0.5, completion_reliability: 0.86,
    content_tags: ['before_after', 'hook_payoff', 'studio_clean', 'high_energy'],
    profile_text: 'Sofia Reyes Muñoz makes before-after glow-up edits from Madrid timed precisely to a song\'s hook drop. Format is repeatable and well-tested for sound adoption, though her audience skews toward general pop trends rather than niche discovery.',
  },
  {
    id: 'caleb-porch', handle: 'caleb.porch', display_name: 'Caleb Whitmore',
    bio: 'Nashville indie-pop songwriter posting porch session covers and originals.',
    follower_count: 14_000, engagement_rate: 0.095, avg_views: 16_000,
    genres: ['indie', 'pop'], region: 'US', base_rate_usd: 150,
    sound_usage_rate: 0.85, completion_reliability: 0.98,
    content_tags: ['single_take', 'intimate', 'grainy_lofi', 'chill'],
    profile_text: 'Caleb Whitmore posts single-take porch session covers and originals from Nashville, grainy and lo-fi by choice. Despite a small following, his engagement and completion reliability are among the strongest in the roster — his audience shows up specifically for the music.',
  },
  {
    id: 'zanele-motion', handle: 'zanele.motion', display_name: 'Zanele Dube',
    bio: 'Johannesburg dancer bringing amapiano-influenced choreography to afrobeats.',
    follower_count: 205_000, engagement_rate: 0.047, avg_views: 175_000,
    genres: ['afrobeats'], region: 'ZA', base_rate_usd: 1200,
    sound_usage_rate: 0.79, completion_reliability: 0.92,
    content_tags: ['dance_performance', 'beat_synced_cuts', 'high_energy', 'golden_hour'],
    profile_text: 'Zanele Dube choreographs amapiano-influenced routines to afrobeats tracks from Johannesburg, shot in warm golden-hour light with tight beat-synced cuts. Sound adoption is consistently high and reliable, making her a dependable pick for afrobeats-adjacent campaigns.',
  },
  {
    id: 'ryo-tapes', handle: 'ryo.tapes', display_name: 'Ryo Tanaka',
    bio: 'Tokyo bedroom-pop producer sharing lo-fi process videos.',
    follower_count: 58_000, engagement_rate: 0.054, avg_views: 51_000,
    genres: ['indie', 'pop'], region: 'JP', base_rate_usd: 480,
    sound_usage_rate: 0.66, completion_reliability: 0.9,
    content_tags: ['tutorial_format', 'grainy_lofi', 'chill', 'intimate'],
    profile_text: 'Ryo Tanaka shares grainy, tutorial-style bedroom-pop production process videos from Tokyo, chill and intimate in tone. His audience skews toward musicians and producers, giving sound features a credible, discovery-oriented reach.',
  },
  {
    id: 'valentina-loop', handle: 'valentina.loop', display_name: 'Valentina Rossi',
    bio: 'Milan fashion-and-music creator with cinematic runway-style edits.',
    follower_count: 720_000, engagement_rate: 0.021, avg_views: 590_000,
    genres: ['pop'], region: 'IT', base_rate_usd: 3800,
    sound_usage_rate: 0.33, completion_reliability: 0.75,
    content_tags: ['vibe_montage', 'cinematic', 'studio_clean', 'moody_dark'],
    profile_text: 'Valentina Rossi blends fashion and music in cinematic, runway-style edits from Milan, studio-clean with a moody undertone. Scale is strong but music is one thread among several content pillars, so sound-usage rate is moderate relative to her reach.',
  },
  {
    id: 'obi-freestyle', handle: 'obi.freestyle', display_name: 'Obinna Eze',
    bio: 'Toronto hip-hop and afrobeats creator known for duet-bait call-and-response clips.',
    follower_count: 145_000, engagement_rate: 0.043, avg_views: 120_000,
    genres: ['hip-hop', 'afrobeats'], region: 'CA', base_rate_usd: 950,
    sound_usage_rate: 0.7, completion_reliability: 0.87,
    content_tags: ['duet_bait', 'hook_payoff', 'chaotic_fun', 'high_energy'],
    profile_text: 'Obinna Eze creates duet-bait, call-and-response clips blending hip-hop and afrobeats from Toronto, high energy and built for participation. Sound adoption spreads fast through his duet chains, a distinct distribution pattern from straight montage creators.',
  },
  {
    id: 'harper-static', handle: 'harper.static', display_name: 'Harper Quinn',
    bio: 'Sydney alt-pop creator making moody lip-sync performances.',
    follower_count: 76_000, engagement_rate: 0.058, avg_views: 68_000,
    genres: ['pop', 'indie'], region: 'AU', base_rate_usd: 560,
    sound_usage_rate: 0.77, completion_reliability: 0.94,
    content_tags: ['lip_sync', 'moody_dark', 'single_take', 'intimate'],
    profile_text: 'Harper Quinn performs moody, single-take lip-sync videos from Sydney with a distinct alt-pop sensibility. Reliability and sound-adoption are both strong, and the format translates well across a wide range of vocal-forward tracks.',
  },
  {
    id: 'camila-pulse', handle: 'camila.pulse', display_name: 'Camila Torres',
    bio: 'Miami latin pop dancer with beach-set high-energy routines.',
    follower_count: 980_000, engagement_rate: 0.017, avg_views: 720_000,
    genres: ['latin pop'], region: 'US', base_rate_usd: 5200,
    sound_usage_rate: 0.4, completion_reliability: 0.72,
    content_tags: ['dance_performance', 'high_energy', 'golden_hour', 'chaotic_fun'],
    profile_text: 'Camila Torres films high-energy beach-set latin pop dance routines from Miami at significant scale. Sound usage is moderate relative to her size — she often mixes in non-music content — but reach on featured tracks is substantial.',
  },
  {
    id: 'liam-porchlight', handle: 'liam.porchlight', display_name: 'Liam O\'Connor',
    bio: 'Dublin folk-pop songwriter doing acoustic street performances.',
    follower_count: 27_000, engagement_rate: 0.079, avg_views: 24_000,
    genres: ['indie', 'pop'], region: 'IE', base_rate_usd: 260,
    sound_usage_rate: 0.81, completion_reliability: 0.96,
    content_tags: ['single_take', 'intimate', 'chill', 'grainy_lofi'],
    profile_text: 'Liam O\'Connor performs acoustic folk-pop street sets around Dublin, single-take and unpolished by design. His small, tightly engaged audience drives an unusually high sound-adoption rate for his size.',
  },
  {
    id: 'aiko-strobe', handle: 'aiko.strobe', display_name: 'Aiko Fujimoto',
    bio: 'Osaka EDM dancer specializing in strobe-lit rapid-cut sets.',
    follower_count: 350_000, engagement_rate: 0.036, avg_views: 290_000,
    genres: ['EDM/dance'], region: 'JP', base_rate_usd: 2000,
    sound_usage_rate: 0.68, completion_reliability: 0.88,
    content_tags: ['dance_performance', 'rapid_cuts', 'neon', 'high_energy'],
    profile_text: 'Aiko Fujimoto performs strobe-lit, rapid-cut EDM choreography from Osaka clubs and studios. Her high-contrast neon visual identity pairs reliably with high-energy drop moments, and sound adoption among her audience is consistently strong.',
  },
  {
    id: 'tobias-lowlight', handle: 'tobias.lowlight', display_name: 'Tobias Weber',
    bio: 'Vienna classical-crossover cellist reimagining pop hooks.',
    follower_count: 210_000, engagement_rate: 0.039, avg_views: 175_000,
    genres: ['pop', 'indie'], region: 'AT', base_rate_usd: 1300,
    sound_usage_rate: 0.63, completion_reliability: 0.93,
    content_tags: ['hook_payoff', 'moody_dark', 'single_take', 'cinematic'],
    profile_text: 'Tobias Weber reimagines pop hooks on cello in moody, cinematic single-take videos from Vienna. The classical-crossover format gives songs a distinct emotional register and drives above-average completion reliability.',
  },
  {
    id: 'grace-afterhours', handle: 'grace.afterhours', display_name: 'Grace Mbeki',
    bio: 'Nairobi afrobeats and amapiano fusion dancer.',
    follower_count: 88_000, engagement_rate: 0.061, avg_views: 96_000,
    genres: ['afrobeats'], region: 'KE', base_rate_usd: 640,
    sound_usage_rate: 0.84, completion_reliability: 0.91,
    content_tags: ['dance_performance', 'beat_synced_cuts', 'high_energy', 'golden_hour'],
    profile_text: 'Grace Mbeki fuses afrobeats and amapiano choreography in golden-hour footage from Nairobi. Her sound-usage rate is one of the highest in the roster relative to her follower count, reflecting a highly music-engaged audience.',
  },
  {
    id: 'ethan-nightdrive', handle: 'ethan.nightdrive', display_name: 'Ethan Brooks',
    bio: 'LA night-drive aesthetic creator pairing synthwave visuals with pop hooks.',
    follower_count: 460_000, engagement_rate: 0.024, avg_views: 380_000,
    genres: ['pop', 'EDM/dance'], region: 'US', base_rate_usd: 2600,
    sound_usage_rate: 0.46, completion_reliability: 0.82,
    content_tags: ['vibe_montage', 'neon', 'moody_dark', 'cinematic'],
    profile_text: 'Ethan Brooks produces neon-lit, synthwave-styled night-drive montages around Los Angeles, pairing cinematic visuals with pop and dance hooks. Reach is solid though somewhat below his tier\'s benchmark engagement.',
  },
  {
    id: 'fatima-rooftop', handle: 'fatima.rooftop', display_name: 'Fatima Rahman',
    bio: 'Karachi pop creator filming rooftop golden-hour performance clips.',
    follower_count: 63_000, engagement_rate: 0.067, avg_views: 58_000,
    genres: ['pop'], region: 'PK', base_rate_usd: 500,
    sound_usage_rate: 0.73, completion_reliability: 0.9,
    content_tags: ['performance', 'golden_hour', 'intimate', 'single_take'],
    profile_text: 'Fatima Rahman films single-take rooftop performance clips at golden hour from Karachi. Her intimate delivery style and consistent posting schedule make her a reliable pick for pop tracks seeking an authentic, discovery-first audience.',
  },
  {
    id: 'marcus-dropframe', handle: 'marcus.dropframe', display_name: 'Marcus Bell',
    bio: 'Chicago hip-hop editor known for perfectly-timed beat-drop transitions.',
    follower_count: 530_000, engagement_rate: 0.027, avg_views: 410_000,
    genres: ['hip-hop'], region: 'US', base_rate_usd: 2900,
    sound_usage_rate: 0.58, completion_reliability: 0.84,
    content_tags: ['transition_edit', 'beat_synced_cuts', 'chaotic_fun', 'high_energy'],
    profile_text: 'Marcus Bell edits precisely-timed beat-drop transitions from Chicago, high-energy and slightly chaotic by design. Scale is solid and sound adoption reliable, though he sits mid-pack on engagement relative to his follower tier.',
  },
  {
    id: 'lena-driftwood', handle: 'lena.driftwood', display_name: 'Lena Kowalski',
    bio: 'Warsaw indie-folk creator with slow-pan nature soundtracks.',
    follower_count: 21_000, engagement_rate: 0.082, avg_views: 19_000,
    genres: ['indie'], region: 'PL', base_rate_usd: 220,
    sound_usage_rate: 0.71, completion_reliability: 0.95,
    content_tags: ['vibe_montage', 'slow_pan', 'grainy_lofi', 'chill'],
    profile_text: 'Lena Kowalski shoots slow-pan indie-folk vignettes around the Polish countryside, grainy and unhurried. Her small audience is unusually loyal, translating to strong engagement and reliability for original-sounding tracks.',
  },
  {
    id: 'diego-currents', handle: 'diego.currents', display_name: 'Diego Fernández',
    bio: 'Buenos Aires latin pop and EDM crossover DJ.',
    follower_count: 390_000, engagement_rate: 0.031, avg_views: 320_000,
    genres: ['latin pop', 'EDM/dance'], region: 'AR', base_rate_usd: 2100,
    sound_usage_rate: 0.6, completion_reliability: 0.86,
    content_tags: ['dance_performance', 'beat_synced_cuts', 'neon', 'high_energy'],
    profile_text: 'Diego Fernández DJs latin pop and EDM crossover sets from Buenos Aires clubs, neon-lit and beat-synced. His crossover niche gives campaigns access to two overlapping but distinct fan bases in one creator.',
  },
  {
    id: 'nadia-porchglow', handle: 'nadia.porchglow', display_name: 'Nadia Haidari',
    bio: 'Istanbul R&B and pop vocalist doing rooftop sunset covers.',
    follower_count: 51_000, engagement_rate: 0.069, avg_views: 47_000,
    genres: ['R&B', 'pop'], region: 'TR', base_rate_usd: 420,
    sound_usage_rate: 0.78, completion_reliability: 0.92,
    content_tags: ['performance', 'golden_hour', 'intimate', 'moody_dark'],
    profile_text: 'Nadia Haidari performs rooftop sunset covers blending R&B and pop from Istanbul, intimate and moodily warm. Her sound-adoption rate is strong for her size, and her delivery reliably supports vocal-forward tracks.',
  },
  {
    id: 'xavier-blockparty', handle: 'xavier.blockparty', display_name: 'Xavier Johnson',
    bio: 'Houston hip-hop block-party creator with chaotic group dance clips.',
    follower_count: 1_200_000, engagement_rate: 0.014, avg_views: 890_000,
    genres: ['hip-hop'], region: 'US', base_rate_usd: 6800,
    sound_usage_rate: 0.25, completion_reliability: 0.65,
    content_tags: ['dance_performance', 'chaotic_fun', 'high_energy'],
    profile_text: 'Xavier Johnson films large group block-party dance clips around Houston at real scale. Sound usage and reliability trail smaller, more focused music creators, but his reach on a viral moment is unmatched in the roster.',
  },
  {
    id: 'yuki-afterglow', handle: 'yuki.afterglow', display_name: 'Yuki Sato',
    bio: 'Fukuoka bedroom-pop creator with hand-drawn visual storytelling.',
    follower_count: 39_000, engagement_rate: 0.074, avg_views: 36_000,
    genres: ['indie', 'pop'], region: 'JP', base_rate_usd: 340,
    sound_usage_rate: 0.7, completion_reliability: 0.94,
    content_tags: ['pov_storytelling', 'grainy_lofi', 'intimate', 'chill'],
    profile_text: 'Yuki Sato pairs hand-drawn visual storytelling with bedroom-pop soundtracks from Fukuoka, intimate and unhurried in tone. A dedicated, discovery-minded audience gives her strong reliability and above-benchmark engagement.',
  },
  {
    id: 'santiago-lowrider', handle: 'santiago.lowrider', display_name: 'Santiago Vega',
    bio: 'Los Angeles latin hip-hop creator with lowrider cruise aesthetic edits.',
    follower_count: 168_000, engagement_rate: 0.044, avg_views: 140_000,
    genres: ['hip-hop', 'latin pop'], region: 'US', base_rate_usd: 1050,
    sound_usage_rate: 0.65, completion_reliability: 0.89,
    content_tags: ['vibe_montage', 'cinematic', 'golden_hour', 'chill'],
    profile_text: 'Santiago Vega films cinematic lowrider cruise montages blending latin hip-hop influences from Los Angeles, warm and unhurried. His crossover genre positioning and reliable posting make him a solid pick for latin-adjacent hip-hop campaigns.',
  },
  {
    id: 'ivy-nightcall', handle: 'ivy.nightcall', display_name: 'Ivy Chen',
    bio: 'Singapore pop creator specializing in duet-bait harmony covers.',
    follower_count: 112_000, engagement_rate: 0.049, avg_views: 98_000,
    genres: ['pop'], region: 'SG', base_rate_usd: 780,
    sound_usage_rate: 0.76, completion_reliability: 0.93,
    content_tags: ['duet_bait', 'lip_sync', 'studio_clean', 'intimate'],
    profile_text: 'Ivy Chen records studio-clean harmony covers built specifically for duet chains from Singapore, intimate in tone but designed for participation and spread. Sound adoption is strong and consistent across her catalog.',
  },
];

async function main() {
  const profileTexts = creators.map(c => c.profile_text);
  let embeddings: number[][] = [];
  let placeholder = true;

  try {
    const result = await embedMany({ model: models.embedding, values: profileTexts });
    embeddings = result.embeddings;
    placeholder = false;
    console.log(`Live embeddings generated for ${embeddings.length} creators.`);
  } catch (err) {
    console.error(
      'embedMany failed — falling back to placeholder embeddings. Run this script again once API keys are configured.',
    );
    console.error(err instanceof Error ? err.message : err);
  }

  const withEmbeddings = creators.map((c, i) => ({
    ...c,
    embedding: embeddings[i] ?? [],
  }));

  const output = {
    embedding_model: models.embedding,
    embedding_dimensions: EMBEDDING_DIMENSIONS,
    generated_at: new Date().toISOString(),
    ...(placeholder ? { placeholder: true } : {}),
    creators: withEmbeddings,
  };

  const outPath = path.join(__dirname, '../data/creators.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath} (${creators.length} creators, placeholder=${placeholder})`);
}

main();
