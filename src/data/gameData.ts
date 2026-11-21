export type SoundProfile =
  | 'punch'
  | 'heavy'
  | 'blade'
  | 'chainsaw'
  | 'shotgun'
  | 'plasma'
  | 'flame'
  | 'gauss'
  | 'nuke'
  | 'shock'
  | 'acid'
  | 'cryo'
  | 'explosive';

export type HitZone =
  | 'leftEye'
  | 'rightEye'
  | 'nose'
  | 'mouth'
  | 'jaw'
  | 'leftEar'
  | 'rightEar'
  | 'forehead';

export interface TraumaState {
  noseBroken: boolean;
  noseDamage: number;
  teethRemaining: number; // starts at 6
  mouthDamage: number;
  lipTorn: boolean;
  leftEyeSwollen: boolean;
  rightEyeSwollen: boolean;
  leftEyeRuptured: boolean;
  rightEyeRuptured: boolean;
  isBlind: boolean;
  eyeRuptured: boolean;
  eyeDamage: number;
  leftEyeDamage: number;
  rightEyeDamage: number;
  jawFractured: boolean;
  jawDamage: number;
  skullExposed: boolean;
  foreheadDamage: number;
  earTorn: boolean;
  leftEarSwollen: boolean;
  rightEarSwollen: boolean;
  leftEarBurst: boolean;
  rightEarBurst: boolean;
  earDamage: number;
  leftEarDamage: number;
  rightEarDamage: number;
  arterialRupture: boolean;
  stunGauge: number; // 0 to 100
  stunnedUntil: number; // timestamp ms
  bleedStacks: number; // 0 to 12
}

export interface Weapon {
  id: string;
  name: string;
  description: string;
  price: number;
  baseDamage: number;
  critChance: number; // 0 to 1
  critMultiplier: number;
  bleedDps: number; // extra bleed per second applied per stack
  traumaPower: number; // multiplier for breaking nose, jaw, knocking teeth, stunning
  cashBonusPct: number; // extra money %
  armorPierce: number; // 0 to 1 (ignores part of enemy resistance)
  bloodIntensity: number; // 1 to 8
  sound: SoundProfile;
  accentColor: string;
}

export interface UpgradeDef {
  id:
    | 'strength'
    | 'lethality'
    | 'hemorrhage'
    | 'boneCrusher'
    | 'bloodlust'
    | 'extortion'
    | 'henchman';
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel?: number;
  effectLabel: (level: number) => string;
}

export type EnemySpecies = 'human' | 'neanderthal' | 'cyclops' | 'titan';

export const MAX_LEVEL = 90;

export type BossId =
  | 'trevor_gta5'
  | 'john_wick'
  | 'kratos'
  | 't800'
  | 'wolverine'
  | 'geralt'
  | 'joker'
  | 'thanos'
  | 'arthur_morgan';

export type MiniBossId =
  | 'davy_jones'
  | 'felipe_neto'
  | 'whindersson'
  | 'kleberiano'
  | 'alanzoka'
  | 'casimiro'
  | 'smzinho'
  | 'cellbit'
  | 'luccas_neto';

export type ShirtStyle =
  | 'tshirt_casual'
  | 'flannel_open'
  | 'leather_punk'
  | 'boxing_tank'
  | 'bouncer_polo'
  | 'butcher_apron'
  | 'tactical_vest'
  | 'titanium_armor'
  | 'pelt_fur'
  | 'war_pelt'
  | 'ogre_harness'
  | 'barbarian_plate'
  | 'titan_wraps'
  | 'titan_chains'
  | 'hoodie_street'
  | 'mafia_suit'
  | 'prison_orange'
  | 'samurai_gi'
  | 'mechanic_overall'
  | 'cyber_collar'
  | 'trevor_tee'
  | 'continental_suit'
  | 'spartan_armor'
  | 'biker_jacket'
  | 'mutant_suit'
  | 'witcher_armor'
  | 'joker_suit'
  | 'infinity_plate'
  | 'arthur_coat';

export type FaceAccessory =
  | 'none'
  | 'sunglasses'
  | 'visor'
  | 'eyepatch_l'
  | 'eyepatch_r'
  | 'bandaid_nose'
  | 'war_paint'
  | 'face_tats'
  | 'freckles'
  | 'monocle'
  | 'goggles'
  | 'gold_hoop';

export interface EnemyProfile {
  level: number;
  name: string;
  title: string;
  isBoss?: boolean;
  isFinalBoss?: boolean;
  isMiniBoss?: boolean;
  bossId?: BossId;
  bossOrigin?: string;
  miniBossId?: MiniBossId;
  miniBossOrigin?: string;
  species: EnemySpecies;
  visualVariant?: 'default' | 'tundra' | 'mine' | 'crimson';
  maxHp: number;
  armorPct: number; // damage reduction 0 to 0.94
  regenPerSecPct: number; // % of maxHp regenerated per second when idle
  koReward: number;
  hitRewardBase: number;
  voicePitch: number; // 0.69 (deep) to 1.12 (higher)
  skinColor: string;
  skinShadow: string;
  hairColor: string;
  eyeColor?: string;
  hairStyle:
    | 'bald'
    | 'short'
    | 'mohawk'
    | 'buzz'
    | 'spiky'
    | 'helmet'
    | 'wild'
    | 'pompadour'
    | 'dreads'
    | 'afro'
    | 'slick_back'
    | 'bandana_gang'
    | 'trevor_receding'
    | 'john_wick'
    | 't800_flattop'
    | 'wolverine_wings'
    | 'geralt_witcher'
    | 'joker_curls'
    | 'arthur_outlaw';
  facialHair: 'none' | 'stubble' | 'beard' | 'goatee' | 'handlebar';
  shirtStyle: ShirtStyle;
  faceAccessory?: FaceAccessory;
  hasCyberEye: boolean;
  hasMetalJaw: boolean;
  hasScar: boolean;
}

export type GameScreenState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED';

export interface BruiseMark {
  id: number;
  x: number; // SVG coords (0-320)
  y: number; // SVG coords (0-360)
  radius: number;
  kind:
    | 'bruise'
    | 'cut'
    | 'slash_deep'
    | 'razor_nick'
    | 'cheek_split'
    | 'subdermal_clot'
    | 'petechiae'
    | 'shrapnel_tear'
    | 'splatter'
    | 'gash'
    | 'laceration'
    | 'scrape'
    | 'hematoma'
    | 'knuckle_welt'
    | 'brow_split'
    | 'puncture'
    | 'burn'
    | 'plasma_sear'
    | 'acid_burn'
    | 'frost_burn';
  rotation: number;
  showBone?: boolean;
  severity?: number;
  zone?: HitZone;
}

export interface FacialBloodBurst {
  id: number;
  x: number;
  y: number;
  zone: HitZone;
  severity: number; // 0.15 to 1.0
  isCrit: boolean;
}

export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  damage: number;
  cash: number;
  isCrit: boolean;
  isSweetSpot: boolean;
  label?: string;
}

export interface WeaponSwingFX {
  id: number;
  x: number;
  y: number;
  weaponId: string;
  isCrit: boolean;
}

export const WEAPONS: Weapon[] = [
  {
    id: 'fist',
    name: 'Punho Limpo',
    description: 'Soco direto seco no queixo. Começo de todo brigão.',
    price: 0,
    baseDamage: 10,
    critChance: 0.08,
    critMultiplier: 1.8,
    bleedDps: 0,
    traumaPower: 1.0,
    cashBonusPct: 0,
    armorPierce: 0,
    bloodIntensity: 1.2,
    sound: 'punch',
    accentColor: '#e4e4e7',
  },
  {
    id: 'boxer_wraps',
    name: 'Bandagem com Gesso',
    description: 'Faixas endurecidas para socos rápidos que racham maçãs do rosto e queixo.',
    price: 240,
    baseDamage: 16,
    critChance: 0.11,
    critMultiplier: 1.9,
    bleedDps: 2,
    traumaPower: 1.2,
    cashBonusPct: 5,
    armorPierce: 0.02,
    bloodIntensity: 1.5,
    sound: 'punch',
    accentColor: '#f5f5f4',
  },
  {
    id: 'studded_gloves',
    name: 'Luvas com Tachas',
    description: 'Couro reforçado com rebites de ferro para rasgar a pele.',
    price: 750,
    baseDamage: 24,
    critChance: 0.12,
    critMultiplier: 2.0,
    bleedDps: 5,
    traumaPower: 1.35,
    cashBonusPct: 10,
    armorPierce: 0.05,
    bloodIntensity: 1.8,
    sound: 'punch',
    accentColor: '#a1a1aa',
  },
  {
    id: 'broken_bottle',
    name: 'Garrafa Quebrada',
    description: 'Vidro estilhaçado de bar que abre cortes serrilhados no rosto.',
    price: 2200,
    baseDamage: 40,
    critChance: 0.16,
    critMultiplier: 2.2,
    bleedDps: 14,
    traumaPower: 1.5,
    cashBonusPct: 15,
    armorPierce: 0.08,
    bloodIntensity: 2.2,
    sound: 'blade',
    accentColor: '#4ade80',
  },
  {
    id: 'brass_knuckles',
    name: 'Soco-Inglês de Aço',
    description: 'Concentra toda força nos nós dos dedos. Quebra dentes e mandíbula.',
    price: 6500,
    baseDamage: 58,
    critChance: 0.18,
    critMultiplier: 2.3,
    bleedDps: 10,
    traumaPower: 1.9,
    cashBonusPct: 20,
    armorPierce: 0.15,
    bloodIntensity: 2.4,
    sound: 'heavy',
    accentColor: '#f59e0b',
  },
  {
    id: 'steel_crowbar',
    name: 'Pé de Cabra de Aço',
    description: 'Barra de aço forjado para afundar narizes e esmagar arcos dentários.',
    price: 18500,
    baseDamage: 92,
    critChance: 0.19,
    critMultiplier: 2.4,
    bleedDps: 22,
    traumaPower: 2.3,
    cashBonusPct: 28,
    armorPierce: 0.2,
    bloodIntensity: 2.8,
    sound: 'heavy',
    accentColor: '#38bdf8',
  },
  {
    id: 'barbed_bat',
    name: 'Taco com Arame Farpado',
    description: 'Madeira maciça enrolada em arame. Causa concussão e hemorragia severa.',
    price: 52000,
    baseDamage: 135,
    critChance: 0.2,
    critMultiplier: 2.5,
    bleedDps: 38,
    traumaPower: 2.5,
    cashBonusPct: 35,
    armorPierce: 0.22,
    bloodIntensity: 3.1,
    sound: 'heavy',
    accentColor: '#d97706',
  },
  {
    id: 'spiked_machete',
    name: 'Facão de Selva',
    description: 'Lâmina larga pesada que abre talhos fundos em um único golpe.',
    price: 145000,
    baseDamage: 215,
    critChance: 0.24,
    critMultiplier: 2.7,
    bleedDps: 70,
    traumaPower: 2.4,
    cashBonusPct: 42,
    armorPierce: 0.28,
    bloodIntensity: 3.5,
    sound: 'blade',
    accentColor: '#a3e635',
  },
  {
    id: 'tactical_knife',
    name: 'Faca Tática Serrilhada',
    description: 'Cortes precisos e profundos que abrem artérias e multiplicam sangramento.',
    price: 420000,
    baseDamage: 310,
    critChance: 0.28,
    critMultiplier: 2.8,
    bleedDps: 105,
    traumaPower: 2.3,
    cashBonusPct: 50,
    armorPierce: 0.35,
    bloodIntensity: 3.8,
    sound: 'blade',
    accentColor: '#ef4444',
  },
  {
    id: 'taser_baton',
    name: 'Cassetete de Choque',
    description: 'Descarga elétrica de alta voltagem que atordoa e cauteriza a pele.',
    price: 1250000,
    baseDamage: 510,
    critChance: 0.26,
    critMultiplier: 3.0,
    bleedDps: 145,
    traumaPower: 3.3,
    cashBonusPct: 62,
    armorPierce: 0.44,
    bloodIntensity: 3.9,
    sound: 'shock',
    accentColor: '#60a5fa',
  },
  {
    id: 'fire_axe',
    name: 'Machado de Incêndio',
    description: 'Lâmina pesada feita para partir capacetes, ossos e crânios.',
    price: 3800000,
    baseDamage: 740,
    critChance: 0.25,
    critMultiplier: 3.2,
    bleedDps: 230,
    traumaPower: 3.4,
    cashBonusPct: 75,
    armorPierce: 0.5,
    bloodIntensity: 4.4,
    sound: 'blade',
    accentColor: '#dc2626',
  },
  {
    id: 'sledgehammer',
    name: 'Marreta de Demolição',
    description: 'Cabeça de aço maciço capaz de afundar mandíbulas blindadas.',
    price: 12000000,
    baseDamage: 1220,
    critChance: 0.27,
    critMultiplier: 3.3,
    bleedDps: 360,
    traumaPower: 4.4,
    cashBonusPct: 92,
    armorPierce: 0.58,
    bloodIntensity: 4.8,
    sound: 'heavy',
    accentColor: '#94a3b8',
  },
  {
    id: 'chainsaw',
    name: 'Motosserra Industrial',
    description: 'Corrente em alta rotação que dilacera carne e qualquer resistência.',
    price: 38000000,
    baseDamage: 1850,
    critChance: 0.32,
    critMultiplier: 3.4,
    bleedDps: 680,
    traumaPower: 4.2,
    cashBonusPct: 110,
    armorPierce: 0.65,
    bloodIntensity: 5.2,
    sound: 'chainsaw',
    accentColor: '#f97316',
  },
  {
    id: 'nail_gun',
    name: 'Pistola de Pregos',
    description: 'Disparos pneumáticos de aço que perfuram tecido e osso sem parar.',
    price: 125000000,
    baseDamage: 3100,
    critChance: 0.36,
    critMultiplier: 3.6,
    bleedDps: 1100,
    traumaPower: 4.6,
    cashBonusPct: 135,
    armorPierce: 0.74,
    bloodIntensity: 5.4,
    sound: 'shotgun',
    accentColor: '#fbbf24',
  },
  {
    id: 'shotgun',
    name: 'Escopeta Calibre 12',
    description: 'Disparo à queima-roupa com impacto brutal e estilhaços devastadores.',
    price: 420000000,
    baseDamage: 4600,
    critChance: 0.38,
    critMultiplier: 3.8,
    bleedDps: 1500,
    traumaPower: 5.0,
    cashBonusPct: 160,
    armorPierce: 0.8,
    bloodIntensity: 5.8,
    sound: 'shotgun',
    accentColor: '#fb7185',
  },
  {
    id: 'acid_sprayer',
    name: 'Rifle de Ácido Corrosivo',
    description: 'Jato cáustico que dissolve placas metálicas e necrosa a pele.',
    price: 1500000000,
    baseDamage: 7900,
    critChance: 0.42,
    critMultiplier: 4.0,
    bleedDps: 2550,
    traumaPower: 5.5,
    cashBonusPct: 200,
    armorPierce: 0.88,
    bloodIntensity: 5.9,
    sound: 'acid',
    accentColor: '#84cc16',
  },
  {
    id: 'plasma_cannon',
    name: 'Canhão de Plasma',
    description: 'Descarga térmica letal que vaporiza armaduras de titânio.',
    price: 5500000000,
    baseDamage: 12500,
    critChance: 0.45,
    critMultiplier: 4.2,
    bleedDps: 3800,
    traumaPower: 6.0,
    cashBonusPct: 240,
    armorPierce: 0.92,
    bloodIntensity: 6.0,
    sound: 'plasma',
    accentColor: '#38bdf8',
  },
  {
    id: 'desert_eagle',
    name: 'Pistola .50 Desert Eagle',
    description: 'Balística pesada de precisão cirúrgica com altíssima chance crítica.',
    price: 22000000000,
    baseDamage: 23500,
    critChance: 0.48,
    critMultiplier: 4.4,
    bleedDps: 6800,
    traumaPower: 6.4,
    cashBonusPct: 280,
    armorPierce: 0.94,
    bloodIntensity: 6.3,
    sound: 'shotgun',
    accentColor: '#e2e8f0',
  },
  {
    id: 'napalm_flamer',
    name: 'Lança-Chamas Napalm',
    description: 'Carboniza o rosto e derrete blindagens pesadas com fogo líquido.',
    price: 90000000000,
    baseDamage: 38000,
    critChance: 0.48,
    critMultiplier: 4.5,
    bleedDps: 11500,
    traumaPower: 6.8,
    cashBonusPct: 320,
    armorPierce: 0.96,
    bloodIntensity: 6.5,
    sound: 'flame',
    accentColor: '#fb923c',
  },
  {
    id: 'rocket_launcher',
    name: 'Lança-Foguetes RPG-7',
    description: 'Onda de choque explosiva e estilhaços incandescentes à queima-roupa.',
    price: 380000000000,
    baseDamage: 72000,
    critChance: 0.52,
    critMultiplier: 4.9,
    bleedDps: 21500,
    traumaPower: 7.4,
    cashBonusPct: 375,
    armorPierce: 0.97,
    bloodIntensity: 7.0,
    sound: 'explosive',
    accentColor: '#f97316',
  },
  {
    id: 'mono_katana',
    name: 'Katana Monomolecular',
    description: 'Fio subatômico que atravessa aço e rompe artérias instantaneamente.',
    price: 1800000000000,
    baseDamage: 125000,
    critChance: 0.56,
    critMultiplier: 5.2,
    bleedDps: 38000,
    traumaPower: 7.5,
    cashBonusPct: 430,
    armorPierce: 0.98,
    bloodIntensity: 7.2,
    sound: 'blade',
    accentColor: '#f43f5e',
  },
  {
    id: 'laser_cutter',
    name: 'Cortador a Laser Cirúrgico',
    description: 'Feixe focalizado de altíssima energia que perfura e cauteriza em milissegundos.',
    price: 8500000000000,
    baseDamage: 235000,
    critChance: 0.6,
    critMultiplier: 5.4,
    bleedDps: 68000,
    traumaPower: 8.2,
    cashBonusPct: 500,
    armorPierce: 0.99,
    bloodIntensity: 7.3,
    sound: 'plasma',
    accentColor: '#ec4899',
  },
  {
    id: 'diamond_ripper',
    name: 'Serra Orbital de Diamante',
    description: 'Disco giratório supersônico feito para trituração óssea extrema.',
    price: 42000000000000,
    baseDamage: 410000,
    critChance: 0.58,
    critMultiplier: 5.5,
    bleedDps: 125000,
    traumaPower: 9.0,
    cashBonusPct: 580,
    armorPierce: 0.99,
    bloodIntensity: 7.6,
    sound: 'chainsaw',
    accentColor: '#e879f9',
  },
  {
    id: 'minigun_rotary',
    name: 'Metralhadora Vulcan',
    description: 'Chuva de projéteis de urânio que tritura qualquer blindagem de chefe.',
    price: 220000000000000,
    baseDamage: 780000,
    critChance: 0.6,
    critMultiplier: 5.8,
    bleedDps: 230000,
    traumaPower: 9.8,
    cashBonusPct: 670,
    armorPierce: 0.99,
    bloodIntensity: 7.8,
    sound: 'shotgun',
    accentColor: '#fb923c',
  },
  {
    id: 'gauss_railgun',
    name: 'Canhão Railgun Gauss',
    description: 'Projétil eletromagnético hipersônico que ignora 100% da armadura.',
    price: 1200000000000000,
    baseDamage: 1350000,
    critChance: 0.62,
    critMultiplier: 6.0,
    bleedDps: 360000,
    traumaPower: 10.5,
    cashBonusPct: 760,
    armorPierce: 1.0,
    bloodIntensity: 8.0,
    sound: 'gauss',
    accentColor: '#22d3ee',
  },
  {
    id: 'cryo_shatter',
    name: 'Canhão Criogênico Zero',
    description: 'Congela carne instantaneamente a zero absoluto e estilhaça o osso no impacto.',
    price: 7500000000000000,
    baseDamage: 2600000,
    critChance: 0.65,
    critMultiplier: 6.4,
    bleedDps: 650000,
    traumaPower: 11.4,
    cashBonusPct: 880,
    armorPierce: 1.0,
    bloodIntensity: 8.0,
    sound: 'cryo',
    accentColor: '#67e8f9',
  },
  {
    id: 'thermonuke_hammer',
    name: 'Martelo Termonuclear',
    description: 'Impacto sísmico apocalíptico que oblitera crânios blindados em um golpe.',
    price: 48000000000000000,
    baseDamage: 4800000,
    critChance: 0.68,
    critMultiplier: 6.8,
    bleedDps: 1200000,
    traumaPower: 12.5,
    cashBonusPct: 1000,
    armorPierce: 1.0,
    bloodIntensity: 8.0,
    sound: 'nuke',
    accentColor: '#facc15',
  },
  {
    id: 'antimatter_fist',
    name: 'Manopla de Antimatéria',
    description: 'Colapso gravitacional concentrado no punho. Aniquilação absoluta em cada soco.',
    price: 350000000000000000,
    baseDamage: 11500000,
    critChance: 0.72,
    critMultiplier: 7.5,
    bleedDps: 2800000,
    traumaPower: 14.5,
    cashBonusPct: 1250,
    armorPierce: 1.0,
    bloodIntensity: 8.0,
    sound: 'nuke',
    accentColor: '#c084fc',
  },
];

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'strength',
    name: 'Força Bruta',
    description: 'Aumenta o dano base de todos os golpes e armas em +25% por nível.',
    baseCost: 85,
    costMultiplier: 1.62,
    effectLabel: (lvl) => `+${lvl * 25}% de dano`,
  },
  {
    id: 'lethality',
    name: 'Golpe Letal',
    description: 'Aumenta a chance crítica (+2%) e o dano crítico (+15%) por nível.',
    baseCost: 140,
    costMultiplier: 1.7,
    maxLevel: 20,
    effectLabel: (lvl) => `+${lvl * 2}% crit · +${lvl * 15}% mult`,
  },
  {
    id: 'hemorrhage',
    name: 'Hemorragia Profunda',
    description: 'Amplifica o sangramento acumulado e rupturas arteriais (+35% DPS por nível).',
    baseCost: 210,
    costMultiplier: 1.66,
    effectLabel: (lvl) => `+${lvl * 35}% sangramento`,
  },
  {
    id: 'boneCrusher',
    name: 'Esmagador de Ossos',
    description: 'Acelera fratura nasal, mandíbula, orelha, perda de dentes e concussão (+30%).',
    baseCost: 260,
    costMultiplier: 1.7,
    maxLevel: 15,
    effectLabel: (lvl) => `+${lvl * 30}% trauma e concussão`,
  },
  {
    id: 'bloodlust',
    name: 'Sede de Sangue',
    description: 'Carrega a Fúria mais rápido (+20%) e amplia o dano no Modo Massacre (+25%).',
    baseCost: 340,
    costMultiplier: 1.75,
    maxLevel: 15,
    effectLabel: (lvl) => `+${lvl * 20}% carga · +${lvl * 25}% fúria`,
  },
  {
    id: 'extortion',
    name: 'Extorsão',
    description: 'Aumenta o dinheiro obtido por golpe, execução e nocaute em +20% por nível.',
    baseCost: 130,
    costMultiplier: 1.66,
    effectLabel: (lvl) => `+${lvl * 20}% dinheiro`,
  },
  {
    id: 'henchman',
    name: 'Capanga de Arena',
    description: 'Desfere socos automáticos no rosto a cada segundo (escala com sua arma).',
    baseCost: 360,
    costMultiplier: 1.8,
    maxLevel: 25,
    effectLabel: (lvl) => (lvl === 0 ? 'Inativo' : `${lvl} golpe${lvl > 1 ? 's' : ''}/seg`),
  },
];

type EnemyArchetype = {
  name: string;
  title: string;
  species: EnemySpecies;
  visualVariant?: 'default' | 'tundra' | 'mine' | 'crimson';
  voicePitch: number;
  skinColor: string;
  skinShadow: string;
  hairColor: string;
  eyeColor?: string;
  hairStyle: EnemyProfile['hairStyle'];
  facialHair: EnemyProfile['facialHair'];
  shirtStyle: ShirtStyle;
  faceAccessory?: FaceAccessory;
  hasCyberEye?: boolean;
  hasMetalJaw?: boolean;
  hasScar?: boolean;
};

// 81 completamente distintos NPCs (um único por cada nível regular de 1 a 90, sem nenhum "MK" repetido)
const ARCHETYPES: EnemyArchetype[] = [
  // Níveis 1-9 (Antes do Trevor Philips)
  { name: 'Zé da Esquina', title: 'O Novato', species: 'human', voicePitch: 1.07, skinColor: '#e2aa87', skinShadow: '#b97b56', hairColor: '#27201c', eyeColor: '#5c3824', hairStyle: 'short', facialHair: 'none', shirtStyle: 'tshirt_casual', faceAccessory: 'bandaid_nose' },
  { name: 'Beto Marra', title: 'Valentão de Bar', species: 'human', voicePitch: 0.96, skinColor: '#d99a73', skinShadow: '#ac6d46', hairColor: '#422818', eyeColor: '#4d7c0f', hairStyle: 'buzz', facialHair: 'stubble', shirtStyle: 'flannel_open', faceAccessory: 'none', hasScar: true },
  { name: 'Grug das Cavernas', title: 'Neandertal Pré-Histórico', species: 'neanderthal', voicePitch: 0.82, skinColor: '#bf8760', skinShadow: '#8a5836', hairColor: '#291c14', eyeColor: '#78350f', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'pelt_fur', faceAccessory: 'none', hasScar: true },
  { name: 'Navalha', title: 'Punk de Beco', species: 'human', voicePitch: 1.08, skinColor: '#c98863', skinShadow: '#995c3c', hairColor: '#dc2626', eyeColor: '#3b82f6', hairStyle: 'mohawk', facialHair: 'goatee', shirtStyle: 'leather_punk', faceAccessory: 'face_tats' },
  { name: 'Brontes', title: 'Ogro Ciclope do Pântano', species: 'cyclops', voicePitch: 0.76, skinColor: '#75915b', skinShadow: '#4a5f36', hairColor: '#1f2918', eyeColor: '#fb923c', hairStyle: 'bald', facialHair: 'none', shirtStyle: 'ogre_harness', faceAccessory: 'war_paint' },
  { name: 'Martelo', title: 'Boxeador Clandestino', species: 'human', voicePitch: 0.86, skinColor: '#8d583c', skinShadow: '#5e3521', hairColor: '#111113', eyeColor: '#3b2416', hairStyle: 'bald', facialHair: 'beard', shirtStyle: 'boxing_tank', faceAccessory: 'gold_hoop' },
  { name: 'Elvis da Quebrada', title: 'Rockabilly Brigão', species: 'human', voicePitch: 0.99, skinColor: '#eab896', skinShadow: '#bd8562', hairColor: '#18181b', eyeColor: '#0284c7', hairStyle: 'pompadour', facialHair: 'handlebar', shirtStyle: 'leather_punk', faceAccessory: 'sunglasses' },
  { name: 'Dante Rastafari', title: 'Lutador de Rua', species: 'human', voicePitch: 0.92, skinColor: '#74442b', skinShadow: '#4a2818', hairColor: '#1c140e', eyeColor: '#713f12', hairStyle: 'dreads', facialHair: 'goatee', shirtStyle: 'hoodie_street', faceAccessory: 'bandaid_nose' },
  { name: 'Tank Silveira', title: 'Segurança de Boate', species: 'human', voicePitch: 0.81, skinColor: '#dfa684', skinShadow: '#b07654', hairColor: '#52525b', eyeColor: '#475569', hairStyle: 'buzz', facialHair: 'handlebar', shirtStyle: 'bouncer_polo', faceAccessory: 'sunglasses' },

  // Níveis 11-19 (Antes do John Wick)
  { name: 'Detento 404', title: 'Presidiário da Solitária', species: 'human', voicePitch: 0.94, skinColor: '#d49a79', skinShadow: '#9f684a', hairColor: '#27272a', eyeColor: '#3f3f46', hairStyle: 'buzz', facialHair: 'stubble', shirtStyle: 'prison_orange', faceAccessory: 'face_tats', hasScar: true },
  { name: 'Sardinhas', title: 'Ruivo Explosivo', species: 'human', voicePitch: 1.09, skinColor: '#f2c1a7', skinShadow: '#c78c6f', hairColor: '#b45309', eyeColor: '#16a34a', hairStyle: 'spiky', facialHair: 'none', shirtStyle: 'flannel_open', faceAccessory: 'freckles' },
  { name: 'Kragmar Glacial', title: 'Neandertal da Tundra', species: 'neanderthal', visualVariant: 'tundra', voicePitch: 0.78, skinColor: '#c9a18d', skinShadow: '#916a57', hairColor: '#7c341d', eyeColor: '#38bdf8', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'war_pelt', faceAccessory: 'war_paint' },
  { name: 'Mestre Kenji', title: 'Ronin Expulso', species: 'human', voicePitch: 0.88, skinColor: '#e4b894', skinShadow: '#b38562', hairColor: '#18181b', eyeColor: '#292524', hairStyle: 'slick_back', facialHair: 'goatee', shirtStyle: 'samurai_gi', faceAccessory: 'none', hasScar: true },
  { name: 'Tião Graxa', title: 'Mecânico de Ferro-Velho', species: 'human', voicePitch: 0.9, skinColor: '#c78c68', skinShadow: '#965d3d', hairColor: '#3f3f46', eyeColor: '#57534e', hairStyle: 'pompadour', facialHair: 'stubble', shirtStyle: 'mechanic_overall', faceAccessory: 'goggles' },
  { name: 'Don Pellegrini', title: 'Capo da Máfia', species: 'human', voicePitch: 0.85, skinColor: '#dfaf8e', skinShadow: '#a87858', hairColor: '#71717a', eyeColor: '#475569', hairStyle: 'slick_back', facialHair: 'handlebar', shirtStyle: 'mafia_suit', faceAccessory: 'monocle' },
  { name: 'Açougueiro', title: 'Carrasco da Arena', species: 'human', voicePitch: 0.79, skinColor: '#b97f62', skinShadow: '#885339', hairColor: '#27272a', eyeColor: '#7f1d1d', hairStyle: 'bald', facialHair: 'beard', shirtStyle: 'butcher_apron', faceAccessory: 'none', hasScar: true },
  { name: 'Diablo Loco', title: 'Chefe de Gangue', species: 'human', voicePitch: 0.97, skinColor: '#c5835c', skinShadow: '#915635', hairColor: '#18181b', eyeColor: '#451a03', hairStyle: 'bandana_gang', facialHair: 'goatee', shirtStyle: 'hoodie_street', faceAccessory: 'face_tats' },
  { name: 'Titã Primordial', title: 'Colosso de Carne', species: 'titan', voicePitch: 0.71, skinColor: '#d1b9a7', skinShadow: '#977b68', hairColor: '#27201e', eyeColor: '#f59e0b', hairStyle: 'wild', facialHair: 'none', shirtStyle: 'titan_wraps', faceAccessory: 'none' },

  // Níveis 21-29 (Antes do Kratos)
  { name: 'Barba Negra Jr.', title: 'Contrabandista do Cais', species: 'human', voicePitch: 0.84, skinColor: '#b97c56', skinShadow: '#854f30', hairColor: '#171717', eyeColor: '#78350f', hairStyle: 'dreads', facialHair: 'beard', shirtStyle: 'flannel_open', faceAccessory: 'eyepatch_l' },
  { name: 'Viper-X', title: 'Caçador Cibernético', species: 'human', voicePitch: 0.87, skinColor: '#adb5bd', skinShadow: '#6c757d', hairColor: '#06b6d4', eyeColor: '#22d3ee', hairStyle: 'spiky', facialHair: 'none', shirtStyle: 'cyber_collar', faceAccessory: 'visor', hasCyberEye: true },
  { name: 'Gorgoroth', title: 'Ciclope das Minas', species: 'cyclops', visualVariant: 'mine', voicePitch: 0.72, skinColor: '#7b7887', skinShadow: '#4c4957', hairColor: '#18181b', eyeColor: '#facc15', hairStyle: 'mohawk', facialHair: 'goatee', shirtStyle: 'barbarian_plate', faceAccessory: 'gold_hoop' },
  { name: 'Bola Oito', title: 'Gigante do Submundo', species: 'human', voicePitch: 0.77, skinColor: '#5c3828', skinShadow: '#382016', hairColor: '#111111', eyeColor: '#3f2818', hairStyle: 'afro', facialHair: 'beard', shirtStyle: 'bouncer_polo', faceAccessory: 'sunglasses' },
  { name: 'Zangão', title: 'Motociclista Fora-da-Lei', species: 'human', voicePitch: 0.91, skinColor: '#d89b78', skinShadow: '#a36848', hairColor: '#92400e', eyeColor: '#15803d', hairStyle: 'bandana_gang', facialHair: 'handlebar', shirtStyle: 'leather_punk', faceAccessory: 'eyepatch_r' },
  { name: 'Trok das Cinzas', title: 'Neandertal Vulcânico', species: 'neanderthal', visualVariant: 'crimson', voicePitch: 0.75, skinColor: '#9e6250', skinShadow: '#6b3a2c', hairColor: '#450a0a', eyeColor: '#ef4444', hairStyle: 'mohawk', facialHair: 'beard', shirtStyle: 'war_pelt', faceAccessory: 'war_paint' },
  { name: 'Kuroi', title: 'Yakuza de Elite', species: 'human', voicePitch: 0.89, skinColor: '#e6be9a', skinShadow: '#b58a66', hairColor: '#09090b', eyeColor: '#1c1917', hairStyle: 'slick_back', facialHair: 'none', shirtStyle: 'mafia_suit', faceAccessory: 'face_tats', hasScar: true },
  { name: 'Soldado Chrome', title: 'Mercenário Blindado', species: 'human', voicePitch: 0.78, skinColor: '#9ca3af', skinShadow: '#636a75', hairColor: '#dc2626', eyeColor: '#ef4444', hairStyle: 'helmet', facialHair: 'none', shirtStyle: 'tactical_vest', faceAccessory: 'none', hasCyberEye: true, hasMetalJaw: true },
  { name: 'Golias Rubro', title: 'Titã Carmesim', species: 'titan', visualVariant: 'crimson', voicePitch: 0.7, skinColor: '#b55748', skinShadow: '#7b2f24', hairColor: '#181010', eyeColor: '#fbbf24', hairStyle: 'bald', facialHair: 'none', shirtStyle: 'titan_chains', faceAccessory: 'none', hasScar: true },

  // Níveis 31-39 (Antes do T-800)
  { name: 'Rico Suave', title: 'Gângster de Cassino', species: 'human', voicePitch: 0.98, skinColor: '#d99e78', skinShadow: '#a66d4a', hairColor: '#1f1a17', eyeColor: '#65a30d', hairStyle: 'pompadour', facialHair: 'stubble', shirtStyle: 'mafia_suit', faceAccessory: 'gold_hoop' },
  { name: 'Chacal', title: 'Saqueador do Deserto', species: 'human', voicePitch: 1.03, skinColor: '#c4895e', skinShadow: '#8f5a36', hairColor: '#eab308', eyeColor: '#b45309', hairStyle: 'spiky', facialHair: 'goatee', shirtStyle: 'ogre_harness', faceAccessory: 'goggles', hasScar: true },
  { name: 'Uruk-Bruto', title: 'Ogro Ciclope Blindado', species: 'cyclops', visualVariant: 'mine', voicePitch: 0.73, skinColor: '#6b7d65', skinShadow: '#42503e', hairColor: '#27272a', eyeColor: '#f97316', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'barbarian_plate', faceAccessory: 'war_paint' },
  { name: 'Lobo Cinzento', title: 'Veterano de Trincheira', species: 'human', voicePitch: 0.8, skinColor: '#cfa082', skinShadow: '#996d52', hairColor: '#94a3b8', eyeColor: '#0ea5e9', hairStyle: 'buzz', facialHair: 'beard', shirtStyle: 'tactical_vest', faceAccessory: 'eyepatch_l', hasScar: true },
  { name: 'Faisca Neon', title: 'Hacker de Arena', species: 'human', voicePitch: 1.06, skinColor: '#e5baa2', skinShadow: '#b5866d', hairColor: '#a855f7', eyeColor: '#e879f9', hairStyle: 'mohawk', facialHair: 'none', shirtStyle: 'cyber_collar', faceAccessory: 'visor' },
  { name: 'Bamba', title: 'Campeão Peso-Pesado', species: 'human', voicePitch: 0.79, skinColor: '#6e412b', skinShadow: '#472617', hairColor: '#18181b', eyeColor: '#451a03', hairStyle: 'buzz', facialHair: 'handlebar', shirtStyle: 'boxing_tank', faceAccessory: 'bandaid_nose' },
  { name: 'Drago', title: 'Lutador Soviético', species: 'human', voicePitch: 0.81, skinColor: '#e8c4b0', skinShadow: '#b88f7a', hairColor: '#facc15', eyeColor: '#38bdf8', hairStyle: 'short', facialHair: 'none', shirtStyle: 'boxing_tank', faceAccessory: 'none', hasScar: true },
  { name: 'Kael das Cavernas', title: 'Xamã Neandertal', species: 'neanderthal', visualVariant: 'tundra', voicePitch: 0.81, skinColor: '#b88c74', skinShadow: '#855c47', hairColor: '#d4d4d8', eyeColor: '#22d3ee', hairStyle: 'dreads', facialHair: 'beard', shirtStyle: 'war_pelt', faceAccessory: 'war_paint' },
  { name: 'Titã Ômega', title: 'Colosso de Titânio', species: 'human', voicePitch: 0.73, skinColor: '#71717a', skinShadow: '#3f3f46', hairColor: '#f59e0b', eyeColor: '#f59e0b', hairStyle: 'helmet', facialHair: 'none', shirtStyle: 'titanium_armor', faceAccessory: 'none', hasCyberEye: true, hasMetalJaw: true },

  // Níveis 41-49 (Antes do Wolverine)
  { name: 'Corvo', title: 'Assassino de Aluguel', species: 'human', voicePitch: 0.9, skinColor: '#d7b29c', skinShadow: '#a37a62', hairColor: '#111827', eyeColor: '#64748b', hairStyle: 'slick_back', facialHair: 'stubble', shirtStyle: 'bouncer_polo', faceAccessory: 'sunglasses' },
  { name: 'Pólvora', title: 'Pirata de Carga', species: 'human', voicePitch: 0.88, skinColor: '#b57b56', skinShadow: '#824f31', hairColor: '#7c2d12', eyeColor: '#ca8a04', hairStyle: 'bandana_gang', facialHair: 'beard', shirtStyle: 'prison_orange', faceAccessory: 'eyepatch_r' },
  { name: 'Korgath', title: 'Titã das Profundezas', species: 'titan', voicePitch: 0.69, skinColor: '#7d8a96', skinShadow: '#49535e', hairColor: '#0f172a', eyeColor: '#ef4444', hairStyle: 'bald', facialHair: 'none', shirtStyle: 'titan_chains', faceAccessory: 'war_paint' },
  { name: 'Ginga', title: 'Mestre de Capoeira', species: 'human', voicePitch: 0.95, skinColor: '#7c482e', skinShadow: '#522c19', hairColor: '#18181b', eyeColor: '#451a03', hairStyle: 'dreads', facialHair: 'stubble', shirtStyle: 'tshirt_casual', faceAccessory: 'gold_hoop' },
  { name: 'Doutor Solda', title: 'Forjador Insano', species: 'human', voicePitch: 0.86, skinColor: '#c99374', skinShadow: '#966144', hairColor: '#57534e', eyeColor: '#f59e0b', hairStyle: 'bald', facialHair: 'handlebar', shirtStyle: 'mechanic_overall', faceAccessory: 'goggles', hasMetalJaw: true },
  { name: 'Takeda', title: 'Samurai Renegado', species: 'human', voicePitch: 0.85, skinColor: '#dfba98', skinShadow: '#ad8461', hairColor: '#27272a', eyeColor: '#1c1917', hairStyle: 'spiky', facialHair: 'goatee', shirtStyle: 'samurai_gi', faceAccessory: 'none', hasScar: true },
  { name: 'Polifemo', title: 'Ciclope Devorador', species: 'cyclops', voicePitch: 0.74, skinColor: '#6a8254', skinShadow: '#415231', hairColor: '#3f2e18', eyeColor: '#dc2626', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'ogre_harness', faceAccessory: 'none', hasScar: true },
  { name: 'Cobra Kai', title: 'Líder de Dojo Clandestino', species: 'human', voicePitch: 0.93, skinColor: '#e0ae8b', skinShadow: '#b07b58', hairColor: '#ca8a04', eyeColor: '#0284c7', hairStyle: 'pompadour', facialHair: 'none', shirtStyle: 'samurai_gi', faceAccessory: 'sunglasses' },
  { name: 'Kraken V-8', title: 'Exterminador Ciborgue', species: 'human', voicePitch: 0.76, skinColor: '#9ca3af', skinShadow: '#525866', hairColor: '#dc2626', eyeColor: '#ef4444', hairStyle: 'buzz', facialHair: 'none', shirtStyle: 'titanium_armor', faceAccessory: 'visor', hasCyberEye: true, hasMetalJaw: true },

  // Níveis 51-59 (Antes do Geralt de Rívia)
  { name: 'Bicho Solto', title: 'Detento Rebelde', species: 'human', voicePitch: 0.99, skinColor: '#d1926c', skinShadow: '#9e623f', hairColor: '#18181b', eyeColor: '#713f12', hairStyle: 'mohawk', facialHair: 'stubble', shirtStyle: 'prison_orange', faceAccessory: 'bandaid_nose' },
  { name: 'Lord Cavendish', title: 'Boxeador Aristocrata', species: 'human', voicePitch: 0.91, skinColor: '#f0c7b1', skinShadow: '#bf9078', hairColor: '#78350f', eyeColor: '#2563eb', hairStyle: 'slick_back', facialHair: 'handlebar', shirtStyle: 'mafia_suit', faceAccessory: 'monocle' },
  { name: 'Garm Mamute', title: 'Neandertal Alfa', species: 'neanderthal', voicePitch: 0.77, skinColor: '#b37a56', skinShadow: '#7d4d30', hairColor: '#1c140d', eyeColor: '#a16207', hairStyle: 'afro', facialHair: 'beard', shirtStyle: 'pelt_fur', faceAccessory: 'war_paint' },
  { name: 'Spike Zero', title: 'Anarquista Urbano', species: 'human', voicePitch: 1.04, skinColor: '#dfb196', skinShadow: '#ad7c60', hairColor: '#22c55e', eyeColor: '#16a34a', hairStyle: 'spiky', facialHair: 'none', shirtStyle: 'leather_punk', faceAccessory: 'face_tats' },
  { name: 'Magma', title: 'Titã Vulcânico', species: 'titan', visualVariant: 'crimson', voicePitch: 0.69, skinColor: '#9c4338', skinShadow: '#5e1f18', hairColor: '#f97316', eyeColor: '#facc15', hairStyle: 'spiky', facialHair: 'none', shirtStyle: 'titan_chains', faceAccessory: 'none', hasScar: true },
  { name: 'Sargento Ferro', title: 'Comando de Choque', species: 'human', voicePitch: 0.8, skinColor: '#b57b5b', skinShadow: '#824f34', hairColor: '#3f3f46', eyeColor: '#475569', hairStyle: 'buzz', facialHair: 'stubble', shirtStyle: 'tactical_vest', faceAccessory: 'sunglasses', hasMetalJaw: true },
  { name: 'Machete', title: 'Mercenário da Fronteira', species: 'human', voicePitch: 0.84, skinColor: '#b8764d', skinShadow: '#824c2b', hairColor: '#18181b', eyeColor: '#292524', hairStyle: 'wild', facialHair: 'handlebar', shirtStyle: 'butcher_apron', faceAccessory: 'face_tats', hasScar: true },
  { name: 'Balor', title: 'Ciclope do Olho Flamejante', species: 'cyclops', visualVariant: 'crimson', voicePitch: 0.71, skinColor: '#8c534b', skinShadow: '#592e28', hairColor: '#18181b', eyeColor: '#ef4444', hairStyle: 'bald', facialHair: 'goatee', shirtStyle: 'barbarian_plate', faceAccessory: 'war_paint' },
  { name: 'Blindado X-9', title: 'Juggernaut de Aço', species: 'human', voicePitch: 0.74, skinColor: '#8f96a3', skinShadow: '#525866', hairColor: '#38bdf8', eyeColor: '#38bdf8', hairStyle: 'helmet', facialHair: 'none', shirtStyle: 'titanium_armor', faceAccessory: 'none', hasCyberEye: true, hasMetalJaw: true },

  // Níveis 61-69 (Antes do Coringa)
  { name: 'Sombra', title: 'Ninja do Submundo', species: 'human', voicePitch: 0.94, skinColor: '#d9b196', skinShadow: '#a67b5e', hairColor: '#09090b', eyeColor: '#dc2626', hairStyle: 'bandana_gang', facialHair: 'none', shirtStyle: 'samurai_gi', faceAccessory: 'eyepatch_l' },
  { name: 'Disco Inferno', title: 'Brigão dos Anos 70', species: 'human', voicePitch: 0.96, skinColor: '#7a492e', skinShadow: '#4f2b18', hairColor: '#1c140d', eyeColor: '#ca8a04', hairStyle: 'afro', facialHair: 'handlebar', shirtStyle: 'flannel_open', faceAccessory: 'sunglasses' },
  { name: 'Torvak', title: 'Neandertal da Nevasca', species: 'neanderthal', visualVariant: 'tundra', voicePitch: 0.76, skinColor: '#c4a69b', skinShadow: '#8a6b60', hairColor: '#f1f5f9', eyeColor: '#0284c7', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'war_pelt', faceAccessory: 'none', hasScar: true },
  { name: 'Cyborg Zero', title: 'Unidade Tática', species: 'human', voicePitch: 0.79, skinColor: '#cbd5e1', skinShadow: '#64748b', hairColor: '#0ea5e9', eyeColor: '#22d3ee', hairStyle: 'slick_back', facialHair: 'none', shirtStyle: 'cyber_collar', faceAccessory: 'visor', hasCyberEye: true },
  { name: 'Caronte', title: 'Titã Esquecido', species: 'titan', voicePitch: 0.7, skinColor: '#9c9288', skinShadow: '#61584f', hairColor: '#e2e8f0', eyeColor: '#f59e0b', hairStyle: 'dreads', facialHair: 'beard', shirtStyle: 'titan_wraps', faceAccessory: 'war_paint' },
  { name: 'Capataz Bruto', title: 'Chefe das Docas', species: 'human', voicePitch: 0.83, skinColor: '#c98e6b', skinShadow: '#965d3d', hairColor: '#52525b', eyeColor: '#3f3f46', hairStyle: 'short', facialHair: 'beard', shirtStyle: 'mechanic_overall', faceAccessory: 'gold_hoop' },
  { name: 'Argus', title: 'Ciclope Gladiador', species: 'cyclops', voicePitch: 0.73, skinColor: '#7f9468', skinShadow: '#4f613c', hairColor: '#292524', eyeColor: '#facc15', hairStyle: 'helmet', facialHair: 'none', shirtStyle: 'barbarian_plate', faceAccessory: 'none', hasScar: true },
  { name: 'Vingador Urbano', title: 'Justiceiro Sombrio', species: 'human', voicePitch: 0.85, skinColor: '#deb298', skinShadow: '#ab7c62', hairColor: '#18181b', eyeColor: '#334155', hairStyle: 'short', facialHair: 'stubble', shirtStyle: 'tactical_vest', faceAccessory: 'none', hasScar: true },
  { name: 'Moloch', title: 'Demônio da Forja', species: 'titan', visualVariant: 'crimson', voicePitch: 0.69, skinColor: '#a63f35', skinShadow: '#631d17', hairColor: '#181010', eyeColor: '#fb923c', hairStyle: 'mohawk', facialHair: 'goatee', shirtStyle: 'titan_chains', faceAccessory: 'goggles', hasMetalJaw: true },

  // Níveis 71-79 (Antes do Thanos)
  { name: 'Al Capone Jr.', title: 'Chefão do Sindicato', species: 'human', voicePitch: 0.84, skinColor: '#deb395', skinShadow: '#ab7d5f', hairColor: '#27272a', eyeColor: '#475569', hairStyle: 'slick_back', facialHair: 'none', shirtStyle: 'mafia_suit', faceAccessory: 'monocle', hasScar: true },
  { name: 'Rotten', title: 'Punk Psicótico', species: 'human', voicePitch: 1.05, skinColor: '#d9bfa9', skinShadow: '#a38770', hairColor: '#ec4899', eyeColor: '#10b981', hairStyle: 'mohawk', facialHair: 'none', shirtStyle: 'leather_punk', faceAccessory: 'face_tats' },
  { name: 'Gorgon das Rochas', title: 'Ciclope Titânico', species: 'cyclops', visualVariant: 'mine', voicePitch: 0.71, skinColor: '#707380', skinShadow: '#434652', hairColor: '#09090b', eyeColor: '#38bdf8', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'ogre_harness', faceAccessory: 'war_paint' },
  { name: 'Ares Cibernético', title: 'Androide de Combate', species: 'human', voicePitch: 0.77, skinColor: '#94a3b8', skinShadow: '#475569', hairColor: '#ef4444', eyeColor: '#ef4444', hairStyle: 'spiky', facialHair: 'none', shirtStyle: 'cyber_collar', faceAccessory: 'visor', hasCyberEye: true, hasMetalJaw: true },
  { name: 'Bárbaro Ossudo', title: 'Neandertal Imortal', species: 'neanderthal', voicePitch: 0.78, skinColor: '#a87556', skinShadow: '#734830', hairColor: '#27201c', eyeColor: '#f59e0b', hairStyle: 'dreads', facialHair: 'beard', shirtStyle: 'pelt_fur', faceAccessory: 'eyepatch_l' },
  { name: 'Carniceiro', title: 'Cirurgião Clandestino', species: 'human', voicePitch: 0.87, skinColor: '#cbb0a1', skinShadow: '#967969', hairColor: '#52525b', eyeColor: '#dc2626', hairStyle: 'bald', facialHair: 'goatee', shirtStyle: 'butcher_apron', faceAccessory: 'goggles' },
  { name: 'Atlas Quebrado', title: 'Titã Acorrentado', species: 'titan', voicePitch: 0.7, skinColor: '#c2b0a3', skinShadow: '#877467', hairColor: '#3f3f46', eyeColor: '#fbbf24', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'titan_chains', faceAccessory: 'none', hasScar: true },
  { name: 'Fera da Jaula', title: 'Campeão Sem Regras', species: 'human', voicePitch: 0.81, skinColor: '#8c5539', skinShadow: '#5c331e', hairColor: '#18181b', eyeColor: '#78350f', hairStyle: 'buzz', facialHair: 'beard', shirtStyle: 'boxing_tank', faceAccessory: 'face_tats' },
  { name: 'Valquíria Ferro', title: 'Executor Orbital', species: 'human', voicePitch: 0.74, skinColor: '#71717a', skinShadow: '#3f3f46', hairColor: '#facc15', eyeColor: '#22d3ee', hairStyle: 'helmet', facialHair: 'none', shirtStyle: 'titanium_armor', faceAccessory: 'none', hasCyberEye: true, hasMetalJaw: true },

  // Níveis 81-89 (Antes do Boss Final Arthur Morgan)
  { name: 'Cascavel', title: 'Pistoleiro da Fronteira', species: 'human', voicePitch: 0.86, skinColor: '#cf936d', skinShadow: '#995f3c', hairColor: '#3f2818', eyeColor: '#a16207', hairStyle: 'bandana_gang', facialHair: 'handlebar', shirtStyle: 'flannel_open', faceAccessory: 'eyepatch_r', hasScar: true },
  { name: 'Kenshin Negro', title: 'Espadachim Sombrio', species: 'human', voicePitch: 0.88, skinColor: '#e2ba9a', skinShadow: '#ad8262', hairColor: '#09090b', eyeColor: '#ef4444', hairStyle: 'slick_back', facialHair: 'none', shirtStyle: 'samurai_gi', faceAccessory: 'none', hasScar: true },
  { name: 'Cronos', title: 'Titã Devorador de Deuses', species: 'titan', visualVariant: 'crimson', voicePitch: 0.69, skinColor: '#8e3d38', skinShadow: '#541b18', hairColor: '#e2e8f0', eyeColor: '#facc15', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'titan_wraps', faceAccessory: 'war_paint' },
  { name: 'Ciclope Abissal', title: 'Guardião do Abismo', species: 'cyclops', visualVariant: 'mine', voicePitch: 0.71, skinColor: '#5c6678', skinShadow: '#343b47', hairColor: '#18181b', eyeColor: '#22d3ee', hairStyle: 'mohawk', facialHair: 'goatee', shirtStyle: 'barbarian_plate', faceAccessory: 'none', hasMetalJaw: true },
  { name: 'Presidiário X', title: 'Monstro de Segurança Máxima', species: 'human', voicePitch: 0.79, skinColor: '#b87f60', skinShadow: '#824f35', hairColor: '#18181b', eyeColor: '#451a03', hairStyle: 'bald', facialHair: 'beard', shirtStyle: 'prison_orange', faceAccessory: 'face_tats', hasMetalJaw: true },
  { name: 'Berseker do Norte', title: 'Neandertal Supremo', species: 'neanderthal', visualVariant: 'tundra', voicePitch: 0.75, skinColor: '#c7a495', skinShadow: '#8c6a5c', hairColor: '#b91c1c', eyeColor: '#38bdf8', hairStyle: 'wild', facialHair: 'beard', shirtStyle: 'war_pelt', faceAccessory: 'war_paint', hasScar: true },
  { name: 'Mafia Don Carlo', title: 'Senhor do Cartel', species: 'human', voicePitch: 0.82, skinColor: '#d9a482', skinShadow: '#a36e4d', hairColor: '#a1a1aa', eyeColor: '#334155', hairStyle: 'pompadour', facialHair: 'handlebar', shirtStyle: 'mafia_suit', faceAccessory: 'sunglasses' },
  { name: 'Exterminador Z-99', title: 'Protótipo de Titânio', species: 'human', voicePitch: 0.73, skinColor: '#64748b', skinShadow: '#334155', hairColor: '#38bdf8', eyeColor: '#ef4444', hairStyle: 'helmet', facialHair: 'none', shirtStyle: 'titanium_armor', faceAccessory: 'visor', hasCyberEye: true, hasMetalJaw: true },
  { name: 'Cavaleiro Rubro', title: 'Braço Direito de Arthur', species: 'human', voicePitch: 0.78, skinColor: '#d49672', skinShadow: '#9b603f', hairColor: '#271a12', eyeColor: '#b45309', hairStyle: 'short', facialHair: 'beard', shirtStyle: 'tactical_vest', faceAccessory: 'eyepatch_l', hasScar: true },
];

interface BossArchetype extends EnemyArchetype {
  bossId: BossId;
  bossOrigin: string;
}

// Iconic movie & game bosses appearing every 10 levels (10, 20, 30, 40...)
export const BOSS_ROSTER: BossArchetype[] = [
  {
    bossId: 'trevor_gta5',
    bossOrigin: 'Grand Theft Auto V',
    name: 'Trevor Philips',
    title: 'Psicopata de Blaine County · GTA V',
    species: 'human',
    voicePitch: 0.94,
    skinColor: '#dba282',
    skinShadow: '#a36549',
    hairColor: '#2b1e16',
    hairStyle: 'trevor_receding',
    facialHair: 'stubble',
    shirtStyle: 'trevor_tee',
    hasScar: true,
  },
  {
    bossId: 'john_wick',
    bossOrigin: 'John Wick',
    name: 'John Wick',
    title: 'Baba Yaga · Assassino Lendário',
    species: 'human',
    voicePitch: 0.86,
    skinColor: '#dfb99f',
    skinShadow: '#aa7d62',
    hairColor: '#121215',
    hairStyle: 'john_wick',
    facialHair: 'beard',
    shirtStyle: 'continental_suit',
    hasScar: false,
  },
  {
    bossId: 'kratos',
    bossOrigin: 'God of War',
    name: 'Kratos',
    title: 'Fantasma de Esparta · Deus da Guerra',
    species: 'human',
    voicePitch: 0.71,
    skinColor: '#cfd5dd',
    skinShadow: '#818b98',
    hairColor: '#1a1613',
    hairStyle: 'bald',
    facialHair: 'beard',
    shirtStyle: 'spartan_armor',
    hasScar: true,
  },
  {
    bossId: 't800',
    bossOrigin: 'O Exterminador do Futuro',
    name: 'T-800 Exterminador',
    title: 'Ciborgue Infiltrador · Skynet',
    species: 'human',
    voicePitch: 0.76,
    skinColor: '#d1ac92',
    skinShadow: '#997057',
    hairColor: '#27201b',
    hairStyle: 't800_flattop',
    facialHair: 'none',
    shirtStyle: 'biker_jacket',
    hasCyberEye: true,
    hasScar: true,
  },
  {
    bossId: 'wolverine',
    bossOrigin: 'X-Men',
    name: 'Wolverine (Logan)',
    title: 'Arma X · Mutante Selvagem',
    species: 'human',
    voicePitch: 0.8,
    skinColor: '#ddb08e',
    skinShadow: '#a67452',
    hairColor: '#1a1715',
    hairStyle: 'wolverine_wings',
    facialHair: 'beard',
    shirtStyle: 'mutant_suit',
    hasScar: true,
  },
  {
    bossId: 'geralt',
    bossOrigin: 'The Witcher',
    name: 'Geralt de Rívia',
    title: 'Lobo Branco · Bruxo Mutante',
    species: 'human',
    voicePitch: 0.82,
    skinColor: '#d5cdc5',
    skinShadow: '#9e948b',
    hairColor: '#e2e8f0',
    hairStyle: 'geralt_witcher',
    facialHair: 'beard',
    shirtStyle: 'witcher_armor',
    hasScar: true,
  },
  {
    bossId: 'joker',
    bossOrigin: 'Batman',
    name: 'Coringa',
    title: 'Príncipe Palhaço do Crime',
    species: 'human',
    voicePitch: 1.04,
    skinColor: '#e8edf2',
    skinShadow: '#b8c0c9',
    hairColor: '#2d6a22',
    hairStyle: 'joker_curls',
    facialHair: 'none',
    shirtStyle: 'joker_suit',
    hasScar: false,
  },
  {
    bossId: 'thanos',
    bossOrigin: 'Vingadores',
    name: 'Thanos',
    title: 'O Titã Louco · Joias do Infinito',
    species: 'titan',
    voicePitch: 0.69,
    skinColor: '#8863aa',
    skinShadow: '#4f2c73',
    hairColor: '#1e1b4b',
    hairStyle: 'bald',
    facialHair: 'none',
    shirtStyle: 'infinity_plate',
    hasScar: true,
  },
  {
    bossId: 'arthur_morgan',
    bossOrigin: 'Red Dead Redemption 2',
    name: 'Arthur Morgan',
    title: 'Pistoleiro Lendário · Gangue Van der Linde',
    species: 'human',
    voicePitch: 0.78,
    skinColor: '#d9a07a',
    skinShadow: '#9b603f',
    hairColor: '#5c3d22',
    hairStyle: 'arthur_outlaw',
    facialHair: 'beard',
    shirtStyle: 'arthur_coat',
    hasScar: true,
  },
];

export interface MiniBossArchetype extends EnemyArchetype {
  miniBossId: MiniBossId;
  miniBossOrigin: string;
}

// Famous Brazilian YouTuber mini-bosses appearing every 10 levels starting at level 5 (5, 15, 25, 35, 45, 55, 65, 75, 85)
export const MINI_BOSS_ROSTER: MiniBossArchetype[] = [
  {
    miniBossId: 'davy_jones',
    miniBossOrigin: 'Gameplay RJ · YouTube',
    name: 'Davy Jones',
    title: 'O Mago dos Games · Velho Testamento',
    species: 'human',
    voicePitch: 0.96,
    skinColor: '#e3b597',
    skinShadow: '#b07e5f',
    hairColor: '#211711',
    eyeColor: '#3f2819',
    hairStyle: 'short',
    facialHair: 'stubble',
    shirtStyle: 'hoodie_street',
    hasScar: false,
  },
  {
    miniBossId: 'felipe_neto',
    miniBossOrigin: 'Não Faz Sentido · YouTube',
    name: 'Felipe Neto',
    title: 'Não Faz Sentido · 2010',
    species: 'human',
    voicePitch: 1.03,
    skinColor: '#f1cab2',
    skinShadow: '#bf8f72',
    hairColor: '#332014',
    eyeColor: '#523420',
    hairStyle: 'short',
    facialHair: 'none',
    shirtStyle: 'leather_punk',
    hasScar: false,
  },
  {
    miniBossId: 'whindersson',
    miniBossOrigin: 'Whindersson Nunes · YouTube',
    name: 'Whindersson Nunes',
    title: 'O Maior do Piauí',
    species: 'human',
    voicePitch: 1.01,
    skinColor: '#d29971',
    skinShadow: '#99603a',
    hairColor: '#191411',
    eyeColor: '#3b2416',
    hairStyle: 'short',
    facialHair: 'stubble',
    shirtStyle: 'boxing_tank',
    hasScar: false,
  },
  {
    miniBossId: 'kleberiano',
    miniBossOrigin: 'Kleberiano · YouTube',
    name: 'Kleberiano',
    title: 'O Calvo de Óculos',
    species: 'human',
    voicePitch: 1.02,
    skinColor: '#ecc2a6',
    skinShadow: '#b78566',
    hairColor: '#211814',
    eyeColor: '#452b1b',
    hairStyle: 'short',
    facialHair: 'stubble',
    shirtStyle: 'hoodie_street',
    hasScar: false,
  },
  {
    miniBossId: 'alanzoka',
    miniBossOrigin: 'Alanzoka · Live & YouTube',
    name: 'Alanzoka',
    title: 'Top 1 do Brasil',
    species: 'human',
    voicePitch: 1.04,
    skinColor: '#efc9b2',
    skinShadow: '#bc8c6f',
    hairColor: '#3c2718',
    eyeColor: '#452c1c',
    hairStyle: 'short',
    facialHair: 'none',
    shirtStyle: 'hoodie_street',
    hasScar: false,
  },
  {
    miniBossId: 'casimiro',
    miniBossOrigin: 'CazéTV · YouTube',
    name: 'Casimiro',
    title: 'O Rei do React · Meteu Essa?',
    species: 'human',
    voicePitch: 0.9,
    skinColor: '#e5b696',
    skinShadow: '#b17e5c',
    hairColor: '#1c1512',
    eyeColor: '#3a2215',
    hairStyle: 'short',
    facialHair: 'beard',
    shirtStyle: 'tshirt_casual',
    hasScar: false,
  },
  {
    miniBossId: 'smzinho',
    miniBossOrigin: 'Smzinho · YouTube',
    name: 'Smzinho',
    title: 'O Azulão da Massa',
    species: 'human',
    voicePitch: 0.87,
    skinColor: '#2890da',
    skinShadow: '#0d4f84',
    hairColor: '#0f172a',
    eyeColor: '#38bdf8',
    hairStyle: 'buzz',
    facialHair: 'beard',
    shirtStyle: 'tshirt_casual',
    hasScar: false,
  },
  {
    miniBossId: 'cellbit',
    miniBossOrigin: 'Cellbit · Ordem Paranormal',
    name: 'Cellbit',
    title: 'Detetive do Enigma',
    species: 'human',
    voicePitch: 0.98,
    skinColor: '#f3d7c6',
    skinShadow: '#c29780',
    hairColor: '#98693c',
    eyeColor: '#2563eb',
    hairStyle: 'short',
    facialHair: 'none',
    shirtStyle: 'leather_punk',
    hasScar: false,
  },
  {
    miniBossId: 'luccas_neto',
    miniBossOrigin: 'Luccas Neto · YouTube',
    name: 'Luccas Neto',
    title: 'A Foca do Gorro Azul',
    species: 'human',
    voicePitch: 1.07,
    skinColor: '#eec2a6',
    skinShadow: '#ba896a',
    hairColor: '#261b15',
    eyeColor: '#442b1a',
    hairStyle: 'short',
    facialHair: 'beard',
    shirtStyle: 'hoodie_street',
    hasScar: false,
  },
];

export interface CreatorModifiers {
  disableCounterAttacks: boolean;
  disableEnemyGuard: boolean;
  disableEnemyRegen: boolean;
  infiniteRage: boolean;
  oneHitKo: boolean;
  damageMultiplier: 1 | 5 | 25 | 100;
}

export interface CreatorEnemyOption {
  key: string;
  label: string;
  subtitle: string;
  isBoss: boolean;
  isMiniBoss?: boolean;
  nativeLevel?: number;
}

export const CREATOR_ENEMY_CATALOG: CreatorEnemyOption[] = [
  ...BOSS_ROSTER.map((boss, idx) => ({
    key: `boss:${boss.bossId}`,
    label: boss.name,
    subtitle: `Nível ${(idx + 1) * 10} · ${boss.bossOrigin}`,
    isBoss: true,
    nativeLevel: (idx + 1) * 10,
  })),
  ...MINI_BOSS_ROSTER.map((mb, idx) => ({
    key: `miniboss:${mb.miniBossId}`,
    label: mb.name,
    subtitle: `Nível ${5 + idx * 10} · ${mb.miniBossOrigin}`,
    isBoss: false,
    isMiniBoss: true,
    nativeLevel: 5 + idx * 10,
  })),
  ...ARCHETYPES.map((arch, idx) => ({
    key: `arch:${idx}`,
    label: arch.name,
    subtitle: arch.title,
    isBoss: false,
  })),
];

export function getEnemyForLevel(level: number, forcedEnemyKey?: string | null): EnemyProfile {
  const clampedLevel = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  const baseMaxHp = Math.round(280 * Math.pow(2.15, clampedLevel - 1));
  const baseArmorPct =
    clampedLevel === 1
      ? 0.12
      : Math.min(0.92, Number((0.12 + (clampedLevel - 1) * 0.075).toFixed(3)));
  const baseRegenPct =
    clampedLevel === 1
      ? 0.005
      : Math.min(0.048, Number((0.014 + (clampedLevel - 2) * 0.004).toFixed(4)));
  const baseKoReward = Math.round(45 * Math.pow(1.52, clampedLevel - 1));
  const baseHitReward = Math.max(1, Math.round(2 * Math.pow(1.38, clampedLevel - 1)));

  if (forcedEnemyKey) {
    if (forcedEnemyKey.startsWith('boss:')) {
      const targetId = forcedEnemyKey.slice(5);
      const boss = BOSS_ROSTER.find((b) => b.bossId === targetId);
      if (boss) {
        const isFinalBoss = boss.bossId === 'arthur_morgan' || clampedLevel === MAX_LEVEL;
        return {
          level: clampedLevel,
          isBoss: true,
          isFinalBoss,
          bossId: boss.bossId,
          bossOrigin: boss.bossOrigin,
          name: boss.name,
          title: isFinalBoss ? `BOSS FINAL · ${boss.title}` : `BOSS · ${boss.title}`,
          species: boss.species,
          visualVariant: boss.visualVariant ?? 'default',
          maxHp: Math.round(baseMaxHp * (isFinalBoss ? 2.15 : 1.75)),
          armorPct: Math.min(0.95, Number((baseArmorPct + (isFinalBoss ? 0.05 : 0.04)).toFixed(3))),
          regenPerSecPct: Math.min(0.058, Number((baseRegenPct * (isFinalBoss ? 1.22 : 1.15)).toFixed(4))),
          koReward: Math.round(baseKoReward * (isFinalBoss ? 4.0 : 3.0)),
          hitRewardBase: Math.max(1, Math.round(baseHitReward * (isFinalBoss ? 2.2 : 1.85))),
          voicePitch: boss.voicePitch,
          skinColor: boss.skinColor,
          skinShadow: boss.skinShadow,
          hairColor: boss.hairColor,
          eyeColor: boss.eyeColor,
          hairStyle: boss.hairStyle,
          facialHair: boss.facialHair,
          shirtStyle: boss.shirtStyle,
          faceAccessory: boss.faceAccessory ?? 'none',
          hasCyberEye: Boolean(boss.hasCyberEye),
          hasMetalJaw: Boolean(boss.hasMetalJaw),
          hasScar: Boolean(boss.hasScar),
        };
      }
    } else if (forcedEnemyKey.startsWith('miniboss:')) {
      const targetId = forcedEnemyKey.slice(9);
      const mb = MINI_BOSS_ROSTER.find((m) => m.miniBossId === targetId);
      if (mb) {
        return {
          level: clampedLevel,
          isBoss: false,
          isFinalBoss: false,
          isMiniBoss: true,
          miniBossId: mb.miniBossId,
          miniBossOrigin: mb.miniBossOrigin,
          name: mb.name,
          title: `MINI-BOSS · ${mb.title}`,
          species: mb.species,
          visualVariant: mb.visualVariant ?? 'default',
          maxHp: Math.round(baseMaxHp * 1.32),
          armorPct: Math.min(0.94, Number((baseArmorPct + 0.02).toFixed(3))),
          regenPerSecPct: Math.min(0.052, Number((baseRegenPct * 1.08).toFixed(4))),
          koReward: Math.round(baseKoReward * 1.85),
          hitRewardBase: Math.max(1, Math.round(baseHitReward * 1.35)),
          voicePitch: mb.voicePitch,
          skinColor: mb.skinColor,
          skinShadow: mb.skinShadow,
          hairColor: mb.hairColor,
          eyeColor: mb.eyeColor,
          hairStyle: mb.hairStyle,
          facialHair: mb.facialHair,
          shirtStyle: mb.shirtStyle,
          faceAccessory: mb.faceAccessory ?? 'none',
          hasCyberEye: Boolean(mb.hasCyberEye),
          hasMetalJaw: Boolean(mb.hasMetalJaw),
          hasScar: Boolean(mb.hasScar),
        };
      }
    } else if (forcedEnemyKey.startsWith('arch:')) {
      const idx = Number(forcedEnemyKey.slice(5));
      const arch = Number.isInteger(idx) ? ARCHETYPES[idx] : undefined;
      if (arch) {
        return {
          level: clampedLevel,
          isBoss: false,
          isFinalBoss: false,
          name: arch.name,
          title: arch.title,
          species: arch.species,
          visualVariant: arch.visualVariant ?? 'default',
          maxHp: baseMaxHp,
          armorPct: baseArmorPct,
          regenPerSecPct: baseRegenPct,
          koReward: baseKoReward,
          hitRewardBase: baseHitReward,
          voicePitch: arch.voicePitch,
          skinColor: arch.skinColor,
          skinShadow: arch.skinShadow,
          hairColor: arch.hairColor,
          eyeColor: arch.eyeColor,
          hairStyle: arch.hairStyle,
          facialHair: arch.facialHair,
          shirtStyle: arch.shirtStyle,
          faceAccessory: arch.faceAccessory ?? 'none',
          hasCyberEye: Boolean(arch.hasCyberEye),
          hasMetalJaw: Boolean(arch.hasMetalJaw),
          hasScar: Boolean(arch.hasScar),
        };
      }
    }
  }

  // Boss spawn every 10 levels (10, 20, 30, ..., 90 Final Boss)
  if (clampedLevel >= 10 && clampedLevel % 10 === 0) {
    const bossIndex = Math.floor(clampedLevel / 10) - 1;
    const boss = BOSS_ROSTER[bossIndex % BOSS_ROSTER.length];
    const isFinalBoss = clampedLevel === MAX_LEVEL;

    return {
      level: clampedLevel,
      isBoss: true,
      isFinalBoss,
      bossId: boss.bossId,
      bossOrigin: boss.bossOrigin,
      name: boss.name,
      title: isFinalBoss ? `BOSS FINAL · ${boss.title}` : `BOSS · ${boss.title}`,
      species: boss.species,
      visualVariant: boss.visualVariant ?? 'default',
      maxHp: Math.round(baseMaxHp * (isFinalBoss ? 2.15 : 1.75)),
      armorPct: Math.min(0.95, Number((baseArmorPct + (isFinalBoss ? 0.05 : 0.04)).toFixed(3))),
      regenPerSecPct: Math.min(0.058, Number((baseRegenPct * (isFinalBoss ? 1.22 : 1.15)).toFixed(4))),
      koReward: Math.round(baseKoReward * (isFinalBoss ? 4.0 : 3.0)),
      hitRewardBase: Math.max(1, Math.round(baseHitReward * (isFinalBoss ? 2.2 : 1.85))),
      voicePitch: boss.voicePitch,
      skinColor: boss.skinColor,
      skinShadow: boss.skinShadow,
      hairColor: boss.hairColor,
      eyeColor: boss.eyeColor,
      hairStyle: boss.hairStyle,
      facialHair: boss.facialHair,
      shirtStyle: boss.shirtStyle,
      faceAccessory: boss.faceAccessory ?? 'none',
      hasCyberEye: Boolean(boss.hasCyberEye),
      hasMetalJaw: Boolean(boss.hasMetalJaw),
      hasScar: Boolean(boss.hasScar),
    };
  }

  // YouTuber Mini-Boss spawn on levels ending in 5 (5, 15, 25, 35, 45, 55, 65, 75, 85)
  if (clampedLevel % 10 === 5) {
    const mbIndex = Math.floor(clampedLevel / 10);
    const mb = MINI_BOSS_ROSTER[mbIndex % MINI_BOSS_ROSTER.length];

    return {
      level: clampedLevel,
      isBoss: false,
      isFinalBoss: false,
      isMiniBoss: true,
      miniBossId: mb.miniBossId,
      miniBossOrigin: mb.miniBossOrigin,
      name: mb.name,
      title: `MINI-BOSS · ${mb.title}`,
      species: mb.species,
      visualVariant: mb.visualVariant ?? 'default',
      maxHp: Math.round(baseMaxHp * 1.32),
      armorPct: Math.min(0.94, Number((baseArmorPct + 0.02).toFixed(3))),
      regenPerSecPct: Math.min(0.052, Number((baseRegenPct * 1.08).toFixed(4))),
      koReward: Math.round(baseKoReward * 1.85),
      hitRewardBase: Math.max(1, Math.round(baseHitReward * 1.35)),
      voicePitch: mb.voicePitch,
      skinColor: mb.skinColor,
      skinShadow: mb.skinShadow,
      hairColor: mb.hairColor,
      eyeColor: mb.eyeColor,
      hairStyle: mb.hairStyle,
      facialHair: mb.facialHair,
      shirtStyle: mb.shirtStyle,
      faceAccessory: mb.faceAccessory ?? 'none',
      hasCyberEye: Boolean(mb.hasCyberEye),
      hasMetalJaw: Boolean(mb.hasMetalJaw),
      hasScar: Boolean(mb.hasScar),
    };
  }

  // Unique non-boss NPC index (skips bosses at multiples of 10 and mini-bosses at % 10 === 5)
  const bossesPassed = Math.floor((clampedLevel - 1) / 10);
  const miniBossesPassed = Math.floor((clampedLevel + 4) / 10);
  const regularSlot = clampedLevel - 1 - bossesPassed - miniBossesPassed;
  const arch = ARCHETYPES[regularSlot % ARCHETYPES.length];

  return {
    level: clampedLevel,
    isBoss: false,
    isFinalBoss: false,
    name: arch.name,
    title: arch.title,
    species: arch.species,
    visualVariant: arch.visualVariant ?? 'default',
    maxHp: baseMaxHp,
    armorPct: baseArmorPct,
    regenPerSecPct: baseRegenPct,
    koReward: baseKoReward,
    hitRewardBase: baseHitReward,
    voicePitch: arch.voicePitch,
    skinColor: arch.skinColor,
    skinShadow: arch.skinShadow,
    hairColor: arch.hairColor,
    eyeColor: arch.eyeColor,
    hairStyle: arch.hairStyle,
    facialHair: arch.facialHair,
    shirtStyle: arch.shirtStyle,
    faceAccessory: arch.faceAccessory ?? 'none',
    hasCyberEye: Boolean(arch.hasCyberEye),
    hasMetalJaw: Boolean(arch.hasMetalJaw),
    hasScar: Boolean(arch.hasScar),
  };
}

export function getUpgradeCost(upgrade: UpgradeDef, currentLevel: number): number {
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

export function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000_000_000_000) {
    return `R$ ${(amount / 1_000_000_000_000_000_000).toFixed(2).replace('.', ',')} qi`;
  }
  if (amount >= 1_000_000_000_000_000) {
    return `R$ ${(amount / 1_000_000_000_000_000).toFixed(2).replace('.', ',')} qa`;
  }
  if (amount >= 1_000_000_000_000) {
    return `R$ ${(amount / 1_000_000_000_000).toFixed(2).replace('.', ',')} tri`;
  }
  if (amount >= 1_000_000_000) {
    return `R$ ${(amount / 1_000_000_000).toFixed(2).replace('.', ',')} bi`;
  }
  if (amount >= 1_000_000) {
    return `R$ ${(amount / 1_000_000).toFixed(2).replace('.', ',')} mi`;
  }
  if (amount >= 100_000) {
    return `R$ ${(amount / 1_000).toFixed(1).replace('.', ',')} mil`;
  }
  return `R$ ${Math.floor(amount).toLocaleString('pt-BR')}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000_000_000_000) {
    return `${(value / 1_000_000_000_000_000_000).toFixed(2).replace('.', ',')}Qi`;
  }
  if (value >= 1_000_000_000_000_000) {
    return `${(value / 1_000_000_000_000_000).toFixed(2).replace('.', ',')}Qa`;
  }
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2).replace('.', ',')}T`;
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2).replace('.', ',')}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace('.', ',')}M`;
  }
  if (value >= 100_000) {
    return `${(value / 1_000).toFixed(1).replace('.', ',')}K`;
  }
  return Math.floor(value).toLocaleString('pt-BR');
}
