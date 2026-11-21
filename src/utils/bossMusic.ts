import { BossId } from '../data/gameData';

export interface BossTrackInfo {
  bossId: BossId;
  src: string;
  title: string;
  artist: string;
}

export const BOSS_MUSIC_TRACKS: Record<BossId, BossTrackInfo> = {
  trevor_gta5: {
    bossId: 'trevor_gta5',
    src: '/audio/bosses/trevor_gta5.mp3',
    title: 'Fast Fight Battle',
    artist: 'OpenGameArt CC0',
  },
  john_wick: {
    bossId: 'john_wick',
    src: '/audio/bosses/john_wick.mp3',
    title: 'Trance Boss Battle (150 BPM)',
    artist: 'MintoDog · CC0',
  },
  kratos: {
    bossId: 'kratos',
    src: '/audio/bosses/kratos.mp3',
    title: 'Epic Boss Battle',
    artist: 'Juhani Junkala · CC0',
  },
  t800: {
    bossId: 't800',
    src: '/audio/bosses/t800.mp3',
    title: 'Dramatic Boss Encounter',
    artist: 'OpenGameArt CC0',
  },
  wolverine: {
    bossId: 'wolverine',
    src: '/audio/bosses/wolverine.mp3',
    title: 'Epic Rock Battle',
    artist: 'HydroGene · CC0',
  },
  geralt: {
    bossId: 'geralt',
    src: '/audio/bosses/geralt.mp3',
    title: 'Battle Theme A',
    artist: 'cynicmusic · CC0',
  },
  joker: {
    bossId: 'joker',
    src: '/audio/bosses/joker.mp3',
    title: 'Sinister Boss Appears',
    artist: 'cynicmusic · CC0',
  },
  thanos: {
    bossId: 'thanos',
    src: '/audio/bosses/thanos.mp3',
    title: 'Epic Endgame Cinematic',
    artist: 'OpenGameArt CC0',
  },
  arthur_morgan: {
    bossId: 'arthur_morgan',
    src: '/audio/bosses/arthur_morgan.mp3',
    title: 'Western Rock-Metal Showdown',
    artist: 'OpenGameArt CC0',
  },
};

const TARGET_VOLUME = 0.42;

class BossMusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private activeBossId: BossId | null = null;
  private desiredBossId: BossId | null = null;
  private muted = false;
  private fadeTimer: number | null = null;
  private unlockListenerAttached = false;

  private ensureUnlockListener() {
    if (this.unlockListenerAttached || typeof window === 'undefined') return;
    this.unlockListenerAttached = true;
    const retryPlay = () => {
      if (this.desiredBossId && !this.muted && this.audio && this.audio.paused) {
        this.audio
          .play()
          .then(() => {
            this.fadeTo(TARGET_VOLUME, 450);
          })
          .catch(() => {
            // Wait for next interaction
          });
      }
    };
    window.addEventListener('pointerdown', retryPlay, { passive: true });
    window.addEventListener('keydown', retryPlay, { passive: true });
  }

  private clearFade() {
    if (this.fadeTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private fadeTo(targetVol: number, durationMs: number, onDone?: () => void) {
    this.clearFade();
    const audio = this.audio;
    if (!audio || typeof window === 'undefined') {
      onDone?.();
      return;
    }

    const clampedTarget = Math.max(0, Math.min(1, targetVol));
    const startVol = audio.volume;
    const diff = clampedTarget - startVol;
    if (Math.abs(diff) < 0.01 || durationMs <= 0) {
      audio.volume = clampedTarget;
      onDone?.();
      return;
    }

    const stepMs = 30;
    const totalSteps = Math.max(1, Math.round(durationMs / stepMs));
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      step += 1;
      const t = Math.min(1, step / totalSteps);
      if (this.audio) {
        this.audio.volume = Math.max(0, Math.min(1, startVol + diff * t));
      }
      if (t >= 1) {
        this.clearFade();
        onDone?.();
      }
    }, stepMs);
  }

  public sync(bossId: BossId | null, shouldPlay: boolean) {
    this.ensureUnlockListener();

    if (!shouldPlay || !bossId) {
      this.desiredBossId = null;
      this.stop(true);
      return;
    }

    this.desiredBossId = bossId;
    const track = BOSS_MUSIC_TRACKS[bossId];
    if (!track) {
      this.stop(true);
      return;
    }

    if (this.activeBossId === bossId && this.audio) {
      this.audio.muted = this.muted;
      if (!this.muted && this.audio.paused) {
        this.audio
          .play()
          .then(() => {
            this.fadeTo(TARGET_VOLUME, 400);
          })
          .catch(() => {
            // Autoplay blocked until user interaction
          });
      }
      return;
    }

    // Switch to new boss track
    this.stopImmediate();
    const nextAudio = new Audio(track.src);
    nextAudio.loop = true;
    nextAudio.preload = 'auto';
    nextAudio.volume = 0;
    nextAudio.muted = this.muted;
    this.audio = nextAudio;
    this.activeBossId = bossId;

    if (!this.muted) {
      nextAudio
        .play()
        .then(() => {
          if (this.audio === nextAudio && this.desiredBossId === bossId) {
            this.fadeTo(TARGET_VOLUME, 550);
          }
        })
        .catch(() => {
          // Will start automatically on next pointerdown/keydown
        });
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.audio) return;
    this.audio.muted = muted;
    if (!muted && this.desiredBossId && this.audio.paused) {
      this.audio
        .play()
        .then(() => {
          this.fadeTo(TARGET_VOLUME, 350);
        })
        .catch(() => {
          // ignore
        });
    }
  }

  public stop(fadeOut = true) {
    this.desiredBossId = null;
    const current = this.audio;
    if (!current) {
      this.activeBossId = null;
      return;
    }
    if (!fadeOut || current.paused || this.muted) {
      this.stopImmediate();
      return;
    }
    this.fadeTo(0, 380, () => {
      if (this.audio === current && this.desiredBossId === null) {
        this.stopImmediate();
      }
    });
  }

  private stopImmediate() {
    this.clearFade();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.activeBossId = null;
  }
}

export const bossMusic = new BossMusicPlayer();
