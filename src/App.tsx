import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ArmoryPanel } from './components/ArmoryPanel';
import { BloodCanvas, BloodCanvasHandle } from './components/BloodCanvas';
import { TargetFace } from './components/TargetFace';
import { WeaponIcon } from './components/WeaponIcon';
import { CreatorLoginModal, CreatorPanel } from './components/CreatorPanel';
import {
  BruiseMark,
  CreatorModifiers,
  DamagePopup,
  FacialBloodBurst,
  GameScreenState,
  HitZone,
  MAX_LEVEL,
  TraumaState,
  UpgradeDef,
  UPGRADES,
  WEAPONS,
  Weapon,
  WeaponSwingFX,
  formatMoney,
  formatNumber,
  getEnemyForLevel,
  getUpgradeCost,
} from './data/gameData';
import {
  isCreatorSessionUnlocked,
  setCreatorSessionUnlocked,
} from './utils/creatorAuth';
import { bossMusic } from './utils/bossMusic';
import { soundFx, VocalPhase } from './utils/soundFx';

const SAVE_KEY = 'soca_cara_save_v1';

interface SavedProgress {
  money: number;
  level: number;
  ownedWeapons: string[];
  equippedWeaponId: string;
  upgradeLevels: Record<UpgradeDef['id'], number>;
  totalPunches: number;
  totalKos: number;
  campaignCleared?: boolean;
}

const DEFAULT_UPGRADES: Record<UpgradeDef['id'], number> = {
  strength: 0,
  lethality: 0,
  hemorrhage: 0,
  boneCrusher: 0,
  bloodlust: 0,
  extortion: 0,
  henchman: 0,
};

const DEFAULT_CREATOR_MODIFIERS: CreatorModifiers = {
  disableCounterAttacks: false,
  disableEnemyGuard: false,
  disableEnemyRegen: false,
  infiniteRage: false,
  oneHitKo: false,
  damageMultiplier: 1,
};

function createFreshTrauma(): TraumaState {
  return {
    noseBroken: false,
    noseDamage: 0,
    teethRemaining: 6,
    mouthDamage: 0,
    lipTorn: false,
    leftEyeSwollen: false,
    rightEyeSwollen: false,
    leftEyeRuptured: false,
    rightEyeRuptured: false,
    isBlind: false,
    eyeRuptured: false,
    eyeDamage: 0,
    leftEyeDamage: 0,
    rightEyeDamage: 0,
    jawFractured: false,
    jawDamage: 0,
    skullExposed: false,
    foreheadDamage: 0,
    earTorn: false,
    leftEarSwollen: false,
    rightEarSwollen: false,
    leftEarBurst: false,
    rightEarBurst: false,
    earDamage: 0,
    leftEarDamage: 0,
    rightEarDamage: 0,
    arterialRupture: false,
    stunGauge: 0,
    stunnedUntil: 0,
    bleedStacks: 0,
  };
}

function loadSavedProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    if (typeof parsed.money !== 'number' || typeof parsed.level !== 'number') return null;
    return {
      money: Math.max(0, parsed.money),
      level: Math.max(1, Math.min(MAX_LEVEL, parsed.level)),
      ownedWeapons:
        Array.isArray(parsed.ownedWeapons) && parsed.ownedWeapons.length > 0
          ? parsed.ownedWeapons
          : ['fist'],
      equippedWeaponId: typeof parsed.equippedWeaponId === 'string' ? parsed.equippedWeaponId : 'fist',
      upgradeLevels: { ...DEFAULT_UPGRADES, ...(parsed.upgradeLevels || {}) },
      totalPunches: parsed.totalPunches || 0,
      totalKos: parsed.totalKos || 0,
      campaignCleared: Boolean(parsed.campaignCleared),
    };
  } catch {
    return null;
  }
}

export default function App() {
  const initialSave = useMemo(() => loadSavedProgress(), []);

  const [screen, setScreen] = useState<GameScreenState>('TITLE_MENU');
  const [money, setMoney] = useState<number>(initialSave?.money ?? 0);
  const [level, setLevel] = useState<number>(initialSave?.level ?? 1);
  const [ownedWeapons, setOwnedWeapons] = useState<string[]>(initialSave?.ownedWeapons ?? ['fist']);
  const [equippedWeaponId, setEquippedWeaponId] = useState<string>(initialSave?.equippedWeaponId ?? 'fist');
  const [upgradeLevels, setUpgradeLevels] = useState<Record<UpgradeDef['id'], number>>(
    initialSave?.upgradeLevels ?? { ...DEFAULT_UPGRADES }
  );
  const [totalPunches, setTotalPunches] = useState<number>(initialSave?.totalPunches ?? 0);
  const [totalKos, setTotalKos] = useState<number>(initialSave?.totalKos ?? 0);
  const [campaignCleared, setCampaignCleared] = useState<boolean>(initialSave?.campaignCleared ?? false);

  const [creatorUnlocked, setCreatorUnlocked] = useState<boolean>(() => isCreatorSessionUnlocked());
  const [showCreatorLoginModal, setShowCreatorLoginModal] = useState<boolean>(false);
  const [showCreatorPanel, setShowCreatorPanel] = useState<boolean>(false);
  const [forcedEnemyKey, setForcedEnemyKey] = useState<string | null>(null);
  const [creatorModifiers, setCreatorModifiers] = useState<CreatorModifiers>(() => ({
    ...DEFAULT_CREATOR_MODIFIERS,
  }));

  const enemy = useMemo(() => getEnemyForLevel(level, forcedEnemyKey), [level, forcedEnemyKey]);
  const [hp, setHp] = useState<number>(() => getEnemyForLevel(initialSave?.level ?? 1).maxHp);
  const [isKo, setIsKo] = useState<boolean>(false);
  const [koBannerCash, setKoBannerCash] = useState<number>(0);
  const [koBannerLabel, setKoBannerLabel] = useState<string>('NOCAUTE!');

  const [muted, setMuted] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  // Brutality, Trauma, Guard & Counter-Attack state
  const [trauma, setTrauma] = useState<TraumaState>(() => createFreshTrauma());
  const [rageCharge, setRageCharge] = useState<number>(0);
  const [rageUntil, setRageUntil] = useState<number>(0);
  const [blockingUntil, setBlockingUntil] = useState<number>(0);
  const [guardHitsRemaining, setGuardHitsRemaining] = useState<number>(0);
  const [counterAlert, setCounterAlert] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [hitFlash, setHitFlash] = useState<boolean>(false);
  const [xrayFlash, setXrayFlash] = useState<boolean>(false);

  // Combat feedback state
  const [combo, setCombo] = useState<number>(0);
  const [hitNonce, setHitNonce] = useState<number>(0);
  const [lastHitOffset, setLastHitOffset] = useState({ dx: 0, dy: 0, power: 1 });
  const [lastHitZone, setLastHitZone] = useState<HitZone | null>(null);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
  const [bruises, setBruises] = useState<BruiseMark[]>([]);
  const [lastBloodBurst, setLastBloodBurst] = useState<FacialBloodBurst | null>(null);
  const [clearBloodNonce, setClearBloodNonce] = useState<number>(0);
  const [popups, setPopups] = useState<DamagePopup[]>([]);
  const [swings, setSwings] = useState<WeaponSwingFX[]>([]);
  const [trevorSpeech, setTrevorSpeech] = useState<{ text: string; phase: VocalPhase } | null>(null);
  const [miniBossSpeech, setMiniBossSpeech] = useState<{
    speaker: string;
    text: string;
    phase: VocalPhase;
  } | null>(null);
  const [trevorPsychoticBurst, setTrevorPsychoticBurst] = useState<boolean>(false);

  const bloodRef = useRef<BloodCanvasHandle | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const idCounterRef = useRef<number>(1);
  const lastPlayerHitAtRef = useRef<number>(Date.now());
  const hitsSinceCounterRef = useRef<number>(0);
  const comboTimerRef = useRef<number | null>(null);
  const koTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const xrayTimerRef = useRef<number | null>(null);
  const hitStopUntilRef = useRef<number>(0);
  const counterTimerRef = useRef<number | null>(null);
  const lastBloodBurstAtRef = useRef<number>(0);
  const traumaChokingRef = useRef<boolean>(false);
  const trevorSpeechTimerRef = useRef<number | null>(null);
  const miniBossSpeechTimerRef = useRef<number | null>(null);
  const trevorPsychoticTimerRef = useRef<number | null>(null);
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<number | null>(null);
  const secretKeyBufferRef = useRef<string>('');

  const equippedWeapon = useMemo(
    () => WEAPONS.find((w) => w.id === equippedWeaponId) || WEAPONS[0],
    [equippedWeaponId]
  );

  const traumaCount = useMemo(() => {
    let count = 0;
    if (trauma.noseBroken) count++;
    if (trauma.jawFractured) count++;
    if (trauma.skullExposed) count++;
    if (trauma.lipTorn) count++;
    if (trauma.leftEarBurst) count++;
    if (trauma.rightEarBurst) count++;
    else if (!trauma.leftEarBurst && trauma.earTorn) count++;
    if (trauma.arterialRupture) count++;
    if (trauma.isBlind) count++;
    if (trauma.eyeRuptured) count++;
    else if (trauma.leftEyeSwollen || trauma.rightEyeSwollen) count++;
    if (trauma.teethRemaining <= 3) count++;
    return count;
  }, [trauma]);

  const hpRatio = Math.max(0, Math.min(1, hp / enemy.maxHp));
  const isInShock =
    !isKo &&
    ((hpRatio < 0.28 && trauma.bleedStacks >= 5) || traumaCount >= 5);

  const isRageActive = rageUntil > nowMs || creatorModifiers.infiniteRage;
  const isStunned = trauma.stunnedUntil > nowMs;
  const isBlocking =
    !creatorModifiers.disableEnemyGuard &&
    blockingUntil > nowMs &&
    !isStunned &&
    !isKo &&
    !isInShock &&
    !trauma.isBlind;

  const cryIntensity = isKo
    ? 0
    : Math.min(
        1,
        Math.max(0, (0.9 - hpRatio) * 1.25) + traumaCount * 0.14
      );
  const isCrying = !isKo && cryIntensity >= 0.3;
  const isEyesWatering = !isKo && cryIntensity >= 0.06 && cryIntensity < 0.3;

  const activeBleedDps = useMemo(() => {
    const baseWeaponBleed = equippedWeapon.bleedDps;
    const earBurstBleedCount =
      (trauma.leftEarBurst ? 1 : 0) + (trauma.rightEarBurst ? 1 : 0);
    const traumaBleed =
      (trauma.noseBroken ? Math.max(3, Math.round(enemy.maxHp * 0.008)) : 0) +
      (trauma.lipTorn ? Math.max(3, Math.round(enemy.maxHp * 0.008)) : 0) +
      (earBurstBleedCount > 0
        ? Math.max(5, Math.round(enemy.maxHp * 0.011)) * earBurstBleedCount
        : trauma.earTorn
          ? Math.max(5, Math.round(enemy.maxHp * 0.01))
          : 0) +
      (trauma.skullExposed ? Math.max(6, Math.round(enemy.maxHp * 0.012)) : 0) +
      (trauma.arterialRupture ? Math.max(9, Math.round(enemy.maxHp * 0.022)) : 0);
    if (trauma.bleedStacks === 0 && traumaBleed === 0) return 0;
    const hemMult = 1 + (upgradeLevels.hemorrhage || 0) * 0.35;
    const stackMult = Math.max(1, trauma.bleedStacks * 0.5);
    const ruptureBoost = trauma.arterialRupture ? 1.4 : 1;
    const shockBoost = isInShock ? 1.4 : 1;
    return Math.round((baseWeaponBleed * stackMult + traumaBleed) * hemMult * ruptureBoost * shockBoost);
  }, [
    equippedWeapon.bleedDps,
    trauma.bleedStacks,
    trauma.noseBroken,
    trauma.lipTorn,
    trauma.earTorn,
    trauma.leftEarBurst,
    trauma.rightEarBurst,
    trauma.skullExposed,
    trauma.arterialRupture,
    enemy.maxHp,
    upgradeLevels.hemorrhage,
    isInShock,
  ]);

  // Persist progress automatically
  useEffect(() => {
    const payload: SavedProgress = {
      money,
      level,
      ownedWeapons,
      equippedWeaponId,
      upgradeLevels,
      totalPunches,
      totalKos,
      campaignCleared,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [money, level, ownedWeapons, equippedWeaponId, upgradeLevels, totalPunches, totalKos, campaignCleared]);

  useEffect(() => {
    soundFx.setMuted(muted);
    bossMusic.setMuted(muted);
  }, [muted]);

  const triggerTrevorSpeech = useCallback((force = false): boolean => {
    const cur = stateRef.current;
    const hpRatio = Math.max(0, Math.min(1, cur.hp / Math.max(1, cur.enemy.maxHp)));
    const quote = soundFx.playTrevorQuote(force, hpRatio);
    if (!quote) return false;

    setTrevorSpeech({ text: quote.text, phase: quote.phase });
    if (trevorSpeechTimerRef.current) {
      window.clearTimeout(trevorSpeechTimerRef.current);
    }
    const bubbleDuration = Math.max(3000, quote.durationMs + 400);
    trevorSpeechTimerRef.current = window.setTimeout(() => {
      setTrevorSpeech(null);
      trevorSpeechTimerRef.current = null;
    }, bubbleDuration);

    if (trevorPsychoticTimerRef.current) {
      window.clearTimeout(trevorPsychoticTimerRef.current);
      trevorPsychoticTimerRef.current = null;
    }
    if (cur.enemy.bossId === 'trevor_gta5' && quote.phase === 'psychotic') {
      setTrevorPsychoticBurst(true);
      const chaosDuration = Math.max(1200, Math.min(3600, quote.durationMs));
      trevorPsychoticTimerRef.current = window.setTimeout(() => {
        setTrevorPsychoticBurst(false);
        trevorPsychoticTimerRef.current = null;
      }, chaosDuration);
    } else {
      setTrevorPsychoticBurst(false);
    }
    return true;
  }, []);

  const triggerMiniBossSpeech = useCallback((force = false): boolean => {
    const cur = stateRef.current;
    if (!cur.enemy.miniBossId) return false;
    const hpRatio = Math.max(0, Math.min(1, cur.hp / Math.max(1, cur.enemy.maxHp)));
    const quote = soundFx.playMiniBossQuote(cur.enemy.miniBossId, force, hpRatio);
    if (!quote) return false;

    setMiniBossSpeech({ speaker: cur.enemy.name, text: quote.text, phase: quote.phase });
    if (miniBossSpeechTimerRef.current) {
      window.clearTimeout(miniBossSpeechTimerRef.current);
    }
    const bubbleDuration = Math.max(3000, quote.durationMs + 450);
    miniBossSpeechTimerRef.current = window.setTimeout(() => {
      setMiniBossSpeech(null);
      miniBossSpeechTimerRef.current = null;
    }, bubbleDuration);
    return true;
  }, []);

  useEffect(() => {
    const activeBossId = enemy.isBoss && enemy.bossId ? enemy.bossId : null;
    bossMusic.sync(activeBossId, screen === 'PLAYING' && !isKo);
    if (screen === 'PLAYING') {
      soundFx.warmup(enemy.miniBossId);
    }
  }, [enemy.isBoss, enemy.bossId, enemy.miniBossId, screen, isKo]);

  // Trevor, Joker, and YouTuber Mini-Bosses vocal/speech scheduling
  useEffect(() => {
    const hasSpeaker =
      enemy.bossId === 'trevor_gta5' ||
      enemy.bossId === 'joker' ||
      Boolean(enemy.miniBossId);
    if (screen !== 'PLAYING' || isKo || !hasSpeaker) {
      soundFx.stopActiveSpeech();
      setTrevorSpeech(null);
      setMiniBossSpeech(null);
      setTrevorPsychoticBurst(false);
      if (trevorSpeechTimerRef.current) {
        window.clearTimeout(trevorSpeechTimerRef.current);
        trevorSpeechTimerRef.current = null;
      }
      if (miniBossSpeechTimerRef.current) {
        window.clearTimeout(miniBossSpeechTimerRef.current);
        miniBossSpeechTimerRef.current = null;
      }
      if (trevorPsychoticTimerRef.current) {
        window.clearTimeout(trevorPsychoticTimerRef.current);
        trevorPsychoticTimerRef.current = null;
      }
      return;
    }

    let nextTimer: number | null = null;
    let cancelled = false;
    let introRetries = 0;

    const scheduleNext = (delayMs: number, forceFirst = false) => {
      nextTimer = window.setTimeout(() => {
        if (cancelled) return;
        const cur = stateRef.current;
        const hpRatio = Math.max(0, Math.min(1, cur.hp / Math.max(1, cur.enemy.maxHp)));
        if (cur.enemy.bossId === 'trevor_gta5') {
          triggerTrevorSpeech(forceFirst);
          const nextDelay =
            hpRatio <= 0.28
              ? 2200 + Math.random() * 1400
              : hpRatio <= 0.62
                ? 2900 + Math.random() * 1800
                : 3700 + Math.random() * 2200;
          scheduleNext(nextDelay, false);
        } else if (cur.enemy.bossId === 'joker') {
          soundFx.playJokerLaugh(
            cur.enemy.voicePitch,
            forceFirst,
            hpRatio < 0.45,
            hpRatio
          );
          const nextDelay =
            hpRatio <= 0.28
              ? 2400 + Math.random() * 1600
              : hpRatio <= 0.62
                ? 3200 + Math.random() * 1900
                : 4100 + Math.random() * 2400;
          scheduleNext(nextDelay, false);
        } else if (cur.enemy.miniBossId) {
          const spoke = triggerMiniBossSpeech(forceFirst);
          if (!spoke && forceFirst && introRetries < 8) {
            introRetries += 1;
            scheduleNext(400, true);
            return;
          }
          const nextDelay =
            hpRatio <= 0.28
              ? 2500 + Math.random() * 1500
              : hpRatio <= 0.62
                ? 3200 + Math.random() * 1900
                : 4000 + Math.random() * 2200;
          scheduleNext(nextDelay, false);
        }
      }, delayMs);
    };

    scheduleNext(750, true);

    return () => {
      cancelled = true;
      if (nextTimer) window.clearTimeout(nextTimer);
      soundFx.stopActiveSpeech();
    };
  }, [screen, isKo, enemy.bossId, enemy.miniBossId, enemy.level, triggerTrevorSpeech, triggerMiniBossSpeech]);

  useEffect(() => {
    return () => {
      bossMusic.stop(false);
      soundFx.stopActiveSpeech();
      if (trevorSpeechTimerRef.current) window.clearTimeout(trevorSpeechTimerRef.current);
      if (miniBossSpeechTimerRef.current) window.clearTimeout(miniBossSpeechTimerRef.current);
      if (trevorPsychoticTimerRef.current) window.clearTimeout(trevorPsychoticTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (screen !== 'PLAYING') return;
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 150);
    return () => window.clearInterval(timer);
  }, [screen]);

  const triggerScreenPulse = useCallback((magnitude: number, flashRed: boolean) => {
    setScreenShake({
      x: (Math.random() - 0.5) * magnitude * 2,
      y: (Math.random() - 0.5) * magnitude * 2,
    });
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = window.setTimeout(() => setScreenShake({ x: 0, y: 0 }), 95);

    if (flashRed) {
      setHitFlash(true);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = window.setTimeout(() => setHitFlash(false), 85);
    }
  }, []);

  const triggerXrayFlash = useCallback(() => {
    setXrayFlash(true);
    hitStopUntilRef.current = performance.now() + 65;
    if (xrayTimerRef.current) window.clearTimeout(xrayTimerRef.current);
    xrayTimerRef.current = window.setTimeout(() => setXrayFlash(false), 95);
  }, []);

  // Trigger enemy K.O. & level advancement
  const triggerKnockout = useCallback(
    (
      currentEnemy: typeof enemy,
      extortionLevel: number,
      weaponCashBonusPct: number,
      activeTraumas: number,
      isExecution = false
    ) => {
      if (isKo) return;
      setIsKo(true);
      setHp(0);
      setBlockingUntil(0);
      hitsSinceCounterRef.current = 0;

      if (currentEnemy.bossId === 'joker') {
        soundFx.playJokerLaugh(currentEnemy.voicePitch, true, true, 0);
      } else {
        soundFx.playPainGroan('ko', currentEnemy.voicePitch, traumaChokingRef.current, currentEnemy.species);
      }
      if (isExecution) {
        soundFx.playExecution();
        bloodRef.current?.spawnExecutionBurst();
        setKoBannerLabel(
          currentEnemy.isFinalBoss
            ? 'BOSS FINAL EXECUTADO!'
            : currentEnemy.isBoss
              ? 'BOSS EXECUTADO!'
              : currentEnemy.isMiniBoss
                ? 'MINI-BOSS EXECUTADO!'
                : 'EXECUÇÃO BRUTAL!'
        );
      } else {
        soundFx.playKoBell();
        bloodRef.current?.spawnKoBurst();
        setKoBannerLabel(
          currentEnemy.isFinalBoss
            ? 'CAMPEÃO DA ARENA!'
            : currentEnemy.isBoss
              ? 'BOSS NOCAUTEADO!'
              : currentEnemy.isMiniBoss
                ? 'MINI-BOSS NOCAUTEADO!'
                : 'NOCAUTE!'
        );
      }

      const extortionMult = 1 + extortionLevel * 0.2 + weaponCashBonusPct / 100;
      const traumaCashMult = 1 + activeTraumas * 0.12;
      const execMult = isExecution ? 1.5 : 1;
      const bounty = Math.round(currentEnemy.koReward * extortionMult * traumaCashMult * execMult);
      setKoBannerCash(bounty);
      setMoney((prev) => prev + bounty);
      setTotalKos((prev) => prev + 1);

      const reachedFinalClear = currentEnemy.level >= MAX_LEVEL;
      if (reachedFinalClear) {
        setCampaignCleared(true);
      }

      if (koTimerRef.current) window.clearTimeout(koTimerRef.current);
      koTimerRef.current = window.setTimeout(() => {
        const nextLvl = reachedFinalClear ? MAX_LEVEL : currentEnemy.level + 1;
        const nextEnemy = getEnemyForLevel(nextLvl, stateRef.current.forcedEnemyKey);
        setLevel(nextLvl);
        setHp(nextEnemy.maxHp);
        setTrauma(createFreshTrauma());
        setBruises([]);
        setLastHitZone(null);
        setLastBloodBurst(null);
        setClearBloodNonce((n) => n + 1);
        setIsKo(false);
        setKoBannerCash(0);
        if (reachedFinalClear) {
          setShowVictoryModal(true);
        }
      }, 920);
    },
    [isKo]
  );

  // Latest refs for interval ticks & keyboard shortcuts
  const stateRef = useRef({
    screen,
    isKo,
    hp,
    enemy,
    equippedWeapon,
    upgradeLevels,
    activeBleedDps,
    combo,
    trauma,
    traumaCount,
    rageCharge,
    isRageActive,
    isStunned,
    isBlocking,
    isInShock,
    isCrying,
    guardHitsRemaining,
    forcedEnemyKey,
    creatorModifiers,
  });
  stateRef.current = {
    screen,
    isKo,
    hp,
    enemy,
    equippedWeapon,
    upgradeLevels,
    activeBleedDps,
    combo,
    trauma,
    traumaCount,
    rageCharge,
    isRageActive,
    isStunned,
    isBlocking,
    isInShock,
    isCrying,
    guardHitsRemaining,
    forcedEnemyKey,
    creatorModifiers,
  };
  traumaChokingRef.current =
    trauma.noseBroken || trauma.lipTorn || trauma.arterialRupture || trauma.teethRemaining < 6;

  // Activate Modo Massacre
  const activateRageMode = useCallback(() => {
    const st = stateRef.current;
    if (st.screen !== 'PLAYING' || st.isKo || st.rageCharge < 100 || st.isRageActive) return;
    soundFx.playRageActivate();
    setRageCharge(0);
    setBlockingUntil(0);
    const durationMs = 6500 + (st.upgradeLevels.bloodlust || 0) * 350;
    setRageUntil(Date.now() + durationMs);
    triggerScreenPulse(10, true);
  }, [triggerScreenPulse]);

  // Execute stunned or low-HP opponent (< 12% HP, or < 18% when stunned)
  const executeFinisher = useCallback(() => {
    const st = stateRef.current;
    if (st.screen !== 'PLAYING' || st.isKo || st.hp <= 0) return;
    const threshold = st.isStunned ? 0.18 : 0.12;
    if (st.hp / st.enemy.maxHp > threshold) return;

    triggerScreenPulse(14, true);
    triggerKnockout(
      st.enemy,
      st.upgradeLevels.extortion,
      st.equippedWeapon.cashBonusPct,
      st.traumaCount,
      true
    );
  }, [triggerKnockout, triggerScreenPulse]);

  // Trigger Enemy Counter-Attack (breaks combo, drains 25% rage, knocks 8% money)
  const triggerCounterAttack = useCallback(() => {
    soundFx.playCounterHit();
    triggerScreenPulse(13, true);
    setCombo(0);
    setRageCharge((prev) => Math.max(0, prev - 25));
    setMoney((prev) => {
      const lost = Math.min(prev, Math.max(8, Math.round(prev * 0.08)));
      setCounterAlert(`CONTRA-ATAQUE! -${formatMoney(lost)}`);
      if (counterTimerRef.current) window.clearTimeout(counterTimerRef.current);
      counterTimerRef.current = window.setTimeout(() => setCounterAlert(null), 1300);
      return prev - lost;
    });
  }, [triggerScreenPulse]);

  // Core punch / attack handler
  const executeStrike = useCallback(
    (
      clientX: number,
      clientY: number,
      svgX: number,
      svgY: number,
      zone: HitZone,
      isSweetSpot: boolean,
      isAutoPunch = false
    ) => {
      const st = stateRef.current;
      if (st.isKo || st.screen !== 'PLAYING') return;
      if (!isAutoPunch && performance.now() < hitStopUntilRef.current) return;

      lastPlayerHitAtRef.current = Date.now();
      const weapon = st.equippedWeapon;
      const blocked = st.isBlocking && !st.isRageActive;

      // Guard breaking logic
      if (blocked && !isAutoPunch) {
        if (st.guardHitsRemaining <= 1) {
          setBlockingUntil(0);
          setGuardHitsRemaining(0);
        } else {
          setGuardHitsRemaining((g) => g - 1);
        }
      }

      const strMult = 1 + st.upgradeLevels.strength * 0.25;
      const eyeBlindBonus =
        (st.trauma.leftEyeSwollen ? 0.08 : 0) +
        (st.trauma.rightEyeSwollen ? 0.08 : 0) +
        (st.trauma.eyeRuptured ? 0.14 : 0) +
        (st.trauma.isBlind ? 0.22 : 0);
      const skullCritBonus = st.trauma.skullExposed ? 0.3 : 0;
      const critChance = st.isRageActive
        ? 1.0
        : blocked
          ? 0.04
          : Math.min(
              0.94,
              weapon.critChance +
                st.upgradeLevels.lethality * 0.02 +
                (isSweetSpot ? 0.12 : 0) +
                eyeBlindBonus +
                skullCritBonus
            );
      const critMult = weapon.critMultiplier + st.upgradeLevels.lethality * 0.15;
      const isCrit = Math.random() < critChance;

      const rageDamageMult = st.isRageActive
        ? 2.2 + (st.upgradeLevels.bloodlust || 0) * 0.25
        : 1;
      const stunDamageMult = st.isStunned ? 1.5 : 1;
      const blindDamageMult = st.trauma.isBlind ? 1.15 : 1;
      const jawVulnerabilityMult = st.trauma.jawFractured ? 1.35 : 1;
      const skullVulnerabilityMult = st.trauma.skullExposed ? 1.25 : 1;
      const blockMult = blocked ? 0.25 : 1;

      const effectiveArmor = st.enemy.armorPct * (1 - weapon.armorPierce);
      const rawDamage =
        weapon.baseDamage *
        strMult *
        (isCrit ? critMult : 1) *
        (isSweetSpot ? 1.15 : 1) *
        rageDamageMult *
        stunDamageMult *
        blindDamageMult *
        jawVulnerabilityMult *
        skullVulnerabilityMult *
        blockMult;
      const baseFinalDamage = Math.max(
        1,
        Math.round(rawDamage * (1 - effectiveArmor) * st.creatorModifiers.damageMultiplier)
      );
      const finalDamage = st.creatorModifiers.oneHitKo
        ? Math.max(baseFinalDamage, st.enemy.maxHp)
        : baseFinalDamage;

      // Cash reward (+15% per active trauma)
      const nextCombo = st.combo + 1;
      const comboBonus = Math.min(0.85, nextCombo * 0.015);
      const extortionMult = 1 + st.upgradeLevels.extortion * 0.2 + weapon.cashBonusPct / 100;
      const traumaCashMult = 1 + st.traumaCount * 0.15;
      const damageShare = Math.min(1.4, finalDamage / Math.max(20, st.enemy.maxHp * 0.12));
      const hitCash = Math.max(
        1,
        Math.round(
          (st.enemy.hitRewardBase + st.enemy.hitRewardBase * damageShare) *
            extortionMult *
            traumaCashMult *
            (1 + comboBonus) *
            (st.isRageActive ? 1.35 : 1) *
            (blocked ? 0.5 : 1)
        )
      );

      setCombo(nextCombo);
      if (comboTimerRef.current) window.clearTimeout(comboTimerRef.current);
      comboTimerRef.current = window.setTimeout(() => setCombo(0), 1700);

      // Charge Fury meter
      if (!st.isRageActive && !isAutoPunch && !blocked) {
        const bloodlustBoost = 1 + (st.upgradeLevels.bloodlust || 0) * 0.2;
        const chargeGain = (isCrit ? 8.5 : 4.2) * bloodlustBoost;
        setRageCharge((prev) => Math.min(100, prev + chargeGain));
      }

      // Compute anatomical trauma progression scaled by enemy bone/tissue density
      const levelTraumaResist = 1 + (st.enemy.level - 1) * 0.45;
      const weaponTraumaScale = Math.pow(weapon.traumaPower, 0.55);
      const traumaPower =
        (weaponTraumaScale *
          (1 + (st.upgradeLevels.boneCrusher || 0) * 0.28) *
          (isCrit ? 1.45 : 1) *
          (st.isRageActive ? 1.45 : 1) *
          (blocked ? 0.25 : 1) *
          (isAutoPunch ? 0.25 : 1)) /
        levelTraumaResist;

      let knockedTeethNow = 0;
      let boneShardsNow = isCrit && weapon.traumaPower >= 2.2 ? 2 : 0;
      let tissueChunksNow =
        isCrit &&
        (weapon.sound === 'blade' ||
          weapon.sound === 'chainsaw' ||
          weapon.sound === 'shotgun' ||
          weapon.sound === 'explosive')
          ? 3
          : 0;
      let triggerXrayNow = false;
      let eventLabel: string | undefined = blocked ? 'BLOQUEADO!' : undefined;
      let majorAgony = false;
      const now = Date.now();
      let nextTrauma = st.trauma;

      if (!blocked) {
        const prev = st.trauma;
        const next = { ...prev };

        if (weapon.bleedDps > 0) {
          const extraBleed =
            isCrit &&
            (weapon.sound === 'blade' ||
              weapon.sound === 'chainsaw' ||
              weapon.sound === 'shotgun' ||
              weapon.sound === 'explosive')
              ? 2
              : 1;
          next.bleedStacks = Math.min(12, prev.bleedStacks + extraBleed);
          const canRuptureArtery =
            weapon.bleedDps >= 20 ||
            weapon.sound === 'blade' ||
            weapon.sound === 'chainsaw' ||
            weapon.sound === 'shotgun' ||
            weapon.sound === 'gauss' ||
            weapon.sound === 'explosive';
          if (!prev.arterialRupture && canRuptureArtery && next.bleedStacks >= 9) {
            next.arterialRupture = true;
            eventLabel = 'RUPTURA ARTERIAL!';
            majorAgony = true;
            tissueChunksNow += 3;
            soundFx.playFleshTear();
            soundFx.playBloodSquirt(0.5, 1.35);
          }
        }

        if (zone === 'nose' && !prev.noseBroken) {
          next.noseDamage = prev.noseDamage + 16 * traumaPower;
          if (next.noseDamage >= 180) {
            next.noseBroken = true;
            next.bleedStacks = Math.min(12, next.bleedStacks + 2);
            eventLabel = 'NARIZ QUEBRADO!';
            majorAgony = true;
            boneShardsNow += 2;
            triggerXrayNow = true;
            soundFx.playBoneCrack(false);
            soundFx.playBloodSquirt(0.34, 1.0);
          }
        } else if (zone === 'forehead' && !prev.skullExposed) {
          const helmetFactor = st.enemy.hairStyle === 'helmet' ? 0.65 : 1;
          next.foreheadDamage = prev.foreheadDamage + 12 * traumaPower * helmetFactor;
          if (next.foreheadDamage >= 280) {
            next.skullExposed = true;
            next.bleedStacks = Math.min(12, next.bleedStacks + 2);
            eventLabel = 'CRÂNIO EXPOSTO!';
            majorAgony = true;
            boneShardsNow += 5;
            tissueChunksNow += 4;
            triggerXrayNow = true;
            soundFx.playBoneCrack(true);
            soundFx.playFleshTear();
            soundFx.playBloodSquirt(0.4, 1.15);
          }
        } else if (zone === 'mouth') {
          next.mouthDamage = prev.mouthDamage + 16 * traumaPower;
          if (next.mouthDamage >= 150) {
            next.mouthDamage = 0;
            if (prev.teethRemaining > 0) {
              next.teethRemaining = Math.max(0, prev.teethRemaining - 1);
              next.bleedStacks = Math.min(12, next.bleedStacks + 1);
              knockedTeethNow = 1;
              eventLabel = 'DENTE ARRANCADO!';
              majorAgony = true;
              soundFx.playBoneCrack(false);
              soundFx.playBloodSquirt(0.36, 1.05);
            }
            if (!prev.lipTorn && next.teethRemaining <= 3) {
              next.lipTorn = true;
              next.bleedStacks = Math.min(12, next.bleedStacks + 1);
              tissueChunksNow += 2;
              if (!eventLabel || eventLabel === 'DENTE ARRANCADO!') {
                eventLabel = 'LÁBIO RASGADO!';
              }
              majorAgony = true;
              soundFx.playFleshTear();
              soundFx.playBloodSquirt(0.36, 1.0);
            }
          }
        } else if (zone === 'jaw') {
          if (!prev.jawFractured) {
            const metalJawFactor = st.enemy.hasMetalJaw ? 0.7 : 1;
            next.jawDamage = prev.jawDamage + 11 * traumaPower * metalJawFactor;
            if (next.jawDamage >= 320) {
              next.jawFractured = true;
              eventLabel = 'MANDÍBULA EXPOSTA!';
              majorAgony = true;
              boneShardsNow += 4;
              triggerXrayNow = true;
              soundFx.playBoneCrack(true);
              soundFx.playBloodSquirt(0.34, 1.0);
            }
          } else if (prev.teethRemaining > 0) {
            next.mouthDamage = prev.mouthDamage + 14 * traumaPower;
            if (next.mouthDamage >= 150) {
              next.mouthDamage = 0;
              next.teethRemaining = Math.max(0, prev.teethRemaining - 1);
              next.bleedStacks = Math.min(12, next.bleedStacks + 1);
              knockedTeethNow = 1;
              eventLabel = 'DENTE ARRANCADO!';
              majorAgony = true;
              soundFx.playBoneCrack(false);
              soundFx.playBloodSquirt(0.36, 1.05);
            }
          }
        } else if (zone === 'leftEar') {
          if (!prev.leftEarSwollen) {
            next.leftEarDamage = prev.leftEarDamage + 20 * traumaPower;
            if (next.leftEarDamage >= 115) {
              next.leftEarDamage = 0;
              next.leftEarSwollen = true;
              eventLabel = 'ORELHA ESQ. INCHADA!';
            }
          } else if (!prev.leftEarBurst) {
            next.leftEarDamage = prev.leftEarDamage + 22 * traumaPower;
            if (next.leftEarDamage >= 220) {
              next.leftEarDamage = 0;
              next.leftEarBurst = true;
              next.earTorn = true;
              next.bleedStacks = Math.min(12, next.bleedStacks + 3);
              next.stunGauge = 0;
              next.stunnedUntil = now + 3200;
              eventLabel = 'ORELHA ESQ. ESTOURADA!';
              majorAgony = true;
              tissueChunksNow += 4;
              triggerXrayNow = true;
              soundFx.playFleshTear();
              soundFx.playBloodSquirt(0.55);
              soundFx.playStunRing();
            }
          }
        } else if (zone === 'rightEar') {
          if (!prev.rightEarSwollen) {
            next.rightEarDamage = prev.rightEarDamage + 20 * traumaPower;
            if (next.rightEarDamage >= 115) {
              next.rightEarDamage = 0;
              next.rightEarSwollen = true;
              eventLabel = 'ORELHA DIR. INCHADA!';
            }
          } else if (!prev.rightEarBurst) {
            next.rightEarDamage = prev.rightEarDamage + 22 * traumaPower;
            if (next.rightEarDamage >= 220) {
              next.rightEarDamage = 0;
              next.rightEarBurst = true;
              next.earTorn = true;
              next.bleedStacks = Math.min(12, next.bleedStacks + 3);
              next.stunGauge = 0;
              next.stunnedUntil = now + 3200;
              eventLabel = 'ORELHA DIR. ESTOURADA!';
              majorAgony = true;
              tissueChunksNow += 4;
              triggerXrayNow = true;
              soundFx.playFleshTear();
              soundFx.playBloodSquirt(0.55);
              soundFx.playStunRing();
            }
          }
        } else if (zone === 'leftEye') {
          const isCyclops = st.enemy.species === 'cyclops';
          if (!prev.leftEyeSwollen) {
            next.leftEyeDamage = prev.leftEyeDamage + 18 * traumaPower;
            if (next.leftEyeDamage >= 125) {
              next.leftEyeDamage = 0;
              next.leftEyeSwollen = true;
              eventLabel = isCyclops ? 'OLHO ÚNICO INCHADO!' : 'OLHO ESQ. INCHADO!';
            }
          } else if (!prev.leftEyeRuptured) {
            next.leftEyeDamage = prev.leftEyeDamage + 18 * traumaPower;
            if (next.leftEyeDamage >= 185) {
              next.leftEyeDamage = 0;
              next.leftEyeRuptured = true;
              next.eyeRuptured = true;
              next.bleedStacks = Math.min(12, next.bleedStacks + 2);
              if (isCyclops) {
                next.isBlind = true;
                eventLabel = 'CICLOPE CEGO!';
                triggerXrayNow = true;
              } else {
                eventLabel = 'OLHO ESQ. ESTOURADO!';
              }
              majorAgony = true;
              tissueChunksNow += 2;
              soundFx.playFleshTear();
              soundFx.playBloodSquirt(0.45);
            }
          } else if (!prev.isBlind) {
            // Continued trauma to a ruptured eye triggers traumatic optic blindness
            next.leftEyeDamage = prev.leftEyeDamage + 20 * traumaPower;
            if (next.leftEyeDamage >= 135) {
              next.leftEyeDamage = 0;
              next.isBlind = true;
              eventLabel = isCyclops ? 'CICLOPE CEGO!' : 'FICOU CEGO!';
              majorAgony = true;
              triggerXrayNow = true;
              soundFx.playFleshTear();
            }
          }
        } else if (zone === 'rightEye') {
          if (!prev.rightEyeSwollen) {
            next.rightEyeDamage = prev.rightEyeDamage + 18 * traumaPower;
            if (next.rightEyeDamage >= 125) {
              next.rightEyeDamage = 0;
              next.rightEyeSwollen = true;
              eventLabel = 'OLHO DIR. INCHADO!';
            }
          } else if (!prev.rightEyeRuptured) {
            next.rightEyeDamage = prev.rightEyeDamage + 18 * traumaPower;
            if (next.rightEyeDamage >= 185) {
              next.rightEyeDamage = 0;
              next.rightEyeRuptured = true;
              next.eyeRuptured = true;
              next.bleedStacks = Math.min(12, next.bleedStacks + 2);
              eventLabel = 'OLHO DIR. ESTOURADO!';
              majorAgony = true;
              tissueChunksNow += 2;
              soundFx.playFleshTear();
              soundFx.playBloodSquirt(0.45);
            }
          } else if (!prev.isBlind) {
            next.rightEyeDamage = prev.rightEyeDamage + 20 * traumaPower;
            if (next.rightEyeDamage >= 135) {
              next.rightEyeDamage = 0;
              next.isBlind = true;
              eventLabel = 'FICOU CEGO!';
              majorAgony = true;
              triggerXrayNow = true;
              soundFx.playFleshTear();
            }
          }
        }

        // Losing sight in both eyes permanently blinds the opponent
        const leftLost = next.leftEyeSwollen || next.leftEyeRuptured;
        const rightLost = next.rightEyeSwollen || next.rightEyeRuptured;
        if (!prev.isBlind && leftLost && rightLost) {
          next.isBlind = true;
          eventLabel =
            next.leftEyeRuptured && next.rightEyeRuptured
              ? 'CEGUEIRA TOTAL!'
              : 'FICOU CEGO!';
          majorAgony = true;
          soundFx.playFleshTear();
        }

        if (next.isBlind && !prev.isBlind) {
          setBlockingUntil(0);
          setGuardHitsRemaining(0);
        }

        if (prev.stunnedUntil <= now && next.stunnedUntil <= now) {
          const earStunBonus =
            1 + (next.leftEarBurst ? 0.4 : 0) + (next.rightEarBurst ? 0.4 : 0);
          const stunGain =
            (zone === 'jaw' ? 14 : zone === 'leftEar' || zone === 'rightEar' ? 12 : 7) *
            traumaPower *
            earStunBonus;
          next.stunGauge = prev.stunGauge + stunGain;
          if (next.stunGauge >= 140) {
            next.stunGauge = 0;
            next.stunnedUntil = now + 2600;
            if (!eventLabel) eventLabel = 'ATORDOADO!';
            soundFx.playStunRing();
          }
        }

        nextTrauma = next;
        stateRef.current.trauma = next;
        traumaChokingRef.current =
          next.noseBroken || next.lipTorn || next.arterialRupture || next.teethRemaining < 6;
        setTrauma(next);
      }

      if (triggerXrayNow && !isAutoPunch) {
        triggerXrayFlash();
      }

      // Enemy Guard & Counter-Attack AI on Level 2+ (Blind enemies or Creator Mode overrides suppress)
      if (
        !isAutoPunch &&
        st.enemy.level >= 2 &&
        !st.isStunned &&
        !st.isRageActive &&
        !st.isInShock &&
        !nextTrauma.isBlind
      ) {
        if (!st.creatorModifiers.disableCounterAttacks) {
          hitsSinceCounterRef.current += 1;
        }
        const counterThreshold = Math.max(
          5,
          (st.enemy.isBoss ? 11 : 13) - Math.floor(st.enemy.level / 2)
        );

        if (!st.creatorModifiers.disableCounterAttacks && hitsSinceCounterRef.current >= counterThreshold) {
          hitsSinceCounterRef.current = 0;
          triggerCounterAttack();
        } else if (
          !st.creatorModifiers.disableEnemyGuard &&
          !blocked &&
          Math.random() < Math.min(st.enemy.isBoss ? 0.28 : 0.24, 0.08 + st.enemy.level * 0.015)
        ) {
          setBlockingUntil(now + 3200);
          setGuardHitsRemaining(st.enemy.isBoss ? 7 : 6);
        }
      }

      // Head snap vector
      const dx = Math.max(-1, Math.min(1, (160 - svgX) / 75));
      const dy = Math.max(-1, Math.min(1, (180 - svgY) / 85));
      const power = blocked ? 0.35 : st.isRageActive ? 1.85 : isCrit ? 1.55 : isAutoPunch ? 0.65 : 1.05;
      setLastHitOffset({ dx, dy, power });
      setLastHitZone(zone);
      setHitNonce((n) => n + 1);

      if (!isAutoPunch && !blocked && (isCrit || st.isRageActive || weapon.bloodIntensity >= 2.8)) {
        const mag = st.isRageActive ? 12 : isCrit ? 8.5 : 4.5;
        triggerScreenPulse(mag, isCrit || st.isRageActive);
      }

      // Sound Effects + Blood-Choked Pain Groans & Crying Sobs
      if (!isAutoPunch) {
        if (blocked) {
          soundFx.playBlockedHit();
        } else {
          soundFx.playHit(weapon.sound, isCrit, st.isRageActive);
          const lowHp = st.hp / st.enemy.maxHp < 0.35;
          const isChoking =
            nextTrauma.noseBroken ||
            nextTrauma.lipTorn ||
            nextTrauma.arterialRupture ||
            nextTrauma.teethRemaining < 6 ||
            lowHp;
          const groanSeverity = majorAgony
            ? 'agony'
            : isCrit || st.isRageActive || weapon.bloodIntensity >= 4.2 || lowHp
              ? 'heavy'
              : 'light';
          if (st.enemy.bossId === 'joker') {
            soundFx.playJokerLaugh(
              st.enemy.voicePitch,
              false,
              majorAgony || isCrit || st.isRageActive,
              Math.max(0, Math.min(1, st.hp / Math.max(1, st.enemy.maxHp)))
            );
          } else {
            const spokeTrevor =
              st.enemy.bossId === 'trevor_gta5' &&
              (isCrit || st.isRageActive || Math.random() < 0.45) &&
              triggerTrevorSpeech(isCrit || st.isRageActive);

            const spokeMiniBoss =
              Boolean(st.enemy.miniBossId) &&
              (isCrit || st.isRageActive || Math.random() < 0.44) &&
              triggerMiniBossSpeech(isCrit || st.isRageActive);

            if (!spokeTrevor && !spokeMiniBoss) {
              soundFx.playPainGroan(groanSeverity, st.enemy.voicePitch, isChoking, st.enemy.species);
              if (knockedTeethNow > 0 || (zone === 'nose' && nextTrauma.noseBroken && majorAgony)) {
                soundFx.playBloodCough(st.enemy.voicePitch, st.enemy.species);
              } else if (st.isCrying && Math.random() < 0.45) {
                soundFx.playCryingSob(st.enemy.voicePitch, st.enemy.species);
              }
            }
          }
        }
      }

      // Blood, bone splinter, shredded tissue & mist particles on canvas (flying tooth rendered crisply in TargetFace SVG)
      if (!blocked) {
        bloodRef.current?.spawnHit(clientX, clientY, {
          intensity: isAutoPunch
            ? Math.max(1, weapon.bloodIntensity * 0.55)
            : knockedTeethNow > 0
              ? Math.max(weapon.bloodIntensity, 3.6)
              : weapon.bloodIntensity,
          isCrit: isCrit || knockedTeethNow > 0,
          isArmored: st.enemy.armorPct > 0.12,
          isPlasma:
            weapon.sound === 'plasma' ||
            weapon.sound === 'gauss' ||
            weapon.sound === 'shock' ||
            weapon.sound === 'cryo' ||
            weapon.id === 'antimatter_fist',
          knockedTeeth: 0,
          boneShards: boneShardsNow,
          tissueChunks: tissueChunksNow,
          hasMist:
            isCrit ||
            st.isRageActive ||
            knockedTeethNow > 0 ||
            weapon.sound === 'shotgun' ||
            weapon.sound === 'chainsaw' ||
            weapon.sound === 'explosive',
          isRage: st.isRageActive,
          isArterial:
            nextTrauma.arterialRupture ||
            weapon.sound === 'blade' ||
            weapon.sound === 'chainsaw' ||
            weapon.sound === 'shotgun' ||
            weapon.sound === 'explosive',
          hasSaliva:
            !isAutoPunch &&
            (zone === 'mouth' || zone === 'jaw' || knockedTeethNow > 0 || isCrit || st.isRageActive),
          dirX: dx,
          dirY: dy,
        });
      }

      // Persistent realistic bruises, knuckle welts, brow splits, lacerations, scrapes, punctures & burns
      if (!blocked && (!isAutoPunch || Math.random() < 0.35)) {
        const nextId = idCounterRef.current++;

        // Clamp wound coordinates inside anatomical silhouette so marks never float outside jaw/temples
        let clampedX = svgX;
        let clampedY = svgY;
        if (zone === 'leftEar') {
          clampedX = Math.max(54, Math.min(72, svgX));
          clampedY = Math.max(158, Math.min(198, svgY));
        } else if (zone === 'rightEar') {
          clampedX = Math.max(248, Math.min(266, svgX));
          clampedY = Math.max(158, Math.min(198, svgY));
        } else {
          clampedY = Math.max(60, Math.min(298, svgY));
          // Taper max width toward jaw/chin (narrower below y=220)
          const jawTaper = clampedY > 215 ? Math.max(0.42, 1 - ((clampedY - 215) / 95) * 0.56) : 1;
          const halfSpan = 74 * jawTaper;
          clampedX = Math.max(160 - halfSpan, Math.min(160 + halfSpan, svgX));
        }

        const hpDamageRatio = 1 - Math.max(0, st.hp - finalDamage) / Math.max(1, st.enemy.maxHp);
        const isBrowOrOrbital = zone === 'leftEye' || zone === 'rightEye';
        const isCheekbone = clampedY >= 156 && clampedY <= 212 && (clampedX <= 134 || clampedX >= 186);
        const isBonyLandmark =
          zone === 'forehead' || zone === 'jaw' || zone === 'nose' || isBrowOrOrbital || isCheekbone;

        const isCheekZone = clampedY >= 170 && clampedY <= 248 && (clampedX <= 140 || clampedX >= 180);
        let markKind: BruiseMark['kind'] = 'bruise';
        if (weapon.sound === 'acid') {
          markKind = Math.random() < 0.78 ? 'acid_burn' : Math.random() < 0.9 ? 'burn' : 'subdermal_clot';
        } else if (weapon.sound === 'cryo') {
          markKind =
            Math.random() < 0.66
              ? 'frost_burn'
              : isBonyLandmark
                ? 'brow_split'
                : Math.random() < 0.55
                  ? 'razor_nick'
                  : 'laceration';
        } else if (weapon.sound === 'shock') {
          markKind =
            Math.random() < 0.58
              ? 'plasma_sear'
              : Math.random() < 0.78
                ? 'burn'
                : Math.random() < 0.9
                  ? 'petechiae'
                  : 'hematoma';
        } else if (weapon.sound === 'explosive') {
          const r = Math.random();
          markKind =
            r < 0.36
              ? 'shrapnel_tear'
              : r < 0.64
                ? 'burn'
                : r < 0.84
                  ? 'laceration'
                  : 'slash_deep';
        } else if (weapon.sound === 'plasma' || weapon.sound === 'nuke') {
          if (
            (weapon.id === 'thermonuke_hammer' || weapon.id === 'antimatter_fist') &&
            Math.random() < 0.44
          ) {
            markKind = isCrit || st.isRageActive ? 'slash_deep' : 'shrapnel_tear';
          } else {
            markKind = Math.random() < 0.65 ? 'plasma_sear' : Math.random() < 0.88 ? 'burn' : 'shrapnel_tear';
          }
        } else if (weapon.sound === 'flame') {
          markKind = Math.random() < 0.75 ? 'burn' : Math.random() < 0.92 ? 'plasma_sear' : 'subdermal_clot';
        } else if (weapon.id === 'broken_bottle' || weapon.id === 'tactical_knife') {
          const r = Math.random();
          if (isCheekZone && (isCrit || r < 0.28)) {
            markKind = 'cheek_split';
          } else if (isCrit || st.isRageActive || r < 0.32) {
            markKind = 'slash_deep';
          } else if (r < 0.68) {
            markKind = 'razor_nick';
          } else {
            markKind = 'cut';
          }
        } else if (weapon.sound === 'blade') {
          const r = Math.random();
          if (isCheekZone && (isCrit || r < 0.32)) {
            markKind = 'cheek_split';
          } else if (isCrit || st.isRageActive || weapon.id === 'fire_axe' || weapon.id === 'mono_katana' || r < 0.45) {
            markKind = Math.random() < 0.68 ? 'slash_deep' : 'gash';
          } else if (r < 0.76) {
            markKind = 'cut';
          } else {
            markKind = 'razor_nick';
          }
        } else if (weapon.sound === 'chainsaw') {
          const r = Math.random();
          markKind =
            isCheekZone && r < 0.3
              ? 'cheek_split'
              : r < 0.38
                ? 'laceration'
                : r < 0.72
                  ? 'slash_deep'
                  : r < 0.9
                    ? 'gash'
                    : 'scrape';
        } else if (weapon.sound === 'shotgun' || weapon.sound === 'gauss') {
          if (weapon.sound === 'gauss' && (isCrit || Math.random() < 0.3)) {
            markKind = 'plasma_sear';
          } else {
            const r = Math.random();
            markKind = r < 0.46 ? 'shrapnel_tear' : r < 0.8 ? 'puncture' : 'laceration';
          }
        } else if (weapon.id === 'barbed_bat') {
          const r = Math.random();
          markKind =
            r < 0.3
              ? 'laceration'
              : r < 0.54
                ? 'scrape'
                : r < 0.72
                  ? 'razor_nick'
                  : r < 0.88 && isBonyLandmark
                    ? 'brow_split'
                    : 'subdermal_clot';
        } else if (weapon.id === 'brass_knuckles' || weapon.id === 'steel_crowbar' || weapon.id === 'sledgehammer') {
          const r = Math.random();
          if (isBonyLandmark && (isCrit || r < 0.32)) {
            markKind = 'brow_split';
          } else if (isCheekZone && isCrit && r < 0.45) {
            markKind = 'cheek_split';
          } else {
            markKind =
              r < 0.28
                ? 'knuckle_welt'
                : r < 0.54
                  ? 'subdermal_clot'
                  : r < 0.78
                    ? 'hematoma'
                    : r < 0.9
                      ? 'petechiae'
                      : 'bruise';
          }
        } else if (weapon.id === 'studded_gloves' || weapon.id === 'boxer_wraps') {
          const r = Math.random();
          if (isBonyLandmark && (isCrit || r < 0.22)) {
            markKind = 'brow_split';
          } else {
            markKind =
              r < 0.26
                ? 'scrape'
                : r < 0.5
                  ? 'knuckle_welt'
                  : r < 0.68
                    ? 'razor_nick'
                    : r < 0.84
                      ? 'subdermal_clot'
                      : 'petechiae';
          }
        } else {
          // Punho Limpo: hematomas, coágulos subdérmicos, petéquias, arranhões e cortes de sobrancelha/bochecha em críticos
          const r = Math.random();
          if (isBonyLandmark && (isCrit || st.isRageActive) && r < 0.28) {
            markKind = 'brow_split';
          } else if (isCheekZone && isCrit && r < 0.35) {
            markKind = 'cheek_split';
          } else if (r < 0.28) {
            markKind = 'bruise';
          } else if (r < 0.52) {
            markKind = 'knuckle_welt';
          } else if (r < 0.7) {
            markKind = 'subdermal_clot';
          } else if (r < 0.84) {
            markKind = 'hematoma';
          } else if (r < 0.94) {
            markKind = 'petechiae';
          } else {
            markKind = 'scrape';
          }
        }

        // Anatomical orientation aligned to facial bone & skin tension lines
        let angle = (Math.random() - 0.5) * 34;
        if (zone === 'leftEye') {
          angle = -22 + Math.random() * 20;
        } else if (zone === 'rightEye') {
          angle = 2 + Math.random() * 20;
        } else if (zone === 'jaw') {
          angle = clampedX < 160 ? 18 + Math.random() * 22 : -18 - Math.random() * 22;
        } else if (zone === 'nose') {
          angle = markKind === 'scrape' ? (Math.random() - 0.5) * 40 : (Math.random() - 0.5) * 26;
        } else if (zone === 'forehead') {
          angle = (Math.random() - 0.5) * 24;
        } else if (weapon.sound === 'blade' || weapon.sound === 'chainsaw') {
          angle = (Math.random() - 0.5) * 76;
        }

        const weaponBoneBase =
          weapon.id === 'fist'
            ? 0.02
            : weapon.id === 'boxer_wraps'
              ? 0.05
              : weapon.id === 'studded_gloves'
                ? 0.08
                : weapon.id === 'broken_bottle'
                  ? 0.14
                  : weapon.id === 'brass_knuckles'
                    ? 0.19
                    : weapon.id === 'steel_crowbar' || weapon.id === 'barbed_bat'
                      ? 0.24
                      : weapon.id === 'tactical_knife' || weapon.id === 'spiked_machete'
                        ? 0.26
                        : weapon.id === 'fire_axe' || weapon.id === 'sledgehammer'
                          ? 0.35
                          : weapon.sound === 'chainsaw' || weapon.sound === 'cryo'
                            ? 0.38
                            : weapon.sound === 'shotgun' || weapon.sound === 'gauss' || weapon.sound === 'explosive'
                              ? 0.34
                              : weapon.id === 'mono_katana'
                                ? 0.38
                                : 0.26;

        const woundSupportsBone =
          markKind === 'gash' ||
          markKind === 'slash_deep' ||
          markKind === 'cheek_split' ||
          markKind === 'shrapnel_tear' ||
          markKind === 'laceration' ||
          markKind === 'puncture' ||
          markKind === 'brow_split' ||
          (markKind === 'cut' && (isCrit || weapon.traumaPower >= 2.2));

        const severity = Math.min(
          1,
          0.42 + hpDamageRatio * 0.35 + (isCrit ? 0.22 : 0) + (st.isRageActive ? 0.14 : 0)
        );

        const baseRadius =
          markKind === 'cut' || markKind === 'razor_nick'
            ? 8.5 + Math.random() * 6.5
            : markKind === 'puncture' || markKind === 'petechiae'
              ? 7.8 + Math.random() * 5.8
              : markKind === 'brow_split' || markKind === 'cheek_split'
                ? 9 + Math.random() * 6.2
                : markKind === 'slash_deep' || markKind === 'shrapnel_tear'
                  ? 10.5 + Math.random() * 7.5
                  : 9.5 + Math.random() * 9.5;

        const shouldSpawnCompanion =
          !isAutoPunch &&
          (isCrit ||
            st.isRageActive ||
            weapon.sound === 'blade' ||
            weapon.sound === 'chainsaw' ||
            weapon.sound === 'shotgun' ||
            weapon.sound === 'explosive') &&
          Math.random() < 0.38;

        const companionId = shouldSpawnCompanion ? idCounterRef.current++ : 0;

        setBruises((prev) => {
          const currentBoneCount = prev.reduce((acc, m) => acc + (m.showBone ? 1 : 0), 0);
          const boneChance =
            weaponBoneBase * (isCrit ? 1.45 : 0.85) * (0.55 + hpDamageRatio * 0.65);
          const showBone =
            !isAutoPunch &&
            isBonyLandmark &&
            woundSupportsBone &&
            currentBoneCount < 6 &&
            Math.random() < boneChance;

          const primaryMark: BruiseMark = {
            id: nextId,
            x: clampedX,
            y: clampedY,
            radius: baseRadius,
            kind: markKind,
            rotation: angle,
            showBone,
            severity,
            zone,
          };

          const nextMarks: BruiseMark[] = [...prev.slice(-55), primaryMark];

          if (shouldSpawnCompanion && zone !== 'leftEar' && zone !== 'rightEar') {
            const compY = Math.max(66, Math.min(292, clampedY + (Math.random() - 0.5) * 26));
            const compJawTaper = compY > 215 ? Math.max(0.42, 1 - ((compY - 215) / 95) * 0.56) : 1;
            const compHalfSpan = 72 * compJawTaper;
            const compX = Math.max(
              160 - compHalfSpan,
              Math.min(160 + compHalfSpan, clampedX + (Math.random() - 0.5) * 28)
            );
            const compKind: BruiseMark['kind'] =
              weapon.sound === 'blade' || weapon.sound === 'chainsaw'
                ? 'razor_nick'
                : weapon.sound === 'shotgun' || weapon.sound === 'explosive'
                  ? 'petechiae'
                  : Math.random() < 0.5
                    ? 'subdermal_clot'
                    : 'petechiae';
            nextMarks.push({
              id: companionId,
              x: compX,
              y: compY,
              radius: 6.5 + Math.random() * 4.5,
              kind: compKind,
              rotation: angle + (Math.random() - 0.5) * 35,
              showBone: false,
              severity: Math.max(0.38, severity * 0.82),
              zone,
            });
          }

          return nextMarks;
        });
      }

      // Trigger real-time gravity-driven facial blood rivulets on bleeding/trauma/cutting hits
      if (!blocked) {
        const zoneTraumaActive =
          (zone === 'nose' && nextTrauma.noseBroken) ||
          (zone === 'mouth' && (nextTrauma.lipTorn || nextTrauma.teethRemaining < 6)) ||
          (zone === 'jaw' && nextTrauma.jawFractured) ||
          (zone === 'forehead' && nextTrauma.skullExposed) ||
          (zone === 'leftEye' && nextTrauma.leftEyeRuptured) ||
          (zone === 'rightEye' && nextTrauma.rightEyeRuptured) ||
          (zone === 'leftEar' && nextTrauma.leftEarBurst) ||
          (zone === 'rightEar' && nextTrauma.rightEarBurst);

        const isBleedingWeapon =
          weapon.sound === 'blade' ||
          weapon.sound === 'chainsaw' ||
          weapon.sound === 'shotgun' ||
          weapon.sound === 'explosive';
        const sinceLastDrip = now - lastBloodBurstAtRef.current;
        const triggerChance = isAutoPunch
          ? 0.08
          : majorAgony
            ? 1.0
            : zoneTraumaActive
              ? 0.62
              : isBleedingWeapon
                ? isCrit || st.isRageActive
                  ? 0.68
                  : 0.42
                : isCrit || st.isRageActive
                  ? 0.48
                  : 0.22;
        const canEmitDrip =
          majorAgony || (sinceLastDrip >= 420 && Math.random() < triggerChance);

        if (canEmitDrip) {
          lastBloodBurstAtRef.current = now;
          const weaponSeverity = Math.min(0.46, (weapon.bloodIntensity - 0.7) * 0.072);
          const traumaSeverity = Math.min(
            0.4,
            st.traumaCount * 0.058 +
              nextTrauma.bleedStacks * 0.025 +
              (nextTrauma.arterialRupture ? 0.16 : 0)
          );
          const hpSeverity = (1 - Math.max(0, Math.min(1, st.hp / st.enemy.maxHp))) * 0.2;
          const hitSeverity =
            (isCrit ? 0.24 : 0) +
            (st.isRageActive ? 0.22 : 0) +
            (isSweetSpot ? 0.1 : 0) +
            (zoneTraumaActive ? 0.26 : 0) +
            (majorAgony ? 0.3 : 0);
          const rawSeverity =
            0.18 +
            weaponSeverity +
            traumaSeverity +
            hpSeverity +
            hitSeverity -
            (isAutoPunch ? 0.15 : 0);
          const clampedSeverity = Math.max(0.18, Math.min(1, rawSeverity));

          setLastBloodBurst({
            id: idCounterRef.current++,
            x: Math.max(54, Math.min(266, svgX)),
            y: Math.max(44, Math.min(312, svgY)),
            zone,
            severity: clampedSeverity,
            isCrit,
          });
        }
      }

      // Popups + Swing FX
      const arenaRect = arenaRef.current?.getBoundingClientRect();
      if (arenaRect) {
        const relX = clientX - arenaRect.left;
        const relY = clientY - arenaRect.top;

        const popupId = idCounterRef.current++;
        setPopups((prev) => [
          ...prev.slice(-15),
          {
            id: popupId,
            x: relX + (Math.random() - 0.5) * 28,
            y: relY - 12,
            damage: finalDamage,
            cash: hitCash,
            isCrit,
            isSweetSpot,
            label: eventLabel,
          },
        ]);
        window.setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== popupId));
        }, 780);

        if (!isAutoPunch) {
          const swingId = idCounterRef.current++;
          setSwings((prev) => [
            ...prev.slice(-5),
            {
              id: swingId,
              x: relX,
              y: relY,
              weaponId: weapon.id,
              isCrit,
            },
          ]);
          window.setTimeout(() => {
            setSwings((prev) => prev.filter((s) => s.id !== swingId));
          }, 230);
        }
      }

      setMoney((prev) => prev + hitCash);
      setTotalPunches((prev) => prev + 1);
      setHp((prevHp) => {
        const remaining = prevHp - finalDamage;
        if (remaining <= 0) {
          triggerKnockout(
            st.enemy,
            st.upgradeLevels.extortion,
            weapon.cashBonusPct,
            st.traumaCount,
            false
          );
          return 0;
        }
        return remaining;
      });
    },
    [triggerCounterAttack, triggerKnockout, triggerScreenPulse, triggerXrayFlash]
  );

  // Heartbeat Arterial Rupture & Traumatic Shock Pulse Loop
  useEffect(() => {
    if (screen !== 'PLAYING' || isKo || (!trauma.arterialRupture && !isInShock)) return;
    const pulseMs = isInShock ? 650 : 800;
    const timer = window.setInterval(() => {
      const st = stateRef.current;
      if (st.screen !== 'PLAYING' || st.isKo || st.hp <= 0) return;

      if (st.trauma.arterialRupture) {
        const arenaRect = arenaRef.current?.getBoundingClientRect();
        if (arenaRect) {
          const arteryX = arenaRect.left + arenaRect.width * 0.5 - 32;
          const arteryY = arenaRect.top + arenaRect.height * 0.5 + 14;
          bloodRef.current?.spawnArterialSpurt(arteryX, arteryY);
        }
        soundFx.playArterialSpurt(st.isInShock ? 1.1 : 0.88);
      }
      soundFx.playHeartbeat(st.isInShock ? 1.15 : 0.85);
    }, pulseMs);

    return () => window.clearInterval(timer);
  }, [screen, isKo, trauma.arterialRupture, isInShock]);

  // Passive loop: Bleed DPS + Idle Enemy Regen + Agony Gasps, Coughs, Sobs & Blood Drips
  useEffect(() => {
    const interval = window.setInterval(() => {
      const st = stateRef.current;
      if (st.screen !== 'PLAYING' || st.isKo || st.hp <= 0) return;

      const arenaRect = arenaRef.current?.getBoundingClientRect();
      const hpPct = st.hp / Math.max(1, st.enemy.maxHp);
      const isChoking =
        st.trauma.noseBroken ||
        st.trauma.lipTorn ||
        st.trauma.arterialRupture ||
        st.trauma.teethRemaining < 6;
      const isBleeding =
        st.activeBleedDps > 0 ||
        st.trauma.bleedStacks >= 1 ||
        st.trauma.noseBroken ||
        st.trauma.lipTorn ||
        st.trauma.teethRemaining < 6 ||
        st.trauma.skullExposed ||
        st.trauma.leftEyeRuptured ||
        st.trauma.rightEyeRuptured ||
        st.trauma.leftEarBurst ||
        st.trauma.rightEarBurst;

      // Realistic character agony: gasping, choking blood coughs, and weeping sobs
      const distress = Math.min(
        1,
        Math.max(0, (0.72 - hpPct) * 1.1) + st.traumaCount * 0.14 + (st.isInShock ? 0.35 : 0)
      );
      if (st.enemy.bossId === 'joker') {
        if ((st.isCrying || hpPct < 0.78 || st.isStunned || st.isInShock) && Math.random() < 0.42) {
          soundFx.playJokerLaugh(st.enemy.voicePitch, false, hpPct < 0.35 || st.isInShock, hpPct);
        }
      } else if (st.isCrying && Math.random() < 0.36) {
        soundFx.playCryingSob(st.enemy.voicePitch, st.enemy.species);
      } else if (isChoking && distress > 0.25 && Math.random() < 0.16) {
        soundFx.playBloodCough(st.enemy.voicePitch, st.enemy.species);
      } else if ((hpPct < 0.6 || st.traumaCount >= 2 || st.isInShock || st.isStunned) && Math.random() < 0.24) {
        soundFx.playAgonyGasp(st.enemy.voicePitch, isChoking, st.enemy.species, Math.max(0.35, distress));
      }

      // Subtle visceral blood dripping sound when wounds are actively bleeding
      if (isBleeding && Math.random() < (st.trauma.arterialRupture ? 0.72 : 0.42)) {
        const dripIntensity = Math.min(
          1,
          0.32 + st.trauma.bleedStacks * 0.06 + (st.trauma.arterialRupture ? 0.3 : 0)
        );
        soundFx.playBloodDrip(dripIntensity);
      }

      // Bleed DPS tick + independent idle regeneration if not pressured
      let nextHpDelta = 0;
      if (st.activeBleedDps > 0) {
        const tickDamage = Math.max(1, Math.round(st.activeBleedDps / 4));
        nextHpDelta -= tickDamage;
        if (arenaRect) {
          const cx = arenaRect.left + arenaRect.width * 0.5 + (Math.random() - 0.5) * 48;
          const cy = arenaRect.top + arenaRect.height * 0.52 + (Math.random() - 0.5) * 48;
          bloodRef.current?.spawnHit(cx, cy, {
            intensity: st.trauma.arterialRupture
              ? 4.8
              : Math.min(4, 1 + st.trauma.bleedStacks * 0.25),
            isCrit: st.trauma.arterialRupture && Math.random() < 0.35,
            isArmored: false,
            isBleedTick: !st.trauma.arterialRupture,
          });
        }
      }

      if (
        !st.creatorModifiers.disableEnemyRegen &&
        st.enemy.regenPerSecPct > 0 &&
        !st.isStunned &&
        !st.isInShock &&
        !st.trauma.arterialRupture &&
        Date.now() - lastPlayerHitAtRef.current > 1200
      ) {
        const regenAmt = Math.max(1, Math.round((st.enemy.maxHp * st.enemy.regenPerSecPct) / 4));
        nextHpDelta += regenAmt;
      }

      if (nextHpDelta !== 0) {
        setHp((prevHp) => {
          const updated = Math.min(st.enemy.maxHp, prevHp + nextHpDelta);
          if (updated <= 0) {
            triggerKnockout(
              st.enemy,
              st.upgradeLevels.extortion,
              st.equippedWeapon.cashBonusPct,
              st.traumaCount,
              false
            );
            return 0;
          }
          return updated;
        });
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [triggerKnockout]);

  // Henchman Auto-Puncher loop
  useEffect(() => {
    const henchmanLvl = upgradeLevels.henchman || 0;
    if (henchmanLvl <= 0 || screen !== 'PLAYING') return;

    const intervalMs = Math.max(120, Math.round(1000 / henchmanLvl));
    const timer = window.setInterval(() => {
      const st = stateRef.current;
      if (st.screen !== 'PLAYING' || st.isKo || st.hp <= 0) return;
      const arenaRect = arenaRef.current?.getBoundingClientRect();
      if (!arenaRect) return;
      const jitterX = (Math.random() - 0.5) * 70;
      const jitterY = (Math.random() - 0.5) * 70;
      const cx = arenaRect.left + arenaRect.width * 0.5 + jitterX;
      const cy = arenaRect.top + arenaRect.height * 0.5 + jitterY;
      executeStrike(cx, cy, 160 + jitterX * 0.6, 180 + jitterY * 0.6, 'jaw', false, true);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [upgradeLevels.henchman, screen, executeStrike]);

  const openCreatorAccess = useCallback(() => {
    if (creatorUnlocked) {
      setShowCreatorPanel(true);
    } else {
      setShowCreatorLoginModal(true);
    }
  }, [creatorUnlocked]);

  const handleSecretLogoTap = useCallback(() => {
    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) window.clearTimeout(logoTapTimerRef.current);
    if (logoTapCountRef.current >= 7) {
      logoTapCountRef.current = 0;
      openCreatorAccess();
      return;
    }
    logoTapTimerRef.current = window.setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 2400);
  }, [openCreatorAccess]);

  // Keyboard shortcuts (including hidden creator trigger: Ctrl+Shift+D or typing "criador")
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingInField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        openCreatorAccess();
        return;
      }

      if (isTypingInField) return;

      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        const nextBuf = (secretKeyBufferRef.current + e.key.toLowerCase()).slice(-7);
        secretKeyBufferRef.current = nextBuf;
        if (nextBuf === 'criador') {
          secretKeyBufferRef.current = '';
          openCreatorAccess();
          return;
        }
      }

      if (screen !== 'PLAYING' || showCreatorPanel || showCreatorLoginModal) return;
      if (e.key === 'Escape') {
        setShowHelpModal(false);
        setShowResetModal(false);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        activateRageMode();
        return;
      }
      if (e.key === 'e' || e.key === 'E') {
        executeFinisher();
        return;
      }
      const num = parseInt(e.key, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= 9 && num <= WEAPONS.length) {
        const w = WEAPONS[num - 1];
        if (ownedWeapons.includes(w.id)) {
          soundFx.playEquip();
          setEquippedWeaponId(w.id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    screen,
    ownedWeapons,
    activateRageMode,
    executeFinisher,
    openCreatorAccess,
    showCreatorPanel,
    showCreatorLoginModal,
  ]);

  const handleBuyWeapon = (weapon: Weapon) => {
    if (money < weapon.price || ownedWeapons.includes(weapon.id)) return;
    soundFx.playPurchase();
    setMoney((prev) => prev - weapon.price);
    setOwnedWeapons((prev) => [...prev, weapon.id]);
    setEquippedWeaponId(weapon.id);
  };

  const handleEquipWeapon = (weaponId: string) => {
    if (!ownedWeapons.includes(weaponId)) return;
    soundFx.playEquip();
    setEquippedWeaponId(weaponId);
  };

  const handleBuyUpgrade = (upgrade: UpgradeDef) => {
    const currentLvl = upgradeLevels[upgrade.id] || 0;
    if (upgrade.maxLevel !== undefined && currentLvl >= upgrade.maxLevel) return;
    const cost = getUpgradeCost(upgrade, currentLvl);
    if (money < cost) return;

    soundFx.playPurchase();
    setMoney((prev) => prev - cost);
    setUpgradeLevels((prev) => ({
      ...prev,
      [upgrade.id]: currentLvl + 1,
    }));
  };

  const handleResetProgress = () => {
    if (koTimerRef.current) window.clearTimeout(koTimerRef.current);
    setMoney(0);
    setLevel(1);
    setOwnedWeapons(['fist']);
    setEquippedWeaponId('fist');
    setUpgradeLevels({ ...DEFAULT_UPGRADES });
    setTotalPunches(0);
    setTotalKos(0);
    setCombo(0);
    setRageCharge(0);
    setRageUntil(0);
    setBlockingUntil(0);
    setTrauma(createFreshTrauma());
    setBruises([]);
    setLastHitZone(null);
    setLastBloodBurst(null);
    setClearBloodNonce((n) => n + 1);
    setIsKo(false);
    setCampaignCleared(false);
    setShowVictoryModal(false);
    setHp(getEnemyForLevel(1).maxHp);
    bloodRef.current?.clearStains();
    setShowResetModal(false);
    localStorage.removeItem(SAVE_KEY);
  };

  const hpPercent = Math.max(0, Math.min(100, (hp / enemy.maxHp) * 100));
  const isTrevorPsychoticActive =
    screen === 'PLAYING' && enemy.bossId === 'trevor_gta5' && !isKo && trevorPsychoticBurst;
  const canExecute = !isKo && hp > 0 && hp / enemy.maxHp <= (isStunned ? 0.18 : 0.12);
  const strMult = 1 + upgradeLevels.strength * 0.25;
  const effectiveHitDamage = Math.max(
    1,
    Math.round(
      equippedWeapon.baseDamage *
        strMult *
        (1 - enemy.armorPct * (1 - equippedWeapon.armorPierce))
    )
  );

  const handleCreatorJumpToLevel = (targetLevel: number, customEnemyKey: string | null = forcedEnemyKey) => {
    if (koTimerRef.current) window.clearTimeout(koTimerRef.current);
    const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.floor(targetLevel)));
    const nextEnemy = getEnemyForLevel(clamped, customEnemyKey);
    setForcedEnemyKey(customEnemyKey);
    setLevel(clamped);
    setHp(nextEnemy.maxHp);
    setTrauma(createFreshTrauma());
    setBruises([]);
    setLastHitZone(null);
    setLastBloodBurst(null);
    setClearBloodNonce((n) => n + 1);
    setIsKo(false);
    setKoBannerCash(0);
    setBlockingUntil(0);
    setGuardHitsRemaining(0);
    setShowVictoryModal(false);
    bloodRef.current?.clearStains();
    soundFx.warmup(nextEnemy.miniBossId);
    setScreen('PLAYING');
  };

  const handleCreatorSelectCustomEnemy = (enemyKey: string | null) => {
    handleCreatorJumpToLevel(level, enemyKey);
  };

  const handleCreatorTraumaAction = (
    action: 'heal' | 'nose' | 'jaw' | 'skull' | 'blind' | 'artery' | 'tooth' | 'rage' | 'ko'
  ) => {
    if (action === 'heal') {
      setHp(enemy.maxHp);
      setTrauma(createFreshTrauma());
      setBruises([]);
      setLastHitZone(null);
      setLastBloodBurst(null);
      setClearBloodNonce((n) => n + 1);
      setIsKo(false);
      bloodRef.current?.clearStains();
      return;
    }
    if (action === 'rage') {
      setRageCharge(100);
      setRageUntil(Date.now() + 8000);
      return;
    }
    if (action === 'ko') {
      triggerKnockout(
        enemy,
        upgradeLevels.extortion,
        equippedWeapon.cashBonusPct,
        traumaCount,
        true
      );
      return;
    }
    setTrauma((prev) => {
      const next = { ...prev };
      if (action === 'nose') next.noseBroken = !prev.noseBroken;
      if (action === 'jaw') next.jawFractured = !prev.jawFractured;
      if (action === 'skull') next.skullExposed = !prev.skullExposed;
      if (action === 'blind') {
        const nextBlind = !prev.isBlind;
        next.isBlind = nextBlind;
        next.leftEyeSwollen = nextBlind;
        next.rightEyeSwollen = nextBlind;
      }
      if (action === 'artery') {
        next.arterialRupture = !prev.arterialRupture;
        next.bleedStacks = next.arterialRupture ? 10 : 0;
      }
      if (action === 'tooth') {
        next.teethRemaining = prev.teethRemaining > 0 ? prev.teethRemaining - 1 : 6;
        if (next.teethRemaining <= 3) next.lipTorn = true;
      }
      return next;
    });
  };

  const creatorOverlays = (
    <>
      {showCreatorLoginModal && (
        <CreatorLoginModal
          onSuccess={() => {
            setCreatorUnlocked(true);
            setCreatorSessionUnlocked(true);
            setShowCreatorLoginModal(false);
            setShowCreatorPanel(true);
          }}
          onClose={() => setShowCreatorLoginModal(false)}
        />
      )}
      {showCreatorPanel && creatorUnlocked && (
        <CreatorPanel
          level={level}
          money={money}
          ownedWeapons={ownedWeapons}
          equippedWeaponId={equippedWeaponId}
          upgradeLevels={upgradeLevels}
          forcedEnemyKey={forcedEnemyKey}
          modifiers={creatorModifiers}
          trauma={trauma}
          enemyName={enemy.name}
          enemyHp={hp}
          enemyMaxHp={enemy.maxHp}
          onJumpToLevel={handleCreatorJumpToLevel}
          onSelectCustomEnemy={handleCreatorSelectCustomEnemy}
          onSelectWeapon={(weaponId) => {
            setOwnedWeapons((prev) => (prev.includes(weaponId) ? prev : [...prev, weaponId]));
            setEquippedWeaponId(weaponId);
            soundFx.playEquip();
          }}
          onUnlockAllWeapons={() => {
            setOwnedWeapons(WEAPONS.map((w) => w.id));
            soundFx.playPurchase();
          }}
          onAddMoney={(delta) => setMoney((prev) => Math.max(0, prev + delta))}
          onSetMoney={(amount) => setMoney(Math.max(0, amount))}
          onMaxUpgrades={() => {
            const maxed: Record<UpgradeDef['id'], number> = { ...upgradeLevels };
            UPGRADES.forEach((u) => {
              maxed[u.id] = u.maxLevel ?? 50;
            });
            setUpgradeLevels(maxed);
            soundFx.playPurchase();
          }}
          onResetUpgrades={() => setUpgradeLevels({ ...DEFAULT_UPGRADES })}
          onUpdateModifiers={setCreatorModifiers}
          onApplyTraumaAction={handleCreatorTraumaAction}
          onLockCreator={() => {
            setCreatorUnlocked(false);
            setCreatorSessionUnlocked(false);
            setShowCreatorPanel(false);
            setForcedEnemyKey(null);
            setCreatorModifiers({ ...DEFAULT_CREATOR_MODIFIERS });
          }}
          onClose={() => setShowCreatorPanel(false)}
        />
      )}
    </>
  );

  // TITLE SCREEN
  if (screen === 'TITLE_MENU') {
    return (
      <div className="min-h-screen bg-[#111215] text-zinc-100 flex flex-col">
        <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-white/10">
          <span
            onClick={handleSecretLogoTap}
            className="font-display text-2xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 select-none cursor-default"
          >
            Soca-Cara
          </span>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Regras
            </button>
            {creatorUnlocked && (
              <button
                type="button"
                onClick={() => setShowCreatorPanel(true)}
                className="text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
              >
                Painel do Criador
              </button>
            )}
          </nav>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold bg-[#1E2028] hover:bg-[#282B36] text-zinc-200 rounded-lg border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muted ? 'Som Mudo' : 'Som Ativo'}</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-[#181A20] border border-white/10 rounded-2xl p-8 sm:p-10">
            <div className="font-mono-tabular text-xs text-red-400 mb-3">
              Arena Clandestina · Modo Brutal
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-none text-balance">
              Esmague ossos. Faça chorar. Sobreviva ao contra-ataque.
            </h1>
            <p className="text-zinc-400 text-base mt-5 leading-relaxed max-w-xl">
              Enfrente adversários muito mais resistentes que bloqueiam golpes, recuperam fôlego e contra-atacam para roubar seu dinheiro. Cegue os olhos, quebre a mandíbula, rompa artérias e ouça o oponente chorar e gemer de dor enquanto você desbloqueia armas devastadoras.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-sm">
              <div>
                <div className="font-semibold text-white">1. Gore & Choro</div>
                <p className="text-zinc-400 text-xs mt-1">
                  Cortes expõem carne e osso, olhos hemorrágicos choram lágrimas com sangue.
                </p>
              </div>
              <div>
                <div className="font-semibold text-white">2. Guarda & Contra-Ataque</div>
                <p className="text-zinc-400 text-xs mt-1">
                  Quebre a defesa, cegue ou atordoe o alvo para impedir contra-ataques.
                </p>
              </div>
              <div>
                <div className="font-semibold text-white">3. {WEAPONS.length} Armas Letais</div>
                <p className="text-zinc-400 text-xs mt-1">
                  De soqueiras, facões e choque até ácido, criogenia, gauss e antimatéria.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  soundFx.warmup();
                  setScreen('PLAYING');
                }}
                className="min-h-[48px] px-7 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold text-base rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {totalPunches > 0 ? 'Continuar Luta' : 'Entrar na Arena'}
              </button>
              {totalPunches > 0 && (
                <span className="font-mono-tabular text-xs text-zinc-400">
                  Salvo: Nível {level}/{MAX_LEVEL} · {formatMoney(money)} · {totalKos} nocautes
                  {campaignCleared ? ' · Campanha Concluída!' : ''}
                </span>
              )}
            </div>
          </div>
        </main>

        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
        {creatorOverlays}
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#111215] text-zinc-100 flex flex-col">
      {/* Top Bar Contract: Exactly 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3 bg-[#14161B] border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => {
            handleSecretLogoTap();
            setScreen('TITLE_MENU');
          }}
          className="font-display text-2xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
        >
          Soca-Cara
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            type="button"
            onClick={() => {
              setShowHelpModal(false);
              setShowResetModal(false);
            }}
            className="text-zinc-100 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Arena
          </button>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Como Jogar
          </button>
          <button
            type="button"
            onClick={() => {
              bloodRef.current?.clearStains();
              setClearBloodNonce((n) => n + 1);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Limpar Sangue
          </button>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reiniciar
          </button>
          {creatorUnlocked && (
            <button
              type="button"
              onClick={() => setShowCreatorPanel(true)}
              className="text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
            >
              Painel do Criador
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {creatorUnlocked && (
            <button
              type="button"
              onClick={() => setShowCreatorPanel(true)}
              className="md:hidden min-h-[40px] px-3 py-2 text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/40 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              Criador
            </button>
          )}
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold bg-[#1E2028] hover:bg-[#282B36] text-zinc-100 rounded-lg border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {muted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{muted ? 'Mudo' : 'Som Ativo'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_430px] min-h-0">
        <main
          ref={arenaRef}
          className="relative flex flex-col justify-between overflow-hidden bg-[#111215] p-4 sm:p-6 min-h-[560px]"
          style={{
            transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
            backgroundImage: isTrevorPsychoticActive
              ? 'radial-gradient(circle at 50% 50%, rgba(220,38,38,0.28) 0%, rgba(127,29,29,0.16) 45%, rgba(17,18,21,0.98) 78%)'
              : isRageActive
                ? 'radial-gradient(circle at 50% 52%, rgba(220,38,38,0.18) 0%, rgba(17,18,21,0.98) 70%)'
                : enemy.isBoss
                  ? 'radial-gradient(circle at 50% 52%, rgba(217,119,6,0.13) 0%, rgba(153,27,27,0.08) 38%, rgba(17,18,21,0.97) 72%)'
                  : enemy.isMiniBoss
                    ? 'radial-gradient(circle at 50% 52%, rgba(244,63,94,0.13) 0%, rgba(159,18,57,0.07) 38%, rgba(17,18,21,0.97) 72%)'
                    : 'radial-gradient(circle at 50% 52%, rgba(255,255,255,0.035) 0%, rgba(17,18,21,0.95) 68%)',
          }}
        >
          {hitFlash && (
            <div className="pointer-events-none absolute inset-0 z-40 bg-red-600/20" aria-hidden="true" />
          )}

          {isTrevorPsychoticActive && (
            <div
              className="pointer-events-none absolute inset-0 z-30 animate-trevor-static-pulse"
              aria-hidden="true"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(239,68,68,0.08) 0px, rgba(239,68,68,0.08) 1px, transparent 1px, transparent 4px), radial-gradient(circle at center, transparent 42%, rgba(185,28,28,0.34) 100%)',
                boxShadow: 'inset 0 0 85px rgba(239, 68, 68, 0.45)',
              }}
            />
          )}

          <BloodCanvas ref={bloodRef} />

          <div
            className={`relative z-20 flex-1 flex flex-col justify-between min-h-0 ${
              isTrevorPsychoticActive ? 'animate-trevor-psychotic-shake' : ''
            }`}
          >

          {/* Top Arena HUD */}
          <div className="relative z-20 flex flex-col gap-3 max-w-2xl w-full mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono-tabular text-xs text-zinc-400 flex flex-wrap items-center gap-2">
                  {enemy.isBoss && (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                        enemy.isFinalBoss
                          ? 'bg-red-500/20 border-amber-400 text-amber-200'
                          : 'bg-amber-500/15 border-amber-400/50 text-amber-300'
                      }`}
                    >
                      {enemy.isFinalBoss ? 'BOSS FINAL' : 'BOSS'} · {enemy.bossOrigin}
                    </span>
                  )}
                  {enemy.isMiniBoss && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border bg-rose-500/15 border-rose-400/50 text-rose-200">
                      <span className="inline-block w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-red-400" aria-hidden="true" />
                      MINI-BOSS · {enemy.miniBossOrigin}
                    </span>
                  )}
                  <span
                    className={
                      enemy.isBoss
                        ? 'text-amber-400 font-semibold'
                        : enemy.isMiniBoss
                          ? 'text-rose-400 font-semibold'
                          : 'text-red-400 font-semibold'
                    }
                  >
                    Nível {enemy.level}/{MAX_LEVEL}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{enemy.title}</span>
                  <span aria-hidden="true">·</span>
                  <span>Blindagem {Math.round(enemy.armorPct * 100)}%</span>
                </div>
                <h1
                  className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5 ${
                    enemy.isBoss
                      ? 'text-amber-100 drop-shadow-[0_2px_10px_rgba(245,158,11,0.22)]'
                      : enemy.isMiniBoss
                        ? 'text-rose-100 drop-shadow-[0_2px_10px_rgba(244,63,94,0.22)]'
                        : 'text-white'
                  }`}
                >
                  {enemy.name}
                </h1>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400">Seu Dinheiro</div>
                <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-emerald-400">
                  {formatMoney(money)}
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono-tabular mb-1.5">
                <span
                  className={
                    isKo
                      ? 'text-red-400 font-bold'
                      : isInShock
                        ? 'text-red-500 font-bold'
                        : isStunned
                          ? 'text-amber-400 font-bold'
                          : isBlocking
                            ? 'text-sky-300 font-bold'
                            : isCrying
                              ? 'text-red-300 font-semibold'
                              : 'text-zinc-200 font-semibold'
                  }
                >
                  HP: {formatNumber(hp)} / {formatNumber(enemy.maxHp)} ·{' '}
                  {isKo
                    ? 'NOCAUTE!'
                    : isInShock
                      ? 'CHOQUE TRAUMÁTICO (+40% HEMORRAGIA)'
                      : isStunned
                        ? 'ATORDOADO (+50% DANO)'
                        : isBlocking
                          ? `BLOQUEANDO (-75% DANO · ${guardHitsRemaining} golpes)`
                          : isCrying
                            ? enemy.bossId === 'joker'
                              ? 'GARGALHANDO'
                              : 'CHORANDO DE DOR'
                            : isEyesWatering
                              ? enemy.bossId === 'joker'
                                ? 'RINDO DA DOR'
                                : 'OLHOS MAREJADOS'
                              : 'ATIVO'}
                </span>
                <span className="text-zinc-400">
                  Bônus K.O.:{' '}
                  {formatMoney(
                    Math.round(
                      enemy.koReward *
                        (1 + upgradeLevels.extortion * 0.2 + equippedWeapon.cashBonusPct / 100) *
                        (1 + traumaCount * 0.12)
                    )
                  )}
                </span>
              </div>
              <div
                className={`w-full h-3.5 bg-[#1D2028] rounded-full overflow-hidden border ${
                  enemy.isBoss
                    ? 'border-amber-400/50 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
                    : enemy.isMiniBoss
                      ? 'border-rose-400/45 shadow-[0_0_14px_rgba(244,63,94,0.18)]'
                      : 'border-white/10'
                }`}
              >
                <div
                  className={`h-full transition-[width] duration-100 ease-out ${
                    canExecute
                      ? 'bg-gradient-to-r from-red-800 to-amber-500'
                      : isBlocking
                        ? 'bg-gradient-to-r from-zinc-600 to-sky-500'
                        : enemy.isBoss
                          ? 'bg-gradient-to-r from-red-700 via-red-500 to-amber-500'
                          : enemy.isMiniBoss
                            ? 'bg-gradient-to-r from-red-700 via-rose-500 to-pink-500'
                            : 'bg-gradient-to-r from-red-700 to-red-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono-tabular text-zinc-400">
                <span className={trauma.noseBroken ? 'text-red-400 font-semibold' : ''}>
                  Nariz: {trauma.noseBroken ? 'Fraturado' : 'Intacto'}
                </span>
                <span aria-hidden="true">·</span>
                <span className={trauma.jawFractured ? 'text-red-400 font-semibold' : ''}>
                  Mandíbula: {trauma.jawFractured ? 'Exposta (+35% dano)' : 'Firme'}
                </span>
                <span aria-hidden="true">·</span>
                <span className={trauma.teethRemaining < 6 ? 'text-amber-300' : ''}>
                  Dentes: {trauma.teethRemaining}/6
                </span>
                {trauma.isBlind && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400 font-semibold">
                      Visão: Cego (Sem defesa/contra-ataque)
                    </span>
                  </>
                )}
                {trauma.skullExposed && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400 font-semibold">Crânio exposto (+30% crit)</span>
                  </>
                )}
                {(trauma.leftEyeRuptured || trauma.rightEyeRuptured || trauma.eyeRuptured) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400 font-semibold">
                      {trauma.leftEyeRuptured && trauma.rightEyeRuptured
                        ? 'Ambos olhos estourados'
                        : trauma.leftEyeRuptured
                          ? 'Olho esq. estourado'
                          : 'Olho dir. estourado'}
                    </span>
                  </>
                )}
                {trauma.lipTorn && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400 font-semibold">Lábio rasgado</span>
                  </>
                )}
                {(trauma.leftEarBurst || trauma.rightEarBurst || trauma.earTorn) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400 font-semibold">
                      {trauma.leftEarBurst && trauma.rightEarBurst
                        ? 'Ambas orelhas estouradas (+80% tontura)'
                        : trauma.leftEarBurst
                          ? 'Orelha esq. estourada (+40% tontura)'
                          : 'Orelha dir. estourada (+40% tontura)'}
                    </span>
                  </>
                )}
                {(trauma.bleedStacks > 0 || trauma.arterialRupture) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400 font-semibold">
                      {trauma.arterialRupture ? 'Ruptura Arterial' : `Sangramento ${trauma.bleedStacks}x`} ({formatNumber(activeBleedDps)}/s)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center Interactive Face Zone */}
          <div className="relative z-20 flex-1 flex items-center justify-center my-1">
            <div className={isTrevorPsychoticActive ? 'animate-trevor-psychotic-distort' : ''}>
              <TargetFace
                enemy={enemy}
                hp={hp}
                isKo={isKo}
                isStunned={isStunned}
                isBlocking={isBlocking}
                isInShock={isInShock}
                xrayFlash={xrayFlash}
                cryIntensity={cryIntensity}
                isRageActive={isRageActive}
                trauma={trauma}
                hitNonce={hitNonce}
                lastHitOffset={lastHitOffset}
                lastHitZone={lastHitZone}
                bruises={bruises}
                lastBloodBurst={lastBloodBurst}
                clearBloodNonce={clearBloodNonce}
                onChinBloodDrop={(cx, cy, sev) => bloodRef.current?.spawnBleedDrop(cx, cy, sev)}
                onPunch={(cx, cy, sx, sy, zone, sweet) =>
                  executeStrike(cx, cy, sx, sy, zone, sweet, false)
                }
              />
            </div>

            {enemy.bossId === 'trevor_gta5' && trevorSpeech && !isKo && (
              <div
                className={`pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-[92%] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xl text-center border transition-colors ${
                  trevorSpeech.phase === 'psychotic'
                    ? 'bg-red-950/95 border-red-500 text-red-100 shadow-red-950/70 animate-trevor-bubble-glitch'
                    : trevorSpeech.phase === 'aggressive'
                      ? 'bg-zinc-950/95 border-orange-500/80 text-orange-100'
                      : 'bg-zinc-950/92 border-amber-500/60 text-amber-100'
                }`}
              >
                <span
                  className={`font-bold mr-1.5 ${
                    trevorSpeech.phase === 'psychotic'
                      ? 'text-red-400'
                      : trevorSpeech.phase === 'aggressive'
                        ? 'text-orange-400'
                        : 'text-amber-400'
                  }`}
                >
                  {trevorSpeech.phase === 'psychotic'
                    ? 'Trevor (SURTO):'
                    : trevorSpeech.phase === 'aggressive'
                      ? 'Trevor (FURIOSO):'
                      : 'Trevor:'}
                </span>
                <span className={trevorSpeech.phase === 'psychotic' ? 'uppercase tracking-wide font-extrabold' : ''}>
                  “{trevorSpeech.text}”
                </span>
              </div>
            )}

            {enemy.isMiniBoss && miniBossSpeech && !isKo && (
              <div
                className={`pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-[92%] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xl text-center border transition-colors ${
                  miniBossSpeech.phase === 'psychotic'
                    ? 'bg-red-950/95 border-rose-500 text-red-100 shadow-rose-950/60'
                    : miniBossSpeech.phase === 'aggressive'
                      ? 'bg-zinc-950/95 border-rose-500/80 text-rose-100'
                      : 'bg-zinc-950/92 border-red-500/60 text-zinc-100'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 mr-1.5 align-baseline">
                  <span className="inline-flex items-center justify-center w-4 h-3 rounded-[3px] bg-red-600 text-white text-[8px] leading-none">
                    ▶
                  </span>
                  <span
                    className={`font-bold ${
                      miniBossSpeech.phase === 'psychotic'
                        ? 'text-red-400'
                        : miniBossSpeech.phase === 'aggressive'
                          ? 'text-rose-400'
                          : 'text-red-300'
                    }`}
                  >
                    {miniBossSpeech.phase === 'psychotic'
                      ? `${miniBossSpeech.speaker} (SURTANDO):`
                      : miniBossSpeech.phase === 'aggressive'
                        ? `${miniBossSpeech.speaker} (PISTOLA):`
                        : `${miniBossSpeech.speaker}:`}
                  </span>
                </span>
                <span className={miniBossSpeech.phase === 'psychotic' ? 'uppercase tracking-wide font-extrabold' : ''}>
                  “{miniBossSpeech.text}”
                </span>
              </div>
            )}

            {counterAlert && !isKo && (
              <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-red-950/90 border border-red-500/60 px-4 py-1.5 rounded-lg text-xs font-mono-tabular font-bold text-red-200 whitespace-nowrap">
                {counterAlert}
              </div>
            )}

            {isKo && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
                <div
                  className={`bg-[#111215]/95 border px-7 py-4 rounded-xl text-center shadow-2xl ${
                    enemy.isBoss
                      ? 'border-amber-400/60'
                      : enemy.isMiniBoss
                        ? 'border-rose-400/60'
                        : 'border-red-500/50'
                  }`}
                >
                  <div
                    className={`font-display text-5xl font-extrabold tracking-tight ${
                      enemy.isBoss
                        ? 'text-amber-300'
                        : enemy.isMiniBoss
                          ? 'text-rose-300'
                          : 'text-red-500'
                    }`}
                  >
                    {koBannerLabel}
                  </div>
                  <div className="font-mono-tabular text-sm text-emerald-400 font-bold mt-1">
                    +{formatMoney(koBannerCash)} ·{' '}
                    {enemy.level >= MAX_LEVEL
                      ? 'Desafio Final Concluído!'
                      : 'Próximo adversário entrando...'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weapon Swing Visual Effects & Floating Damage Layer */}
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
            {swings.map((sw) => (
              <React.Fragment key={sw.id}>
                <div
                  className="animate-shockwave absolute rounded-full border-2"
                  style={{
                    left: sw.x,
                    top: sw.y,
                    width: sw.isCrit ? 92 : 60,
                    height: sw.isCrit ? 92 : 60,
                    borderColor: sw.isCrit ? '#ef4444' : 'rgba(255,255,255,0.45)',
                  }}
                />
                <div
                  className="animate-strike-swing absolute flex items-center justify-center"
                  style={{
                    left: sw.x,
                    top: sw.y,
                    color: sw.isCrit ? '#ef4444' : equippedWeapon.accentColor,
                  }}
                >
                  <WeaponIcon weaponId={sw.weaponId} className="w-12 h-12 drop-shadow-lg" />
                </div>
              </React.Fragment>
            ))}

            {popups.map((p) => (
              <div
                key={p.id}
                className="animate-float-damage absolute flex flex-col items-center whitespace-nowrap"
                style={{ left: p.x, top: p.y }}
              >
                {p.label && (
                  <span className="font-display text-sm font-bold tracking-wide text-amber-300 drop-shadow mb-0.5">
                    {p.label}
                  </span>
                )}
                <span
                  className={`font-mono-tabular font-bold leading-none drop-shadow-md ${
                    p.isCrit ? 'text-xl sm:text-2xl text-red-400' : 'text-base sm:text-lg text-white'
                  }`}
                >
                  -{formatNumber(p.damage)}
                  {p.isCrit ? ' CRÍTICO!' : ''}
                </span>
                <span className="font-mono-tabular text-xs font-semibold text-emerald-400 mt-0.5 drop-shadow">
                  +{formatMoney(p.cash)}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Brutality Controls */}
          <div className="relative z-20 max-w-2xl w-full mx-auto flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#17191F] border border-white/10 rounded-xl px-4 py-2.5">
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center justify-between text-xs font-mono-tabular mb-1">
                  <span className={isRageActive ? 'text-red-400 font-bold' : 'text-zinc-300'}>
                    {isRageActive
                      ? `MODO MASSACRE · ${((rageUntil - nowMs) / 1000).toFixed(1)}s`
                      : `Fúria Sanguinária: ${Math.floor(rageCharge)}%`}
                  </span>
                  <span className="text-zinc-500">Tecla F</span>
                </div>
                <div className="w-full h-2 bg-[#111215] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-[width] duration-100 ${
                      isRageActive
                        ? 'bg-red-500'
                        : rageCharge >= 100
                          ? 'bg-amber-400'
                          : 'bg-red-700'
                    }`}
                    style={{
                      width: `${isRageActive ? Math.min(100, ((rageUntil - nowMs) / 6500) * 100) : rageCharge}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={rageCharge < 100 || isRageActive || isKo}
                  onClick={activateRageMode}
                  className={`min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                    rageCharge >= 100 && !isRageActive && !isKo
                      ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                      : 'bg-[#22252D] text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Massacre (F)
                </button>

                <button
                  type="button"
                  disabled={!canExecute}
                  onClick={executeFinisher}
                  className={`min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    canExecute
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer'
                      : 'bg-[#22252D] text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Executar (E)
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <WeaponIcon weaponId={equippedWeapon.id} className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-white">{equippedWeapon.name}</span>
                <span aria-hidden="true" className="text-zinc-500">·</span>
                <span className="font-mono-tabular text-zinc-400">
                  {formatNumber(effectiveHitDamage)} dano real/golpe
                </span>
                {traumaCount > 0 && (
                  <>
                    <span aria-hidden="true" className="text-zinc-500">·</span>
                    <span className="font-mono-tabular text-amber-400">
                      +{traumaCount * 15}% bônus trauma
                    </span>
                  </>
                )}
              </div>

              <div className="font-mono-tabular text-zinc-400 flex items-center gap-3">
                {combo > 1 && <span className="text-amber-400 font-semibold">Combo {combo}x</span>}
                <span>Nocautes: {totalKos}</span>
                <span className="hidden sm:inline text-zinc-500">Espaço para socar</span>
              </div>
            </div>
          </div>

          <div className="relative z-20 flex md:hidden items-center justify-center gap-4 mt-2 pt-2 border-t border-white/5 text-xs text-zinc-400">
            <button type="button" onClick={() => setShowHelpModal(true)} className="py-1.5 px-2 hover:text-white">
              Como Jogar
            </button>
            <button
              type="button"
              onClick={() => {
                bloodRef.current?.clearStains();
                setClearBloodNonce((n) => n + 1);
              }}
              className="py-1.5 px-2 hover:text-white"
            >
              Limpar Sangue
            </button>
            <button type="button" onClick={() => setShowResetModal(true)} className="py-1.5 px-2 hover:text-red-400">
              Reiniciar
            </button>
          </div>
          </div>
        </main>

        {/* Right Panel: Armory & Upgrades */}
        <div className="min-h-0 h-full overflow-hidden">
          <ArmoryPanel
            money={money}
            ownedWeapons={ownedWeapons}
            equippedWeaponId={equippedWeaponId}
            upgradeLevels={upgradeLevels}
            onBuyWeapon={handleBuyWeapon}
            onEquipWeapon={handleEquipWeapon}
            onBuyUpgrade={handleBuyUpgrade}
          />
        </div>
      </div>

      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}

      {showVictoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="victory-modal-title"
        >
          <div className="bg-[#181A20] border border-amber-400/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="font-mono-tabular text-xs font-bold uppercase tracking-wider text-amber-300">
              Nível 90/90 Concluído · Red Dead Redemption 2
            </div>
            <h2 id="victory-modal-title" className="font-display text-3xl font-extrabold text-white mt-1">
              Você derrotou Arthur Morgan!
            </h2>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              O pistoleiro lendário caiu na arena clandestina. Você zerou todos os 90 níveis do Soca-Cara!
            </p>
            <div className="grid grid-cols-3 gap-2.5 mt-4 bg-[#111215] border border-white/10 rounded-xl p-3 font-mono-tabular text-center">
              <div>
                <div className="text-[11px] text-zinc-400">Dinheiro</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{formatMoney(money)}</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Golpes</div>
                <div className="text-sm font-bold text-white mt-0.5">{formatNumber(totalPunches)}</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Nocautes</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">{totalKos}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleResetProgress}
                className="min-h-[40px] px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-[#22252C] rounded-lg cursor-pointer"
              >
                Novo Jogo (Nível 1)
              </button>
              <button
                type="button"
                onClick={() => setShowVictoryModal(false)}
                className="min-h-[40px] px-5 py-2 text-sm font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
              >
                Rejogar Nível 90
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <div className="bg-[#181A20] border border-white/10 rounded-xl max-w-md w-full p-6">
            <h2 id="reset-modal-title" className="font-display text-2xl font-bold text-white">
              Reiniciar progresso?
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Isso irá apagar seu dinheiro, nível atual, armas desbloqueadas e melhorias compradas, voltando para o Nível 1 com o Punho Limpo.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="min-h-[40px] px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-[#22252C] rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetProgress}
                className="min-h-[40px] px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer"
              >
                Confirmar Reinício
              </button>
            </div>
          </div>
        </div>
      )}
      {creatorOverlays}
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="bg-[#181A20] border border-white/10 rounded-xl max-w-lg w-full p-6">
        <h2 id="help-modal-title" className="font-display text-2xl font-bold text-white">
          Como Jogar Soca-Cara
        </h2>
        <div className="space-y-3 text-sm text-zinc-300 mt-4 leading-relaxed">
          <p>
            <strong className="text-white">Traumas Anatômicos & Choque:</strong> Golpeie a testa para expor o crânio (+30% crítico), quebre a mandíbula expondo o osso (+35% dano), rasgue o lábio, estouro ocular com lágrimas de sangue e ruptura arterial com jatos pulsantes. Acumular traumas leva o alvo ao Choque Traumático (+40% hemorragia e sem bloqueio).
          </p>
          <p>
            <strong className="text-white">Dificuldade Alta:</strong> A partir do Nível 2, os inimigos levantam a Guarda (-75% de dano até quebrar com 6 golpes), regeneram HP rapidamente se você parar de pressionar e dão Contra-Ataques frequentes que quebram seu combo e tiram dinheiro. Ossos ficam ainda mais densos em níveis altos (capacetes e mandíbulas metálicas resistem mais a fraturas expostas).
          </p>
          <p>
            <strong className="text-white">Como Evitar Contra-Ataques:</strong> Atordoe o queixo para aplicar concussão, cegue os olhos ou leve o oponente ao Choque Traumático — alvos atordoados, cegos ou em choque não contra-atacam nem bloqueiam.
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
