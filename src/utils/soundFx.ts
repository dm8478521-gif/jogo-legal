import { EnemySpecies, MiniBossId, SoundProfile } from '../data/gameData';

type SfxCategory =
  | 'punch'
  | 'heavy'
  | 'bone'
  | 'pain'
  | 'scream'
  | 'ko'
  | 'cry'
  | 'joker_laugh'
  | 'trevor_talk';

export type VocalPhase = 'cocky' | 'aggressive' | 'psychotic';

export function getVocalPhase(hpRatio: number): VocalPhase {
  if (hpRatio > 0.62) return 'cocky';
  if (hpRatio > 0.28) return 'aggressive';
  return 'psychotic';
}

const TREVOR_PHASE_POOLS: Record<VocalPhase, number[]> = {
  // High HP: mocking insults, drunk taunts, cocky hostility
  cocky: [18, 12, 11, 2, 7, 8, 5, 19, 13],
  // Mid HP: heavy cursing, threats, rising rage
  aggressive: [6, 10, 14, 1, 13, 12, 5, 0, 3, 18],
  // Low HP: full unhinged meltdown, profanity, screams & cannibal threats
  psychotic: [17, 16, 15, 6, 10, 14, 9, 4, 19, 1],
};

const JOKER_PHASE_POOLS: Record<VocalPhase, number[]> = {
  // High HP: risadas frias e debochadas
  cocky: [0, 5, 3],
  // Mid HP: gargalhadas mais maníacas e agressivas
  aggressive: [1, 3, 2, 5],
  // Low HP: surto histérico e psicótico perto do nocaute
  psychotic: [4, 2, 1, 3],
};

export const TREVOR_QUOTES: string[] = [
  'Why do you exist?!',
  'You prick!',
  "Let's party!",
  "I'm dangerous!",
  'Stop doing that!',
  "You're a waste of space!",
  'Shut the f*** up!',
  'We need chips and dips and prostitutes!',
  "I'm drunk!",
  'Ba-ba-ba-ba!',
  "I'm about to f*** you up!",
  'You are utterly ridiculous!',
  'Dumbass!',
  'Nobody disrespects me like that!',
  'Are you f***ing joking?!',
  "I'm gonna eat you!",
  'RAAAAGH!!',
  'F***!! AAAAAGH!!',
  'Idiot!',
  'My name is TREVOR!!',
];

export interface MiniBossVoiceClip {
  url: string;
  phase: VocalPhase;
  text: string;
}

export const MINI_BOSS_SPEECH_MANIFEST: Record<MiniBossId, MiniBossVoiceClip[]> = {
  davy_jones: [
    { url: '/audio/sfx/davy_jones_1.mp3', phase: 'cocky', text: 'Joguei todos! Zerei todos!' },
    { url: '/audio/sfx/davy_jones_2.mp3', phase: 'cocky', text: 'Essa é a diferença de um fã pra um fanboy!' },
    { url: '/audio/sfx/davy_jones_3.mp3', phase: 'cocky', text: 'Por enquanto tá tudo tranquilo!' },
    { url: '/audio/sfx/davy_jones_4.mp3', phase: 'cocky', text: 'Maneirão, cara!' },
    { url: '/audio/sfx/davy_jones_6.mp3', phase: 'cocky', text: 'Eu quero todos!' },
    { url: '/audio/sfx/davy_jones_5.mp3', phase: 'aggressive', text: 'Eu já joguei todos esses jogos!' },
    { url: '/audio/sfx/davy_jones_7.mp3', phase: 'aggressive', text: 'Tô ficando maluco com isso aqui!' },
    { url: '/audio/sfx/davy_jones_8.mp3', phase: 'aggressive', text: 'Deixou a gente aqui sem nada!' },
    { url: '/audio/sfx/davy_jones_9.mp3', phase: 'aggressive', text: 'Tá brincando com o que não sabe!' },
    { url: '/audio/sfx/davy_jones_10.mp3', phase: 'psychotic', text: 'Cala a boca, rapaz!' },
    { url: '/audio/sfx/davy_jones_11.mp3', phase: 'psychotic', text: 'Ai, que maldade, cara!' },
    { url: '/audio/sfx/davy_jones_12.mp3', phase: 'psychotic', text: 'Eu tô passando mal! Para com isso!' },
  ],
  felipe_neto: [
    { url: '/audio/sfx/felipe_neto_1.mp3', phase: 'cocky', text: 'Não faz sentido! Quem?!' },
    { url: '/audio/sfx/felipe_neto_2.mp3', phase: 'cocky', text: 'Xiu! Não faz sentido!' },
    { url: '/audio/sfx/felipe_neto_4.mp3', phase: 'cocky', text: 'Que símbolo é esse?! Eu não gosto!' },
    { url: '/audio/sfx/felipe_neto_3.mp3', phase: 'aggressive', text: 'Estão roubando meu fogão!' },
    { url: '/audio/sfx/felipe_neto_5.mp3', phase: 'aggressive', text: 'Ei! Essa palavra aí é proibida!' },
    { url: '/audio/sfx/felipe_neto_6.mp3', phase: 'aggressive', text: 'Que jogo injusto da bexiga!' },
    { url: '/audio/sfx/felipe_neto_7.mp3', phase: 'psychotic', text: 'Não é possível uma coisa dessas!' },
    { url: '/audio/sfx/felipe_neto_8.mp3', phase: 'psychotic', text: 'Para de rir da minha cara!' },
    { url: '/audio/sfx/felipe_neto_9.mp3', phase: 'psychotic', text: 'AAAAAAIIIII!!' },
  ],
  whindersson: [
    { url: '/audio/sfx/whindersson_1.mp3', phase: 'cocky', text: 'Pronto! Bora conversar direito!' },
    { url: '/audio/sfx/whindersson_2.mp3', phase: 'cocky', text: 'Otáru!' },
    { url: '/audio/sfx/whindersson_3.mp3', phase: 'cocky', text: 'Ei otáru, bó rogá!' },
    { url: '/audio/sfx/whindersson_6.mp3', phase: 'cocky', text: 'Eu acho é pouco!' },
    { url: '/audio/sfx/whindersson_4.mp3', phase: 'aggressive', text: 'E fica por isso mesmo, é?!' },
    { url: '/audio/sfx/whindersson_7.mp3', phase: 'aggressive', text: 'Eu acho é pouco! Olha o dedo!' },
    { url: '/audio/sfx/whindersson_5.mp3', phase: 'psychotic', text: 'Levantei e falei: EEEEIIII!!' },
    { url: '/audio/sfx/whindersson_8.mp3', phase: 'psychotic', text: 'Qual foi, painho?! Calma aí!' },
  ],
  kleberiano: [
    { url: '/audio/sfx/kleberiano_1.mp3', phase: 'cocky', text: 'A my fellas!' },
    { url: '/audio/sfx/kleberiano_4.mp3', phase: 'cocky', text: 'Ai, rato joga!' },
    { url: '/audio/sfx/kleberiano_7.mp3', phase: 'cocky', text: 'Oiê?! Olha o que esse cara tá falando!' },
    { url: '/audio/sfx/kleberiano_2.mp3', phase: 'aggressive', text: 'A my fellas! Que absurdo!' },
    { url: '/audio/sfx/kleberiano_5.mp3', phase: 'aggressive', text: 'Eita, olha a situação!' },
    { url: '/audio/sfx/kleberiano_8.mp3', phase: 'aggressive', text: 'Oiê?!' },
    { url: '/audio/sfx/kleberiano_3.mp3', phase: 'psychotic', text: 'Aii para, menina!!' },
    { url: '/audio/sfx/kleberiano_6.mp3', phase: 'psychotic', text: 'Aiii, para com isso!' },
  ],
  alanzoka: [
    { url: '/audio/sfx/alanzoka_1.mp3', phase: 'cocky', text: 'E aí pessoal, tudo bem?' },
    { url: '/audio/sfx/alanzoka_2.mp3', phase: 'cocky', text: 'Salve!' },
    { url: '/audio/sfx/alanzoka_3.mp3', phase: 'cocky', text: 'Fala galera, aqui é o Alanzoka!' },
    { url: '/audio/sfx/alanzoka_4.mp3', phase: 'cocky', text: 'Top 1 do Brasil!' },
    { url: '/audio/sfx/alanzoka_5.mp3', phase: 'cocky', text: 'O cara é profissional!' },
    { url: '/audio/sfx/alanzoka_6.mp3', phase: 'aggressive', text: 'Chora mais!' },
    { url: '/audio/sfx/alanzoka_7.mp3', phase: 'aggressive', text: 'Acorda, Alanzoka!!' },
    { url: '/audio/sfx/alanzoka_8.mp3', phase: 'aggressive', text: 'Para, tira que eu vou!' },
    { url: '/audio/sfx/alanzoka_9.mp3', phase: 'aggressive', text: 'Wuatafoook?!' },
    { url: '/audio/sfx/alanzoka_10.mp3', phase: 'psychotic', text: 'Não, não, não!!' },
    { url: '/audio/sfx/alanzoka_11.mp3', phase: 'psychotic', text: 'QUE ÓDIO!!' },
    { url: '/audio/sfx/alanzoka_12.mp3', phase: 'psychotic', text: 'Me perdi!' },
    { url: '/audio/sfx/alanzoka_13.mp3', phase: 'psychotic', text: 'Eu vou vomitar!' },
  ],
  casimiro: [
    { url: '/audio/sfx/casimiro_1.mp3', phase: 'cocky', text: 'Meteu essa?!' },
    { url: '/audio/sfx/casimiro_2.mp3', phase: 'cocky', text: 'Gigante!' },
    { url: '/audio/sfx/casimiro_3.mp3', phase: 'cocky', text: 'Anota, anota!' },
    { url: '/audio/sfx/casimiro_4.mp3', phase: 'cocky', text: 'Isso aqui esquece!' },
    { url: '/audio/sfx/casimiro_5.mp3', phase: 'cocky', text: 'Salve Campo Grande!' },
    { url: '/audio/sfx/casimiro_6.mp3', phase: 'cocky', text: 'Aceitas Pix?!' },
    { url: '/audio/sfx/casimiro_7.mp3', phase: 'aggressive', text: 'Aqui é Vasco, irmão!' },
    { url: '/audio/sfx/casimiro_8.mp3', phase: 'aggressive', text: 'Do nada, mané!' },
    { url: '/audio/sfx/casimiro_9.mp3', phase: 'aggressive', text: 'É muito forte essa aspa!' },
    { url: '/audio/sfx/casimiro_10.mp3', phase: 'aggressive', text: 'Isso que dá gastar dinheiro à toa!' },
    { url: '/audio/sfx/casimiro_11.mp3', phase: 'psychotic', text: 'Que isso, Cazé?!' },
    { url: '/audio/sfx/casimiro_12.mp3', phase: 'psychotic', text: 'Acorda, Cazé!!' },
    { url: '/audio/sfx/casimiro_13.mp3', phase: 'psychotic', text: 'Vergonha alheia demais!' },
  ],
  smzinho: [
    { url: '/audio/sfx/smzinho_1.mp3', phase: 'cocky', text: 'O bicho é bom mesmo!' },
    { url: '/audio/sfx/smzinho_2.mp3', phase: 'cocky', text: 'Peguei o esquema!' },
    { url: '/audio/sfx/smzinho_3.mp3', phase: 'cocky', text: 'O esquema aqui já foi adquirido!' },
    { url: '/audio/sfx/smzinho_4.mp3', phase: 'cocky', text: 'Meu herói não usa capa!' },
    { url: '/audio/sfx/smzinho_5.mp3', phase: 'aggressive', text: 'Cala a boca, menino!' },
    { url: '/audio/sfx/smzinho_6.mp3', phase: 'aggressive', text: 'Deixa eu jogar também!' },
    { url: '/audio/sfx/smzinho_7.mp3', phase: 'aggressive', text: 'Alguém vai se machucar, amegan!' },
    { url: '/audio/sfx/smzinho_8.mp3', phase: 'aggressive', text: 'Falta violência nisso aqui!' },
    { url: '/audio/sfx/smzinho_9.mp3', phase: 'psychotic', text: 'Tô ficando estressado já!!' },
    { url: '/audio/sfx/smzinho_10.mp3', phase: 'psychotic', text: 'Eu tô com medo!!' },
    { url: '/audio/sfx/smzinho_11.mp3', phase: 'psychotic', text: 'Vou lhe pegar, viu!' },
    { url: '/audio/sfx/smzinho_12.mp3', phase: 'psychotic', text: 'Sou humilhado no meu próprio vídeo!' },
  ],
  cellbit: [
    { url: '/audio/sfx/cellbit_1.mp3', phase: 'cocky', text: 'ALÔ?!' },
    { url: '/audio/sfx/cellbit_3.mp3', phase: 'cocky', text: 'Não sei!' },
    { url: '/audio/sfx/cellbit_4.mp3', phase: 'cocky', text: 'Num mundo melhor assim...' },
    { url: '/audio/sfx/cellbit_5.mp3', phase: 'cocky', text: 'E aí pessoal, tudo bem?' },
    { url: '/audio/sfx/cellbit_10.mp3', phase: 'cocky', text: 'Eu adoro esse enigma!' },
    { url: '/audio/sfx/cellbit_7.mp3', phase: 'aggressive', text: 'Sinais do Outro Lado!' },
    { url: '/audio/sfx/cellbit_8.mp3', phase: 'aggressive', text: 'Hehehe! Que enigma é esse?!' },
    { url: '/audio/sfx/cellbit_9.mp3', phase: 'aggressive', text: 'E do nada!!' },
    { url: '/audio/sfx/cellbit_2.mp3', phase: 'psychotic', text: 'Eta Giovana!!' },
    { url: '/audio/sfx/cellbit_6.mp3', phase: 'psychotic', text: 'AAAAAHHHHH!!' },
  ],
  luccas_neto: [
    { url: '/audio/sfx/luccas_neto_1.mp3', phase: 'cocky', text: 'Bom dia, amiguinhos!' },
    { url: '/audio/sfx/luccas_neto_2.mp3', phase: 'cocky', text: 'Eu sou uma foca, olha aqui ó!' },
    { url: '/audio/sfx/luccas_neto_7.mp3', phase: 'cocky', text: 'Chama os amiguinhos!' },
    { url: '/audio/sfx/luccas_neto_3.mp3', phase: 'aggressive', text: 'Cabo de vassoura! Não faz isso!' },
    { url: '/audio/sfx/luccas_neto_5.mp3', phase: 'aggressive', text: 'FOCA!!' },
    { url: '/audio/sfx/luccas_neto_4.mp3', phase: 'psychotic', text: 'AAAAAIII!! Para com isso agora!!' },
    { url: '/audio/sfx/luccas_neto_6.mp3', phase: 'psychotic', text: 'Ó O SOM DA FOCA!!' },
  ],
};

const REAL_SFX_MANIFEST: Record<SfxCategory, string[]> = {
  punch: [
    '/audio/sfx/punch_1.mp3',
    '/audio/sfx/punch_2.mp3',
    '/audio/sfx/punch_3.mp3',
    '/audio/sfx/punch_4.mp3',
    '/audio/sfx/punch_5.mp3',
    '/audio/sfx/punch_6.mp3',
  ],
  heavy: [
    '/audio/sfx/heavy_1.mp3',
    '/audio/sfx/heavy_2.mp3',
    '/audio/sfx/heavy_3.mp3',
  ],
  bone: [
    '/audio/sfx/bone_1.mp3',
    '/audio/sfx/bone_2.mp3',
  ],
  pain: [
    '/audio/sfx/pain_1.mp3',
    '/audio/sfx/pain_2.mp3',
    '/audio/sfx/pain_3.mp3',
    '/audio/sfx/pain_4.mp3',
    '/audio/sfx/pain_5.mp3',
    '/audio/sfx/pain_6.mp3',
  ],
  scream: [
    '/audio/sfx/scream_1.mp3',
    '/audio/sfx/scream_2.mp3',
    '/audio/sfx/scream_3.mp3',
    '/audio/sfx/scream_4.mp3',
    '/audio/sfx/scream_5.mp3',
  ],
  ko: [
    '/audio/sfx/ko_1.mp3',
    '/audio/sfx/ko_2.mp3',
  ],
  cry: [
    '/audio/sfx/cry_1.mp3',
    '/audio/sfx/cry_2.mp3',
    '/audio/sfx/cry_3.mp3',
    '/audio/sfx/cry_4.mp3',
  ],
  joker_laugh: [
    '/audio/sfx/joker_laugh_1.mp3',
    '/audio/sfx/joker_laugh_2.mp3',
    '/audio/sfx/joker_laugh_3.mp3',
    '/audio/sfx/joker_laugh_4.mp3',
    '/audio/sfx/joker_laugh_5.mp3',
    '/audio/sfx/joker_laugh_6.mp3',
  ],
  trevor_talk: [
    '/audio/sfx/trevor_1.mp3',
    '/audio/sfx/trevor_2.mp3',
    '/audio/sfx/trevor_3.mp3',
    '/audio/sfx/trevor_4.mp3',
    '/audio/sfx/trevor_5.mp3',
    '/audio/sfx/trevor_6.mp3',
    '/audio/sfx/trevor_7.mp3',
    '/audio/sfx/trevor_8.mp3',
    '/audio/sfx/trevor_9.mp3',
    '/audio/sfx/trevor_10.mp3',
    '/audio/sfx/trevor_11.mp3',
    '/audio/sfx/trevor_12.mp3',
    '/audio/sfx/trevor_13.mp3',
    '/audio/sfx/trevor_14.mp3',
    '/audio/sfx/trevor_15.mp3',
    '/audio/sfx/trevor_16.mp3',
    '/audio/sfx/trevor_17.mp3',
    '/audio/sfx/trevor_18.mp3',
    '/audio/sfx/trevor_19.mp3',
    '/audio/sfx/trevor_20.mp3',
  ],
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private speechBus: GainNode | null = null;
  private speechAnalyser: AnalyserNode | null = null;
  private speechTimeData: Uint8Array<ArrayBuffer> | null = null;
  private activeSpeechSource: AudioBufferSourceNode | null = null;
  private speechActiveUntil: number = 0;
  private speechActiveBoss: string | null = null;
  private speechActivePhase: VocalPhase = 'cocky';
  private glottalWave: PeriodicWave | null = null;
  private strainedWave: PeriodicWave | null = null;
  private softClipCurve: Float32Array<ArrayBuffer> | null = null;
  private muted: boolean = false;
  private lastGroanAt: number = 0;
  private lastSobAt: number = 0;
  private lastAgonyAt: number = 0;
  private lastCoughAt: number = 0;
  private lastSquirtAt: number = 0;
  private lastBloodDripAt: number = 0;
  private lastLaughAt: number = 0;
  private lastTrevorTalkAt: number = 0;
  private lastMiniBossTalkAt: number = 0;
  private lastMiniBossQuoteUrl: Map<string, string> = new Map();
  private sampleBuffers: Map<string, AudioBuffer> = new Map();
  private samplePending: Map<string, Promise<AudioBuffer | null>> = new Map();
  private preloadedMiniBosses: Set<MiniBossId> = new Set();
  private preloadingStarted: boolean = false;
  private preloadAllMiniBossStarted: boolean = false;
  private lastCategoryIndex: Map<SfxCategory, number> = new Map();

  public stopActiveSpeech() {
    if (this.activeSpeechSource) {
      try {
        this.activeSpeechSource.stop();
      } catch {
        // ignore
      }
      this.activeSpeechSource = null;
    }
    this.speechActiveUntil = 0;
    this.speechActiveBoss = null;
    this.speechActivePhase = 'cocky';
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopActiveSpeech();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(14, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(5.5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.16, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      // Dedicated clean speech bus (bypasses heavy punch compressor so voices never pump or warp)
      this.speechBus = this.ctx.createGain();
      this.speechBus.gain.setValueAtTime(0.95, this.ctx.currentTime);
      this.speechAnalyser = this.ctx.createAnalyser();
      this.speechAnalyser.fftSize = 256;
      this.speechAnalyser.smoothingTimeConstant = 0.32;
      this.speechTimeData = new Uint8Array(new ArrayBuffer(this.speechAnalyser.fftSize));
      this.speechBus.connect(this.speechAnalyser);
      this.speechAnalyser.connect(this.ctx.destination);

      this.initVocalWaves(this.ctx);
    }
    return this.ctx;
  }

  public warmup(priorityMiniBossId?: MiniBossId) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (!this.muted && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.preloadSamples(ctx);
    if (priorityMiniBossId) {
      void this.preloadMiniBossSamples(ctx, priorityMiniBossId);
    }
  }

  /**
   * Real-time normalized vocal amplitude (0..1) from AnalyserNode for 60fps lip-sync.
   */
  public getSpeechAmplitude(bossId?: string): number {
    if (this.muted || !this.speechAnalyser || !this.speechTimeData) return 0;
    if (performance.now() > this.speechActiveUntil) return 0;
    if (bossId && this.speechActiveBoss !== bossId) return 0;

    this.speechAnalyser.getByteTimeDomainData(this.speechTimeData);
    let sumSq = 0;
    const data = this.speechTimeData;
    for (let i = 0; i < data.length; i++) {
      const norm = (data[i] - 128) / 128;
      sumSq += norm * norm;
    }
    const rms = Math.sqrt(sumSq / data.length);
    return Math.min(1, Math.max(0, (rms - 0.015) * 4.4));
  }

  public isSpeechActive(bossId?: string): boolean {
    if (this.muted || performance.now() > this.speechActiveUntil) return false;
    if (bossId && this.speechActiveBoss !== bossId) return false;
    return true;
  }

  public getSpeechPhase(bossId?: string): VocalPhase {
    if (bossId && this.speechActiveBoss !== bossId) return 'cocky';
    return this.speechActivePhase;
  }

  private decodeAndCacheUrl(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
    const cached = this.sampleBuffers.get(url);
    if (cached) return Promise.resolve(cached);

    const pending = this.samplePending.get(url);
    if (pending) return pending;

    const promise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const arr = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arr);
        this.sampleBuffers.set(url, decoded);
        return decoded;
      } catch {
        return null;
      } finally {
        this.samplePending.delete(url);
      }
    })();

    this.samplePending.set(url, promise);
    return promise;
  }

  private async preloadMiniBossSamples(ctx: AudioContext, miniBossId: MiniBossId) {
    if (this.preloadedMiniBosses.has(miniBossId)) return;
    this.preloadedMiniBosses.add(miniBossId);

    const clips = MINI_BOSS_SPEECH_MANIFEST[miniBossId] ?? [];
    // Prioritize opening 'cocky' clips first so the boss speaks immediately on entry
    const sorted = [
      ...clips.filter((c) => c.phase === 'cocky'),
      ...clips.filter((c) => c.phase === 'aggressive'),
      ...clips.filter((c) => c.phase === 'psychotic'),
    ];
    await Promise.allSettled(sorted.map((c) => this.decodeAndCacheUrl(ctx, c.url)));
  }

  private preloadAllMiniBossSamples(ctx: AudioContext) {
    if (this.preloadAllMiniBossStarted) return;
    this.preloadAllMiniBossStarted = true;

    const ids = Object.keys(MINI_BOSS_SPEECH_MANIFEST) as MiniBossId[];
    void (async () => {
      for (const id of ids) {
        await this.preloadMiniBossSamples(ctx, id);
      }
    })();
  }

  private preloadSamples(ctx: AudioContext) {
    if (this.preloadingStarted) return;
    this.preloadingStarted = true;

    const priorityUrls = [
      ...REAL_SFX_MANIFEST.trevor_talk,
      ...REAL_SFX_MANIFEST.joker_laugh,
    ];
    const remainingUrls = Object.entries(REAL_SFX_MANIFEST)
      .filter(([cat]) => cat !== 'trevor_talk' && cat !== 'joker_laugh')
      .flatMap(([, urls]) => urls);
    const allUrls = [...priorityUrls, ...remainingUrls];
    void Promise.allSettled(allUrls.map((url) => this.decodeAndCacheUrl(ctx, url))).then(() => {
      this.preloadAllMiniBossSamples(ctx);
    });
  }

  private pickCategoryBuffer(category: SfxCategory, allowedIndices?: number[]): AudioBuffer | null {
    const urls = REAL_SFX_MANIFEST[category];
    const candidates: Array<{ idx: number; buffer: AudioBuffer }> = [];

    for (let i = 0; i < urls.length; i++) {
      if (allowedIndices && !allowedIndices.includes(i)) continue;
      const buf = this.sampleBuffers.get(urls[i]);
      if (buf) {
        candidates.push({ idx: i, buffer: buf });
      }
    }

    if (candidates.length === 0) return null;

    const lastIdx = this.lastCategoryIndex.get(category);
    const pool =
      candidates.length > 1 && lastIdx !== undefined
        ? candidates.filter((c) => c.idx !== lastIdx)
        : candidates;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.lastCategoryIndex.set(category, chosen.idx);
    return chosen.buffer;
  }

  private playRealSample(
    ctx: AudioContext,
    out: AudioNode,
    category: SfxCategory,
    options?: {
      gain?: number;
      rate?: number;
      lowpassHz?: number;
      highpassHz?: number;
      delay?: number;
      allowedIndices?: number[];
    }
  ): boolean {
    const buffer = this.pickCategoryBuffer(category, options?.allowedIndices);
    if (!buffer) return false;

    const now = ctx.currentTime + (options?.delay ?? 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(
      Math.max(0.62, Math.min(1.42, options?.rate ?? 1.0)),
      now
    );

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(options?.gain ?? 0.8, now);

    let tail: AudioNode = source;
    if (options?.highpassHz) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(options.highpassHz, now);
      tail.connect(hp);
      tail = hp;
    }
    if (options?.lowpassHz) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(options.lowpassHz, now);
      tail.connect(lp);
      tail = lp;
    }

    tail.connect(gainNode);
    gainNode.connect(out);
    source.start(now);
    return true;
  }

  private playCleanSpeechSample(
    ctx: AudioContext,
    bossId: 'trevor_gta5' | 'joker' | MiniBossId,
    category: 'trevor_talk' | 'joker_laugh' | 'miniboss_talk',
    buffer: AudioBuffer,
    gain = 0.92,
    phase: VocalPhase = 'cocky',
    playbackRate = 1.0
  ) {
    const dest = this.speechBus || ctx.destination;
    if (this.activeSpeechSource) {
      try {
        this.activeSpeechSource.stop();
      } catch {
        // ignore already-stopped node
      }
      this.activeSpeechSource = null;
    }

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    // Keep playbackRate tightly constrained (0.97..1.04) so tone shifts feel urgent without warping real voices
    const safeRate = Math.max(0.97, Math.min(1.04, playbackRate));
    source.playbackRate.setValueAtTime(safeRate, now);

    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, now);
    source.connect(g);
    g.connect(dest);

    this.activeSpeechSource = source;
    this.speechActiveBoss = bossId;
    this.speechActivePhase = phase;
    this.speechActiveUntil = performance.now() + (buffer.duration / safeRate) * 1000;

    source.onended = () => {
      if (this.activeSpeechSource === source) {
        this.activeSpeechSource = null;
        this.speechActiveUntil = 0;
        this.speechActiveBoss = null;
      }
    };
    source.start(now);
    void category;
  }

  private getOutput(): { ctx: AudioContext; out: AudioNode } | null {
    if (this.muted || typeof window === 'undefined') return null;

    const ctx = this.ensureContext();
    if (!ctx) return null;

    this.preloadSamples(ctx);

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    return { ctx, out: this.compressor || ctx.destination };
  }

  private initVocalWaves(ctx: AudioContext) {
    // Rosenberg/LF-inspired glottal pulse harmonic series (warm fundamental, natural vocal roll-off)
    const harmonics = 28;
    const realNorm = new Float32Array(harmonics);
    const imagNorm = new Float32Array(harmonics);
    const realStrain = new Float32Array(harmonics);
    const imagStrain = new Float32Array(harmonics);

    for (let n = 1; n < harmonics; n++) {
      // Normal human vocal fold closure spectrum
      const rollOff = Math.pow(n, -1.32);
      const breathTilt = Math.exp(-n * 0.055);
      imagNorm[n] = -rollOff * breathTilt * (n % 2 === 1 ? 1.0 : 0.72);
      realNorm[n] = rollOff * breathTilt * 0.25;

      // Strained / screaming vocal folds (stronger upper chest harmonics 3..10)
      const strainBoost = n >= 3 && n <= 11 ? 1.45 : 1.0;
      const strainRoll = Math.pow(n, -1.08);
      imagStrain[n] = -strainRoll * Math.exp(-n * 0.032) * strainBoost;
      realStrain[n] = strainRoll * 0.3;
    }

    this.glottalWave = ctx.createPeriodicWave(realNorm, imagNorm, { disableNormalization: false });
    this.strainedWave = ctx.createPeriodicWave(realStrain, imagStrain, { disableNormalization: false });

    // Soft asymmetric vocal cord saturation curve
    const samples = 256;
    const curve = new Float32Array(new ArrayBuffer(samples * 4));
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * 2.2 + 0.12 * x * x);
    }
    this.softClipCurve = curve;
  }

  private createNoiseBuffer(ctx: AudioContext, duration: number, colored: 'white' | 'pink' = 'white'): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (colored === 'white') {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      // Paul Kellet pink-noise approximation for organic breath, throat & wet liquid texture
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11));
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  private getSpeciesFormantScale(species: EnemySpecies): number {
    switch (species) {
      case 'titan':
        return 0.74;
      case 'cyclops':
        return 0.78;
      case 'neanderthal':
        return 0.88;
      default:
        return 1.0;
    }
  }

  /**
   * Helper: schedules a realistic liquid droplet pop / plip (air-cavity bubble chirp + micro-splash)
   */
  private scheduleBloodDroplet(
    ctx: AudioContext,
    out: AudioNode,
    atTime: number,
    basePitch: number,
    volume: number,
    viscous = true
  ) {
    const dur = viscous ? 0.032 : 0.024;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Signature liquid droplet upward pitch sweep
    osc.frequency.setValueAtTime(basePitch, atTime);
    osc.frequency.exponentialRampToValueAtTime(basePitch * (viscous ? 1.85 : 2.25), atTime + dur);

    gain.gain.setValueAtTime(0.0001, atTime);
    gain.gain.linearRampToValueAtTime(volume, atTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, atTime + dur);

    osc.connect(gain);
    gain.connect(out);
    osc.start(atTime);
    osc.stop(atTime + dur + 0.005);

    // Tiny wet surface transient
    const tick = ctx.createBufferSource();
    tick.buffer = this.createNoiseBuffer(ctx, 0.015, 'pink');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(Math.min(4800, basePitch * 2.8), atTime);
    bp.Q.value = 3.2;

    const tGain = ctx.createGain();
    tGain.gain.setValueAtTime(volume * 0.55, atTime);
    tGain.gain.exponentialRampToValueAtTime(0.0001, atTime + 0.014);

    tick.connect(bp);
    bp.connect(tGain);
    tGain.connect(out);
    tick.start(atTime);
  }

  public playHit(profile: SoundProfile, isCrit: boolean, isRage = false) {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isRage ? 0.58 : isCrit ? 0.48 : 0.34, now);
    masterGain.connect(out);

    // Universal sub-bass chest thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(isCrit || isRage ? 135 : 108, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.17);
    subGain.gain.setValueAtTime(isCrit ? 0.95 : 0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.19);

    if (profile === 'punch' || profile === 'heavy') {
      const rate = (profile === 'heavy' ? 0.92 : 0.96) + Math.random() * 0.1;
      const playedPrimary = this.playRealSample(
        ctx,
        out,
        profile === 'heavy' ? 'heavy' : 'punch',
        {
          gain: isRage ? 1.05 : isCrit ? 0.95 : 0.82,
          rate,
        }
      );

      if (playedPrimary && (isCrit || isRage) && profile === 'punch') {
        this.playRealSample(ctx, out, 'heavy', {
          gain: isRage ? 0.62 : 0.48,
          rate: 0.94 + Math.random() * 0.08,
        });
      }

      if (!playedPrimary) {
        const bodyOsc = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        bodyOsc.type = 'triangle';
        const startFreq = profile === 'heavy' ? 165 : 195;
        bodyOsc.frequency.setValueAtTime(isCrit ? startFreq * 1.2 : startFreq, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(34, now + 0.14);

        bodyGain.gain.setValueAtTime(0.85, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        bodyOsc.connect(bodyGain);
        bodyGain.connect(masterGain);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.16);

        // Meaty wet slap noise on flesh
        const noise = ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(ctx, 0.11, 'pink');
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(profile === 'heavy' ? 680 : 980, now);
        filter.Q.value = 1.4;

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.75, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(masterGain);
        noise.start(now);

        if (profile === 'heavy') {
          const ring = ctx.createOscillator();
          const rGain = ctx.createGain();
          ring.type = 'square';
          ring.frequency.setValueAtTime(840, now);
          ring.frequency.exponentialRampToValueAtTime(390, now + 0.13);
          rGain.gain.setValueAtTime(0.14, now);
          rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
          ring.connect(rGain);
          rGain.connect(masterGain);
          ring.start(now);
          ring.stop(now + 0.14);
        }
      }
    } else if (profile === 'blade') {
      const slash = ctx.createBufferSource();
      slash.buffer = this.createNoiseBuffer(ctx, 0.16, 'pink');
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.setValueAtTime(2900, now);
      hp.frequency.exponentialRampToValueAtTime(480, now + 0.15);
      hp.Q.value = 1.8;

      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.85, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      slash.connect(hp);
      hp.connect(sGain);
      sGain.connect(masterGain);
      slash.start(now);

      const steel = ctx.createOscillator();
      const stGain = ctx.createGain();
      steel.type = 'sawtooth';
      steel.frequency.setValueAtTime(1450, now);
      steel.frequency.exponentialRampToValueAtTime(420, now + 0.1);
      stGain.gain.setValueAtTime(0.18, now);
      stGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      steel.connect(stGain);
      stGain.connect(masterGain);
      steel.start(now);
      steel.stop(now + 0.12);
    } else if (profile === 'chainsaw') {
      const saw1 = ctx.createOscillator();
      const saw2 = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const gain = ctx.createGain();

      saw1.type = 'sawtooth';
      saw2.type = 'square';
      saw1.frequency.setValueAtTime(84, now);
      saw1.frequency.linearRampToValueAtTime(148, now + 0.08);
      saw1.frequency.linearRampToValueAtTime(72, now + 0.22);

      saw2.frequency.setValueAtTime(168, now);
      saw2.frequency.linearRampToValueAtTime(215, now + 0.12);

      mod.type = 'square';
      mod.frequency.setValueAtTime(38, now);
      modGain.gain.setValueAtTime(48, now);
      mod.connect(modGain);
      modGain.connect(saw1.frequency);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1650, now);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

      saw1.connect(lp);
      saw2.connect(lp);
      lp.connect(gain);
      gain.connect(masterGain);

      mod.start(now);
      saw1.start(now);
      saw2.start(now);
      mod.stop(now + 0.23);
      saw1.stop(now + 0.23);
      saw2.stop(now + 0.23);
    } else if (profile === 'shotgun') {
      const blast = ctx.createBufferSource();
      blast.buffer = this.createNoiseBuffer(ctx, 0.34);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(3400, now);
      lp.frequency.exponentialRampToValueAtTime(140, now + 0.32);

      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(1.1, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      blast.connect(lp);
      lp.connect(bGain);
      bGain.connect(masterGain);
      blast.start(now);

      const clink = ctx.createOscillator();
      const cGain = ctx.createGain();
      clink.type = 'sine';
      clink.frequency.setValueAtTime(3200, now + 0.16);
      clink.frequency.exponentialRampToValueAtTime(2600, now + 0.25);
      cGain.gain.setValueAtTime(0.08, now + 0.16);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      clink.connect(cGain);
      cGain.connect(out);
      clink.start(now + 0.16);
      clink.stop(now + 0.27);
    } else if (profile === 'plasma') {
      const zap = ctx.createOscillator();
      const zGain = ctx.createGain();
      zap.type = 'sawtooth';
      zap.frequency.setValueAtTime(1180, now);
      zap.frequency.exponentialRampToValueAtTime(68, now + 0.2);
      zGain.gain.setValueAtTime(0.55, now);
      zGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
      zap.connect(zGain);
      zGain.connect(masterGain);
      zap.start(now);
      zap.stop(now + 0.22);

      const sizzle = ctx.createBufferSource();
      sizzle.buffer = this.createNoiseBuffer(ctx, 0.18);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(3600, now);
      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.28, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      sizzle.connect(hp);
      hp.connect(sGain);
      sGain.connect(masterGain);
      sizzle.start(now);
    } else if (profile === 'flame') {
      const roar = ctx.createBufferSource();
      roar.buffer = this.createNoiseBuffer(ctx, 0.28, 'pink');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(680, now);
      bp.frequency.exponentialRampToValueAtTime(220, now + 0.26);
      bp.Q.value = 0.85;
      const rGain = ctx.createGain();
      rGain.gain.setValueAtTime(0.95, now);
      rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      roar.connect(bp);
      bp.connect(rGain);
      rGain.connect(masterGain);
      roar.start(now);
    } else if (profile === 'gauss') {
      const crack = ctx.createOscillator();
      const cGain = ctx.createGain();
      crack.type = 'square';
      crack.frequency.setValueAtTime(2200, now);
      crack.frequency.exponentialRampToValueAtTime(55, now + 0.18);
      cGain.gain.setValueAtTime(0.52, now);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      crack.connect(cGain);
      cGain.connect(masterGain);
      crack.start(now);
      crack.stop(now + 0.2);

      const boom = ctx.createBufferSource();
      boom.buffer = this.createNoiseBuffer(ctx, 0.25);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1800, now);
      lp.frequency.exponentialRampToValueAtTime(110, now + 0.24);
      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(0.85, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      boom.connect(lp);
      lp.connect(bGain);
      bGain.connect(masterGain);
      boom.start(now);
    } else if (profile === 'nuke') {
      const slam = ctx.createOscillator();
      const sGain = ctx.createGain();
      slam.type = 'sawtooth';
      slam.frequency.setValueAtTime(95, now);
      slam.frequency.exponentialRampToValueAtTime(20, now + 0.42);
      sGain.gain.setValueAtTime(1.0, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
      slam.connect(sGain);
      sGain.connect(masterGain);
      slam.start(now);
      slam.stop(now + 0.45);

      const shock = ctx.createBufferSource();
      shock.buffer = this.createNoiseBuffer(ctx, 0.4);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2200, now);
      lp.frequency.exponentialRampToValueAtTime(85, now + 0.38);
      const shGain = ctx.createGain();
      shGain.gain.setValueAtTime(1.05, now);
      shGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      shock.connect(lp);
      lp.connect(shGain);
      shGain.connect(masterGain);
      shock.start(now);
    } else if (profile === 'shock') {
      const arc = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const aGain = ctx.createGain();
      arc.type = 'sawtooth';
      arc.frequency.setValueAtTime(520, now);
      arc.frequency.exponentialRampToValueAtTime(140, now + 0.19);
      mod.type = 'square';
      mod.frequency.setValueAtTime(64, now);
      modGain.gain.setValueAtTime(280, now);
      mod.connect(modGain);
      modGain.connect(arc.frequency);
      aGain.gain.setValueAtTime(0.42, now);
      aGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      arc.connect(aGain);
      aGain.connect(masterGain);
      mod.start(now);
      arc.start(now);
      mod.stop(now + 0.2);
      arc.stop(now + 0.21);

      const crackle = ctx.createBufferSource();
      crackle.buffer = this.createNoiseBuffer(ctx, 0.16);
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.setValueAtTime(4200, now);
      hp.Q.value = 1.6;
      const cGain = ctx.createGain();
      cGain.gain.setValueAtTime(0.48, now);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      crackle.connect(hp);
      hp.connect(cGain);
      cGain.connect(masterGain);
      crackle.start(now);
    } else if (profile === 'acid') {
      const splash = ctx.createBufferSource();
      splash.buffer = this.createNoiseBuffer(ctx, 0.26, 'pink');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1900, now);
      bp.frequency.exponentialRampToValueAtTime(4800, now + 0.22);
      bp.Q.value = 1.2;
      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(0.8, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      splash.connect(bp);
      bp.connect(sGain);
      sGain.connect(masterGain);
      splash.start(now);

      const hiss = ctx.createBufferSource();
      hiss.buffer = this.createNoiseBuffer(ctx, 0.3);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(4600, now);
      const hGain = ctx.createGain();
      hGain.gain.setValueAtTime(0.32, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      hiss.connect(hp);
      hp.connect(hGain);
      hGain.connect(masterGain);
      hiss.start(now);
    } else if (profile === 'cryo') {
      const crystal = ctx.createOscillator();
      const crGain = ctx.createGain();
      crystal.type = 'triangle';
      crystal.frequency.setValueAtTime(3400, now);
      crystal.frequency.exponentialRampToValueAtTime(980, now + 0.17);
      crGain.gain.setValueAtTime(0.36, now);
      crGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      crystal.connect(crGain);
      crGain.connect(masterGain);
      crystal.start(now);
      crystal.stop(now + 0.19);

      const shatter = ctx.createBufferSource();
      shatter.buffer = this.createNoiseBuffer(ctx, 0.22);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(2800, now);
      const shGain = ctx.createGain();
      shGain.gain.setValueAtTime(0.62, now);
      shGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      shatter.connect(hp);
      hp.connect(shGain);
      shGain.connect(masterGain);
      shatter.start(now);
    } else if (profile === 'explosive') {
      const boomOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      boomOsc.type = 'triangle';
      boomOsc.frequency.setValueAtTime(115, now);
      boomOsc.frequency.exponentialRampToValueAtTime(22, now + 0.36);
      bGain.gain.setValueAtTime(1.05, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      boomOsc.connect(bGain);
      bGain.connect(masterGain);
      boomOsc.start(now);
      boomOsc.stop(now + 0.39);

      const blast = ctx.createBufferSource();
      blast.buffer = this.createNoiseBuffer(ctx, 0.38, 'pink');
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2600, now);
      lp.frequency.exponentialRampToValueAtTime(95, now + 0.36);
      const blGain = ctx.createGain();
      blGain.gain.setValueAtTime(1.1, now);
      blGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      blast.connect(lp);
      lp.connect(blGain);
      blGain.connect(masterGain);
      blast.start(now);
    }

    // Layer meaty flesh slap on crit/rage for weapons too
    if ((isCrit || isRage) && profile !== 'punch' && profile !== 'heavy') {
      this.playRealSample(ctx, out, isRage ? 'heavy' : 'punch', {
        gain: 0.42,
        rate: 0.94 + Math.random() * 0.1,
      });
    }

    // Wet blood splatter layer on crits, rage, or lacerating weapons
    if (isCrit || isRage) {
      this.playBloodSquirt(isRage ? 0.38 : 0.3, isRage ? 1.2 : 1.0);
    } else if (
      profile === 'blade' ||
      profile === 'chainsaw' ||
      profile === 'shotgun' ||
      profile === 'explosive'
    ) {
      this.playBloodSquirt(0.22, 0.75);
    }
  }

  /**
   * Realistic formant-synthesized vocal tract pain groan / strained scream / collapse.
   * Uses custom Rosenberg-style glottal PeriodicWave, 3 vocal formants (F1/F2/F3),
   * subharmonic vocal fry rattle, soft cord saturation, and optional blood-choked throat gurgle.
   */
  public playPainGroan(
    severity: 'light' | 'heavy' | 'agony' | 'ko',
    voicePitch = 1.0,
    isChoking = false,
    species: EnemySpecies = 'human'
  ) {
    const audio = this.getOutput();
    if (!audio) return;

    const perfNow = performance.now();
    const minCooldown = severity === 'ko' || severity === 'agony' ? 75 : 220;
    if (perfNow - this.lastGroanAt < minCooldown) return;
    this.lastGroanAt = perfNow;

    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const fScale = this.getSpeciesFormantScale(species);
    const vocalRate = voicePitch * fScale * (0.95 + Math.random() * 0.1);

    let playedRealVoice = false;
    if (severity === 'ko') {
      playedRealVoice = this.playRealSample(ctx, out, 'ko', {
        gain: 0.84,
        rate: vocalRate,
      });
    } else if (severity === 'agony') {
      playedRealVoice = this.playRealSample(ctx, out, 'scream', {
        gain: 0.78,
        rate: vocalRate,
      });
    } else if (severity === 'heavy') {
      if (Math.random() < 0.45) {
        playedRealVoice = this.playRealSample(ctx, out, 'scream', {
          gain: 0.68,
          rate: vocalRate,
          allowedIndices: [0, 3],
        });
      }
      if (!playedRealVoice) {
        playedRealVoice = this.playRealSample(ctx, out, 'pain', {
          gain: 0.72,
          rate: vocalRate,
          allowedIndices: [3, 4, 5],
        });
      }
    } else {
      playedRealVoice = this.playRealSample(ctx, out, 'pain', {
        gain: 0.62,
        rate: vocalRate,
      });
    }

    if (playedRealVoice) {
      if (isChoking) {
        const gurgleDur = severity === 'ko' || severity === 'agony' ? 0.36 : 0.22;
        const gurgleNoise = ctx.createBufferSource();
        gurgleNoise.buffer = this.createNoiseBuffer(ctx, gurgleDur, 'pink');

        const gurgleFilter = ctx.createBiquadFilter();
        gurgleFilter.type = 'bandpass';
        gurgleFilter.frequency.setValueAtTime(420 * fScale, now);
        gurgleFilter.Q.value = 6.2;

        const bubbleLfo = ctx.createOscillator();
        const bubbleGain = ctx.createGain();
        bubbleLfo.type = 'sine';
        bubbleLfo.frequency.setValueAtTime(28 + Math.random() * 12, now);
        bubbleGain.gain.setValueAtTime(140, now);
        bubbleLfo.connect(bubbleGain);
        bubbleGain.connect(gurgleFilter.frequency);

        const gurgleVol = ctx.createGain();
        gurgleVol.gain.setValueAtTime(0.001, now);
        gurgleVol.gain.linearRampToValueAtTime(0.18, now + 0.04);
        gurgleVol.gain.exponentialRampToValueAtTime(0.001, now + gurgleDur);

        gurgleNoise.connect(gurgleFilter);
        gurgleFilter.connect(gurgleVol);
        gurgleVol.connect(out);
        bubbleLfo.start(now);
        gurgleNoise.start(now);
        bubbleLfo.stop(now + gurgleDur + 0.02);

        if (severity === 'agony' || severity === 'ko') {
          this.scheduleBloodDroplet(ctx, out, now + 0.09, 540 + Math.random() * 240, 0.08, true);
          this.scheduleBloodDroplet(ctx, out, now + 0.21, 720 + Math.random() * 300, 0.065, true);
        }
      }
      return;
    }

    const duration =
      severity === 'ko'
        ? 0.88
        : severity === 'agony'
          ? 0.62
          : severity === 'heavy'
            ? 0.36
            : 0.21;

    const jitterPitch = 0.94 + Math.random() * 0.12;
    const baseFreq =
      (severity === 'agony'
        ? 158
        : severity === 'heavy'
          ? 126
          : severity === 'ko'
            ? 122
            : 108) *
      voicePitch *
      jitterPitch;
    const endFreq =
      (severity === 'ko' ? 54 : severity === 'agony' ? 84 : 68) * voicePitch;

    // 1. Primary glottal source (custom vocal fold waveform)
    const glottis = ctx.createOscillator();
    if (severity === 'agony' || severity === 'heavy') {
      if (this.strainedWave) glottis.setPeriodicWave(this.strainedWave);
    } else if (this.glottalWave) {
      glottis.setPeriodicWave(this.glottalWave);
    }

    glottis.frequency.setValueAtTime(baseFreq * (severity === 'light' ? 1.06 : 0.96), now + 0.01);
    if (severity === 'agony') {
      // Pain spike + voice crack
      glottis.frequency.linearRampToValueAtTime(baseFreq * 1.24, now + 0.085);
      glottis.frequency.linearRampToValueAtTime(baseFreq * 1.04, now + 0.24);
    } else if (severity === 'heavy') {
      glottis.frequency.linearRampToValueAtTime(baseFreq * 1.1, now + 0.06);
    } else if (severity === 'ko') {
      glottis.frequency.linearRampToValueAtTime(baseFreq * 1.12, now + 0.07);
    }
    glottis.frequency.exponentialRampToValueAtTime(Math.max(36, endFreq), now + duration);

    // 2. Vocal tremor + irregular cord flutter
    const vibrato = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(severity === 'agony' ? 19 : severity === 'ko' ? 13 : 11, now);
    vibGain.gain.setValueAtTime(severity === 'agony' ? 11 : severity === 'ko' ? 7 : 4.5, now);
    vibrato.connect(vibGain);
    vibGain.connect(glottis.frequency);

    // 3. Subharmonic vocal fry / chest growl (adds raw strained throat grit)
    const fryOsc = ctx.createOscillator();
    if (this.glottalWave) fryOsc.setPeriodicWave(this.glottalWave);
    fryOsc.frequency.setValueAtTime(Math.max(28, baseFreq * 0.5), now);
    fryOsc.frequency.exponentialRampToValueAtTime(Math.max(22, endFreq * 0.5), now + duration);
    const fryGain = ctx.createGain();
    const fryLevel =
      species !== 'human' ? 0.58 : severity === 'agony' || severity === 'ko' ? 0.42 : 0.24;
    fryGain.gain.setValueAtTime(fryLevel, now);

    // 4. Aspirated throat breath / air rush (pink noise gives organic chest exhale)
    const breath = ctx.createBufferSource();
    breath.buffer = this.createNoiseBuffer(ctx, duration + 0.05, 'pink');
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(1450 * fScale, now);
    breathFilter.Q.value = 1.1;
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(severity === 'ko' ? 0.48 : severity === 'agony' ? 0.36 : 0.28, now);
    if (severity === 'ko') {
      // Long breathless death/KO exhale tail
      breathGain.gain.linearRampToValueAtTime(0.32, now + duration * 0.65);
      breathGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }

    // Mix excitation -> subtle soft-clipping vocal strain shaper
    const sourceBus = ctx.createGain();
    sourceBus.gain.setValueAtTime(1.0, now);
    glottis.connect(sourceBus);
    fryOsc.connect(fryGain);
    fryGain.connect(sourceBus);
    breath.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(sourceBus);

    const shaper = ctx.createWaveShaper();
    if (this.softClipCurve) shaper.curve = this.softClipCurve;
    sourceBus.connect(shaper);

    // 5. Triple Parallel Vocal Formant Tract (F1 + F2 + F3)
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(
      (severity === 'agony' ? 760 : severity === 'heavy' ? 620 : severity === 'ko' ? 580 : 480) * fScale,
      now
    );
    f1.frequency.exponentialRampToValueAtTime(
      (severity === 'ko' ? 270 : 340) * fScale,
      now + duration
    );
    f1.Q.value = 4.6;

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(
      (severity === 'agony' ? 1360 : severity === 'heavy' ? 1160 : severity === 'ko' ? 1050 : 980) * fScale,
      now
    );
    f2.frequency.exponentialRampToValueAtTime(
      (severity === 'ko' ? 660 : 790) * fScale,
      now + duration
    );
    f2.Q.value = 5.4;

    const f3 = ctx.createBiquadFilter();
    f3.type = 'bandpass';
    f3.frequency.setValueAtTime(2480 * fScale, now);
    f3.frequency.exponentialRampToValueAtTime(1950 * fScale, now + duration);
    f3.Q.value = 4.5;

    const f1Gain = ctx.createGain();
    f1Gain.gain.setValueAtTime(1.0, now);
    const f2Gain = ctx.createGain();
    f2Gain.gain.setValueAtTime(0.65, now);
    const f3Gain = ctx.createGain();
    f3Gain.gain.setValueAtTime(severity === 'agony' ? 0.34 : 0.2, now);

    const vocalGain = ctx.createGain();
    const peakVol =
      severity === 'ko' ? 0.42 : severity === 'agony' ? 0.44 : severity === 'heavy' ? 0.33 : 0.24;
    vocalGain.gain.setValueAtTime(0.001, now);
    vocalGain.gain.linearRampToValueAtTime(peakVol, now + 0.028);
    vocalGain.gain.setValueAtTime(peakVol * 0.88, now + duration * 0.38);
    vocalGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    shaper.connect(f1);
    shaper.connect(f2);
    shaper.connect(f3);
    f1.connect(f1Gain);
    f2.connect(f2Gain);
    f3.connect(f3Gain);
    f1Gain.connect(vocalGain);
    f2Gain.connect(vocalGain);
    f3Gain.connect(vocalGain);
    vocalGain.connect(out);

    // 6. Wet blood-choked throat gurgle + airway bubbling when bleeding inside mouth/nose
    if (isChoking) {
      const gurgleNoise = ctx.createBufferSource();
      gurgleNoise.buffer = this.createNoiseBuffer(ctx, duration, 'pink');

      const gurgleFilter1 = ctx.createBiquadFilter();
      gurgleFilter1.type = 'bandpass';
      gurgleFilter1.frequency.setValueAtTime(290 * fScale, now);
      gurgleFilter1.Q.value = 7.5;

      const gurgleFilter2 = ctx.createBiquadFilter();
      gurgleFilter2.type = 'bandpass';
      gurgleFilter2.frequency.setValueAtTime(620 * fScale, now);
      gurgleFilter2.Q.value = 6.2;

      const bubbleLfo = ctx.createOscillator();
      const bubbleGain = ctx.createGain();
      bubbleLfo.type = 'sine';
      bubbleLfo.frequency.setValueAtTime(26 + Math.random() * 14, now);
      bubbleGain.gain.setValueAtTime(165, now);
      bubbleLfo.connect(bubbleGain);
      bubbleGain.connect(gurgleFilter1.frequency);
      bubbleGain.connect(gurgleFilter2.frequency);

      const gurgleVol = ctx.createGain();
      gurgleVol.gain.setValueAtTime(0.001, now);
      gurgleVol.gain.linearRampToValueAtTime(0.28, now + 0.045);
      gurgleVol.gain.exponentialRampToValueAtTime(0.001, now + duration);

      gurgleNoise.connect(gurgleFilter1);
      gurgleNoise.connect(gurgleFilter2);
      gurgleFilter1.connect(gurgleVol);
      gurgleFilter2.connect(gurgleVol);
      gurgleVol.connect(out);

      bubbleLfo.start(now);
      gurgleNoise.start(now);
      bubbleLfo.stop(now + duration + 0.02);

      // Extra wet mouth droplets on heavy agony
      if (severity === 'agony' || severity === 'ko') {
        this.scheduleBloodDroplet(ctx, out, now + 0.09, 540 + Math.random() * 240, 0.09, true);
        this.scheduleBloodDroplet(ctx, out, now + 0.21, 720 + Math.random() * 300, 0.075, true);
      }
    }

    vibrato.start(now);
    glottis.start(now);
    fryOsc.start(now);
    breath.start(now);

    vibrato.stop(now + duration + 0.03);
    glottis.stop(now + duration + 0.03);
    fryOsc.stop(now + duration + 0.03);
  }

  /**
   * Shuddering agony gasp / ragged wheezing inhale-exhale when severely battered or in shock.
   */
  public playAgonyGasp(
    voicePitch = 1.0,
    isChoking = false,
    species: EnemySpecies = 'human',
    distress = 0.65
  ) {
    const audio = this.getOutput();
    if (!audio) return;

    const perfNow = performance.now();
    if (perfNow - this.lastAgonyAt < 1450) return;
    this.lastAgonyAt = perfNow;

    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const fScale = this.getSpeciesFormantScale(species);
    const vocalRate = voicePitch * fScale * (0.9 + Math.random() * 0.08);

    const playedRealAgony =
      distress >= 0.78 && Math.random() < 0.32
        ? this.playRealSample(ctx, out, 'cry', {
            gain: 0.44,
            rate: vocalRate,
          })
        : this.playRealSample(ctx, out, 'pain', {
            gain: Math.min(0.62, 0.4 + distress * 0.2),
            rate: vocalRate * 0.94,
            lowpassHz: 2600,
          });

    if (playedRealAgony) {
      if (isChoking) {
        this.scheduleBloodDroplet(ctx, out, now + 0.14, 460 + Math.random() * 180, 0.065, true);
      }
      return;
    }

    // Phase 1: Sharp desperate inhalation rasp ("hhhk-...")
    const inhaleDur = 0.16;
    const inhale = ctx.createBufferSource();
    inhale.buffer = this.createNoiseBuffer(ctx, inhaleDur, 'pink');
    const inFilter = ctx.createBiquadFilter();
    inFilter.type = 'bandpass';
    inFilter.frequency.setValueAtTime(1150 * fScale, now);
    inFilter.frequency.linearRampToValueAtTime(1850 * fScale, now + inhaleDur);
    inFilter.Q.value = 2.8;

    const inGain = ctx.createGain();
    inGain.gain.setValueAtTime(0.001, now);
    inGain.gain.linearRampToValueAtTime(0.14 * distress, now + 0.05);
    inGain.gain.exponentialRampToValueAtTime(0.001, now + inhaleDur);

    inhale.connect(inFilter);
    inFilter.connect(inGain);
    inGain.connect(out);
    inhale.start(now);

    // Phase 2: Trembling strained agony exhale ("...aaah-uuuhhh...")
    const exOffset = 0.17;
    const exDur = 0.44;
    const osc = ctx.createOscillator();
    if (this.glottalWave) osc.setPeriodicWave(this.glottalWave);
    const f0 = (138 + Math.random() * 18) * voicePitch;
    osc.frequency.setValueAtTime(f0, now + exOffset);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, f0 * 0.64), now + exOffset + exDur);

    const trem = ctx.createOscillator();
    const tremGain = ctx.createGain();
    trem.frequency.setValueAtTime(15 + Math.random() * 5, now + exOffset);
    tremGain.gain.setValueAtTime(8, now + exOffset);
    trem.connect(tremGain);
    tremGain.connect(osc.frequency);

    const breathEx = ctx.createBufferSource();
    breathEx.buffer = this.createNoiseBuffer(ctx, exDur, 'pink');
    const breathMix = ctx.createGain();
    breathMix.gain.setValueAtTime(0.32, now + exOffset);

    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(590 * fScale, now + exOffset);
    f1.frequency.exponentialRampToValueAtTime(360 * fScale, now + exOffset + exDur);
    f1.Q.value = 4.5;

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1120 * fScale, now + exOffset);
    f2.frequency.exponentialRampToValueAtTime(820 * fScale, now + exOffset + exDur);
    f2.Q.value = 5.0;

    const exGain = ctx.createGain();
    const vol = Math.min(0.24, 0.14 + distress * 0.1);
    exGain.gain.setValueAtTime(0.001, now + exOffset);
    exGain.gain.linearRampToValueAtTime(vol, now + exOffset + 0.06);
    exGain.gain.exponentialRampToValueAtTime(0.001, now + exOffset + exDur);

    osc.connect(f1);
    osc.connect(f2);
    breathEx.connect(breathMix);
    breathMix.connect(f1);
    breathMix.connect(f2);
    f1.connect(exGain);
    f2.connect(exGain);
    exGain.connect(out);

    trem.start(now + exOffset);
    osc.start(now + exOffset);
    breathEx.start(now + exOffset);
    trem.stop(now + exOffset + exDur + 0.02);
    osc.stop(now + exOffset + exDur + 0.02);

    if (isChoking) {
      this.scheduleBloodDroplet(ctx, out, now + exOffset + 0.12, 460 + Math.random() * 180, 0.065, true);
    }
  }

  /**
   * Wet blood-choked cough / gag when mouth, nose, or teeth are ruptured.
   */
  public playBloodCough(voicePitch = 1.0, species: EnemySpecies = 'human') {
    const audio = this.getOutput();
    if (!audio) return;

    const perfNow = performance.now();
    if (perfNow - this.lastCoughAt < 1600) return;
    this.lastCoughAt = perfNow;

    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const fScale = this.getSpeciesFormantScale(species);

    [0, 0.15].forEach((offset, idx) => {
      const dur = idx === 0 ? 0.11 : 0.17;
      const t = now + offset;

      const osc = ctx.createOscillator();
      if (this.strainedWave) osc.setPeriodicWave(this.strainedWave);
      const startF = (idx === 0 ? 145 : 122) * voicePitch;
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(42, startF * 0.56), t + dur);

      const wetNoise = ctx.createBufferSource();
      wetNoise.buffer = this.createNoiseBuffer(ctx, dur, 'pink');

      const throatBp = ctx.createBiquadFilter();
      throatBp.type = 'bandpass';
      throatBp.frequency.setValueAtTime(520 * fScale, t);
      throatBp.Q.value = 3.8;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(34, t);
      lfoGain.gain.setValueAtTime(140, t);
      lfo.connect(lfoGain);
      lfoGain.connect(throatBp.frequency);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(idx === 0 ? 0.22 : 0.25, t + 0.018);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(throatBp);
      wetNoise.connect(throatBp);
      throatBp.connect(g);
      g.connect(out);

      lfo.start(t);
      osc.start(t);
      wetNoise.start(t);
      lfo.stop(t + dur + 0.02);
      osc.stop(t + dur + 0.02);

      // Spitting blood micro-droplets
      this.scheduleBloodDroplet(ctx, out, t + 0.04, 620 + Math.random() * 260, 0.075, true);
      if (idx === 1) {
        this.scheduleBloodDroplet(ctx, out, t + 0.09, 880 + Math.random() * 340, 0.06, false);
      }
    });
  }

  /**
   * Trembling choked crying / sobbing vocal sound when enemy is broken & weeping
   */
  public playCryingSob(voicePitch = 1.0, species: EnemySpecies = 'human') {
    const audio = this.getOutput();
    if (!audio) return;

    const perfNow = performance.now();
    if (perfNow - this.lastSobAt < 2200) return;
    this.lastSobAt = perfNow;

    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const fScale = this.getSpeciesFormantScale(species);
    const vocalRate = voicePitch * fScale * (0.96 + Math.random() * 0.08);

    if (this.playRealSample(ctx, out, 'cry', { gain: 0.74, rate: vocalRate })) {
      return;
    }

    // Subtle tearful sniff/hitch before the sob
    const hitch = ctx.createBufferSource();
    hitch.buffer = this.createNoiseBuffer(ctx, 0.09, 'pink');
    const hitchBp = ctx.createBiquadFilter();
    hitchBp.type = 'bandpass';
    hitchBp.frequency.setValueAtTime(1600 * fScale, now);
    hitchBp.Q.value = 3.0;
    const hitchGain = ctx.createGain();
    hitchGain.gain.setValueAtTime(0.001, now);
    hitchGain.gain.linearRampToValueAtTime(0.08, now + 0.025);
    hitchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    hitch.connect(hitchBp);
    hitchBp.connect(hitchGain);
    hitchGain.connect(out);
    hitch.start(now);

    // Two trembling choked whimper pulses ("uh-uhh...")
    [0.09, 0.25].forEach((offset, idx) => {
      const dur = idx === 0 ? 0.14 : 0.27;
      const t = now + offset;
      const osc = ctx.createOscillator();
      if (this.glottalWave) osc.setPeriodicWave(this.glottalWave);
      const startF = (idx === 0 ? 178 : 158) * voicePitch;
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(42, startF * 0.66), t + dur);

      const trem = ctx.createOscillator();
      const tGain = ctx.createGain();
      trem.frequency.setValueAtTime(21, t);
      tGain.gain.setValueAtTime(12, t);
      trem.connect(tGain);
      tGain.connect(osc.frequency);

      const breath = ctx.createBufferSource();
      breath.buffer = this.createNoiseBuffer(ctx, dur, 'pink');
      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(0.24, t);

      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(540 * fScale, t);
      f1.frequency.exponentialRampToValueAtTime(360 * fScale, t + dur);
      f1.Q.value = 4.6;

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(1060 * fScale, t);
      f2.frequency.exponentialRampToValueAtTime(760 * fScale, t + dur);
      f2.Q.value = 5.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.19, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(f1);
      osc.connect(f2);
      breath.connect(bGain);
      bGain.connect(f1);
      bGain.connect(f2);
      f1.connect(gain);
      f2.connect(gain);
      gain.connect(out);

      trem.start(t);
      osc.start(t);
      breath.start(t);
      trem.stop(t + dur + 0.02);
      osc.stop(t + dur + 0.02);
    });
  }

  /**
   * Exclusive maniacal laughter for the Joker boss while hit, idle, or KO,
   * shifting tone and intensity as HP drops.
   */
  public playJokerLaugh(_voicePitch = 1.04, force = false, intense = false, hpRatio = 1.0) {
    const audio = this.getOutput();
    if (!audio) return;

    const basePhase = getVocalPhase(hpRatio);
    const effectivePhase: VocalPhase =
      basePhase === 'cocky' && intense ? 'aggressive' : basePhase;

    const perfNow = performance.now();
    const minCooldown = force
      ? 0
      : effectivePhase === 'psychotic'
        ? 1150
        : effectivePhase === 'aggressive' || intense
          ? 1450
          : 1950;
    if (perfNow - this.lastLaughAt < minCooldown) return;
    if (!force && perfNow < this.speechActiveUntil - 200) return;

    const buffer = this.pickCategoryBuffer('joker_laugh', JOKER_PHASE_POOLS[effectivePhase]);
    if (!buffer) return;

    const gain =
      effectivePhase === 'psychotic' ? 1.02 : effectivePhase === 'aggressive' ? 0.95 : 0.86;
    const rate =
      effectivePhase === 'psychotic' ? 1.05 : effectivePhase === 'aggressive' ? 1.02 : 0.985;

    this.lastLaughAt = perfNow;
    this.playCleanSpeechSample(audio.ctx, 'joker', 'joker_laugh', buffer, gain, effectivePhase, rate);
  }

  /**
   * Exclusive random iconic GTA V voice lines for Trevor Philips (while hit or idle),
   * escalating from cocky taunts -> aggressive profanity -> desperate psychotic meltdowns as HP falls.
   */
  public playTrevorQuote(
    force = false,
    hpRatio = 1.0
  ): { text: string; phase: VocalPhase; durationMs: number } | null {
    const phase = getVocalPhase(hpRatio);
    const perfNow = performance.now();
    const minCooldown = force
      ? phase === 'psychotic'
        ? 1050
        : 1350
      : phase === 'psychotic'
        ? 1900
        : phase === 'aggressive'
          ? 2200
          : 2600;
    if (perfNow - this.lastTrevorTalkAt < minCooldown) return null;
    if (!force && perfNow < this.speechActiveUntil - 150) return null;

    const urls = REAL_SFX_MANIFEST.trevor_talk;
    const lastIdx = this.lastCategoryIndex.get('trevor_talk');
    const allowedIndices = TREVOR_PHASE_POOLS[phase];

    const audio = this.getOutput();
    if (audio) {
      const loadedIndices = allowedIndices.filter((i) => this.sampleBuffers.has(urls[i]));
      const fallbackLoaded =
        loadedIndices.length > 0
          ? loadedIndices
          : urls.map((_, i) => i).filter((i) => this.sampleBuffers.has(urls[i]));

      if (fallbackLoaded.length > 0) {
        const pool =
          fallbackLoaded.length > 1 && lastIdx !== undefined
            ? fallbackLoaded.filter((i) => i !== lastIdx)
            : fallbackLoaded;
        const chosenIdx = pool[Math.floor(Math.random() * pool.length)];
        const buf = this.sampleBuffers.get(urls[chosenIdx]);
        if (buf) {
          const gain = phase === 'psychotic' ? 1.04 : phase === 'aggressive' ? 0.98 : 0.90;
          const rate = phase === 'psychotic' ? 1.03 : phase === 'aggressive' ? 1.015 : 1.0;
          const durationMs = Math.round((buf.duration / rate) * 1000);
          this.lastTrevorTalkAt = perfNow;
          this.lastCategoryIndex.set('trevor_talk', chosenIdx);
          this.playCleanSpeechSample(
            audio.ctx,
            'trevor_gta5',
            'trevor_talk',
            buf,
            gain,
            phase,
            rate
          );
          return { text: TREVOR_QUOTES[chosenIdx] ?? '', phase, durationMs };
        }
      }
    }

    // Fallback when muted or samples are still decoding on the very first second
    const fallbackPool = allowedIndices.filter((i) => i !== lastIdx);
    const sourcePool = fallbackPool.length > 0 ? fallbackPool : allowedIndices;
    const chosenIdx = sourcePool[Math.floor(Math.random() * sourcePool.length)];
    this.lastTrevorTalkAt = perfNow;
    this.lastCategoryIndex.set('trevor_talk', chosenIdx);
    return { text: TREVOR_QUOTES[chosenIdx] ?? '', phase, durationMs: 2200 };
  }

  /**
   * Triggers real iconic audio clips from the actual YouTuber scaled by HP phase,
   * routed through speechAnalyser for authentic 60fps facial lip-sync (zero AI TTS).
   */
  public playMiniBossQuote(
    miniBossId: MiniBossId,
    force = false,
    hpRatio = 1.0
  ): { text: string; phase: VocalPhase; durationMs: number } | null {
    const phase = getVocalPhase(hpRatio);
    const perfNow = performance.now();
    const minCooldown = force
      ? phase === 'psychotic'
        ? 1050
        : 1350
      : phase === 'psychotic'
        ? 2000
        : phase === 'aggressive'
          ? 2400
          : 2900;
    if (perfNow - this.lastMiniBossTalkAt < minCooldown) return null;
    if (!force && perfNow < this.speechActiveUntil - 150) return null;

    const allClips = MINI_BOSS_SPEECH_MANIFEST[miniBossId] ?? [];
    if (allClips.length === 0) return null;

    const phaseClips = allClips.filter((c) => c.phase === phase);
    const desiredPool = phaseClips.length > 0 ? phaseClips : allClips;
    const lastUrl = this.lastMiniBossQuoteUrl.get(miniBossId);

    const audio = this.getOutput();
    if (audio) {
      void this.preloadMiniBossSamples(audio.ctx, miniBossId);

      const loadedPhaseClips = desiredPool.filter((c) => this.sampleBuffers.has(c.url));
      const loadedFallback =
        loadedPhaseClips.length > 0
          ? loadedPhaseClips
          : allClips.filter((c) => this.sampleBuffers.has(c.url));

      if (loadedFallback.length === 0) {
        // Wait until real MP3 buffer finishes decoding so quote & real person's voice always fire together
        return null;
      }

      const pool =
        loadedFallback.length > 1 && lastUrl
          ? loadedFallback.filter((c) => c.url !== lastUrl)
          : loadedFallback;
      const chosen = pool[Math.floor(Math.random() * pool.length)] ?? loadedFallback[0];
      const buf = this.sampleBuffers.get(chosen.url);
      if (!buf) return null;

      const gain = phase === 'psychotic' ? 1.04 : phase === 'aggressive' ? 0.98 : 0.92;
      // Preserve authentic creator voice pitch/cadence with subtle urgency boost under heavy damage
      const rate = phase === 'psychotic' ? 1.02 : phase === 'aggressive' ? 1.01 : 1.0;
      const durationMs = Math.round((buf.duration / rate) * 1000);

      this.lastMiniBossTalkAt = perfNow;
      this.lastMiniBossQuoteUrl.set(miniBossId, chosen.url);
      this.playCleanSpeechSample(
        audio.ctx,
        miniBossId,
        'miniboss_talk',
        buf,
        gain,
        phase,
        rate
      );
      return { text: chosen.text, phase, durationMs };
    }

    // Muted mode: show synced subtitle phrase without audio
    const pool =
      desiredPool.length > 1 && lastUrl
        ? desiredPool.filter((c) => c.url !== lastUrl)
        : desiredPool;
    const chosen = pool[Math.floor(Math.random() * pool.length)] ?? desiredPool[0];
    this.lastMiniBossTalkAt = perfNow;
    this.lastMiniBossQuoteUrl.set(miniBossId, chosen.url);
    return { text: chosen.text, phase, durationMs: 2400 };
  }

  public playBlockedHit() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    if (
      this.playRealSample(ctx, out, 'punch', {
        gain: 0.56,
        rate: 0.78 + Math.random() * 0.08,
        lowpassHz: 460,
      })
    ) {
      return;
    }

    const thud = ctx.createOscillator();
    const gain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(140, now);
    thud.frequency.exponentialRampToValueAtTime(48, now + 0.09);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    thud.connect(gain);
    gain.connect(out);
    thud.start(now);
    thud.stop(now + 0.1);
  }

  public playCounterHit() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    if (
      this.playRealSample(ctx, out, 'heavy', {
        gain: 0.92,
        rate: 0.9 + Math.random() * 0.08,
      })
    ) {
      return;
    }

    const sub = ctx.createOscillator();
    const sGain = ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(190, now);
    sub.frequency.exponentialRampToValueAtTime(34, now + 0.25);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(600, now);

    sGain.gain.setValueAtTime(0.68, now);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    sub.connect(lp);
    lp.connect(sGain);
    sGain.connect(out);
    sub.start(now);
    sub.stop(now + 0.27);
  }

  public playBoneCrack(heavySkull = false) {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    if (
      this.playRealSample(ctx, out, 'bone', {
        gain: heavySkull ? 0.95 : 0.8,
        rate: (heavySkull ? 0.86 : 1.0) * (0.95 + Math.random() * 0.09),
      })
    ) {
      if (heavySkull) {
        this.playRealSample(ctx, out, 'bone', {
          gain: 0.55,
          rate: 0.82,
          delay: 0.045,
        });
      }
      return;
    }

    const offsets = heavySkull ? [0, 0.026, 0.068] : [0, 0.032];
    offsets.forEach((offset, idx) => {
      const snap = ctx.createBufferSource();
      snap.buffer = this.createNoiseBuffer(ctx, heavySkull ? 0.08 : 0.055);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(idx === 0 ? 2450 : idx === 1 ? 1480 : 980, now + offset);
      bp.Q.value = heavySkull ? 2.1 : 2.6;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(heavySkull ? 0.85 : 0.68, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + (heavySkull ? 0.08 : 0.055));

      snap.connect(bp);
      bp.connect(gain);
      gain.connect(out);
      snap.start(now + offset);
    });

    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = heavySkull ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(heavySkull ? 210 : 340, now);
    osc.frequency.exponentialRampToValueAtTime(heavySkull ? 46 : 92, now + (heavySkull ? 0.14 : 0.075));
    oGain.gain.setValueAtTime(heavySkull ? 0.36 : 0.24, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + (heavySkull ? 0.15 : 0.08));
    osc.connect(oGain);
    oGain.connect(out);
    osc.start(now);
    osc.stop(now + (heavySkull ? 0.16 : 0.085));
  }

  public playFleshTear() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    // Fibrous tissue ripping
    const tear = ctx.createBufferSource();
    tear.buffer = this.createNoiseBuffer(ctx, 0.24, 'pink');

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1650, now);
    bp.frequency.exponentialRampToValueAtTime(310, now + 0.22);
    bp.Q.value = 3.2;

    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    mod.type = 'square';
    mod.frequency.setValueAtTime(44, now);
    modGain.gain.setValueAtTime(260, now);
    mod.connect(modGain);
    modGain.connect(bp.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.58, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    tear.connect(bp);
    bp.connect(gain);
    gain.connect(out);

    mod.start(now);
    tear.start(now);
    mod.stop(now + 0.25);

    // Wet meaty squelch + trailing droplet pops
    const squelch = ctx.createBufferSource();
    squelch.buffer = this.createNoiseBuffer(ctx, 0.18, 'pink');
    const sqFilter = ctx.createBiquadFilter();
    sqFilter.type = 'bandpass';
    sqFilter.frequency.setValueAtTime(340, now + 0.03);
    sqFilter.frequency.exponentialRampToValueAtTime(150, now + 0.18);
    sqFilter.Q.value = 4.5;
    const sqGain = ctx.createGain();
    sqGain.gain.setValueAtTime(0.42, now + 0.03);
    sqGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    squelch.connect(sqFilter);
    sqFilter.connect(sqGain);
    sqGain.connect(out);
    squelch.start(now + 0.03);

    this.scheduleBloodDroplet(ctx, out, now + 0.06, 520, 0.08, true);
    this.scheduleBloodDroplet(ctx, out, now + 0.13, 760, 0.065, true);
  }

  public playHeartbeat(intensity = 1) {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    [
      { offset: 0, freq: 58, vol: 0.24 * intensity },
      { offset: 0.16, freq: 44, vol: 0.18 * intensity },
    ].forEach((beat) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(beat.freq, now + beat.offset);
      osc.frequency.exponentialRampToValueAtTime(28, now + beat.offset + 0.12);

      gain.gain.setValueAtTime(0.001, now + beat.offset);
      gain.gain.linearRampToValueAtTime(beat.vol, now + beat.offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + beat.offset + 0.13);

      osc.connect(gain);
      gain.connect(out);
      osc.start(now + beat.offset);
      osc.stop(now + beat.offset + 0.14);
    });
  }

  /**
   * Pressurized arterial blood jet synced with cardiac pulse when an artery is ruptured.
   */
  public playArterialSpurt(intensity = 1.0) {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    // Tight pressurized jet spray
    const jet = ctx.createBufferSource();
    jet.buffer = this.createNoiseBuffer(ctx, 0.14, 'pink');

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2150, now);
    bp.frequency.exponentialRampToValueAtTime(720, now + 0.13);
    bp.Q.value = 2.6;

    const flutter = ctx.createOscillator();
    const flGain = ctx.createGain();
    flutter.frequency.setValueAtTime(42, now);
    flGain.gain.setValueAtTime(420, now);
    flutter.connect(flGain);
    flGain.connect(bp.frequency);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.2 * intensity, now + 0.014);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.135);

    jet.connect(bp);
    bp.connect(g);
    g.connect(out);

    flutter.start(now);
    jet.start(now);
    flutter.stop(now + 0.15);

    // 2 trailing wet blood drops hitting the floor after spurt
    this.scheduleBloodDroplet(ctx, out, now + 0.08 + Math.random() * 0.04, 480 + Math.random() * 240, 0.065, true);
    this.scheduleBloodDroplet(ctx, out, now + 0.18 + Math.random() * 0.05, 680 + Math.random() * 320, 0.045, false);
  }

  /**
   * Realistic wet blood splatter / squirt: meaty squelch + fluttered liquid spray + micro-droplet pops.
   */
  public playBloodSquirt(volume = 0.28, intensity = 1.0) {
    const audio = this.getOutput();
    if (!audio) return;

    const perfNow = performance.now();
    if (perfNow - this.lastSquirtAt < 45) return;
    this.lastSquirtAt = perfNow;

    const { ctx, out } = audio;
    const now = ctx.currentTime;

    // 1. Pressurized wet spray with flutter modulation (sounds like liquid, not static)
    const spray = ctx.createBufferSource();
    spray.buffer = this.createNoiseBuffer(ctx, 0.2, 'pink');

    const sprayBp = ctx.createBiquadFilter();
    sprayBp.type = 'bandpass';
    sprayBp.frequency.setValueAtTime(2300, now);
    sprayBp.frequency.exponentialRampToValueAtTime(520, now + 0.18);
    sprayBp.Q.value = 2.4;

    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(36 + Math.random() * 14, now);
    modGain.gain.setValueAtTime(480, now);
    mod.connect(modGain);
    modGain.connect(sprayBp.frequency);

    const sprayGain = ctx.createGain();
    sprayGain.gain.setValueAtTime(0.001, now);
    sprayGain.gain.linearRampToValueAtTime(volume * 0.9, now + 0.012);
    sprayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    spray.connect(sprayBp);
    sprayBp.connect(sprayGain);
    sprayGain.connect(out);
    mod.start(now);
    spray.start(now);
    mod.stop(now + 0.2);

    // 2. Low-mid wet squelch body
    const squelch = ctx.createBufferSource();
    squelch.buffer = this.createNoiseBuffer(ctx, 0.15, 'pink');
    const sqBp = ctx.createBiquadFilter();
    sqBp.type = 'bandpass';
    sqBp.frequency.setValueAtTime(420, now);
    sqBp.frequency.exponentialRampToValueAtTime(160, now + 0.14);
    sqBp.Q.value = 4.2;

    const sqGain = ctx.createGain();
    sqGain.gain.setValueAtTime(volume * 0.85, now);
    sqGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    squelch.connect(sqBp);
    sqBp.connect(sqGain);
    sqGain.connect(out);
    squelch.start(now);

    // 3. Staggered blood droplet splatter pops hitting skin/ground
    const dropCount = Math.min(8, Math.max(3, Math.round(4 * intensity)));
    for (let i = 0; i < dropCount; i++) {
      const delay = 0.018 + i * 0.022 + Math.random() * 0.028;
      const pitch = 420 + Math.random() * 680;
      const dropVol = volume * (0.26 - i * 0.022);
      if (dropVol > 0.015) {
        this.scheduleBloodDroplet(ctx, out, now + delay, pitch, dropVol, i % 2 === 0);
      }
    }
  }

  /**
   * Subtle viscous blood dripping onto the arena floor during active bleeding.
   */
  public playBloodDrip(intensity = 0.6) {
    const audio = this.getOutput();
    if (!audio) return;

    const perfNow = performance.now();
    if (perfNow - this.lastBloodDripAt < 520) return;
    this.lastBloodDripAt = perfNow;

    const { ctx, out } = audio;
    const now = ctx.currentTime;
    const pitch = 390 + Math.random() * 440;
    const vol = Math.min(0.14, 0.055 + intensity * 0.065);
    this.scheduleBloodDroplet(ctx, out, now, pitch, vol, true);

    if (intensity > 0.7 && Math.random() < 0.5) {
      this.scheduleBloodDroplet(
        ctx,
        out,
        now + 0.09 + Math.random() * 0.08,
        520 + Math.random() * 420,
        vol * 0.65,
        false
      );
    }
  }

  public playStunRing() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2650, now);
    osc.frequency.exponentialRampToValueAtTime(1850, now + 0.55);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.56);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.57);
  }

  public playRageActivate() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.35);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playExecution() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    const sub = ctx.createOscillator();
    const sGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(24, now + 0.45);
    sGain.gain.setValueAtTime(0.95, now);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    sub.connect(sGain);
    sGain.connect(out);
    sub.start(now);
    sub.stop(now + 0.5);

    this.playBoneCrack(true);
    this.playFleshTear();
    this.playBloodSquirt(0.55, 1.5);
  }

  public playKoBell() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const dingTimes = [0, 0.16, 0.32];

    dingTimes.forEach((offset) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(1180, now + offset);
      osc2.frequency.setValueAtTime(2365, now + offset);

      gain.gain.setValueAtTime(0.28, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.48);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(out);

      osc1.start(now + offset);
      osc2.start(now + offset);
      osc1.stop(now + offset + 0.49);
      osc2.stop(now + offset + 0.49);
    });
  }

  public playEquip() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playPurchase() {
    const audio = this.getOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const notes = [660, 990];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.2, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.17);
    });
  }
}

export const soundFx = new SoundEngine();
