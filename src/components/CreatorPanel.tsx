import React, { useEffect, useState } from 'react';
import { Lock, ShieldAlert, Skull, Sliders, Swords, Unlock, X } from 'lucide-react';
import {
  CREATOR_ENEMY_CATALOG,
  CreatorModifiers,
  MAX_LEVEL,
  TraumaState,
  UPGRADES,
  UpgradeDef,
  WEAPONS,
  formatMoney,
  formatNumber,
} from '../data/gameData';
import {
  hasCustomCreatorPasscode,
  resetCreatorPasscodeToDefault,
  updateCreatorPasscode,
  verifyCreatorPasscode,
} from '../utils/creatorAuth';

interface CreatorLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const CreatorLoginModal: React.FC<CreatorLoginModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCreatorPasscode(passcode)) {
      setErrorMsg(null);
      onSuccess();
    } else {
      setErrorMsg('Chave do criador incorreta.');
      setPasscode('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-login-title"
    >
      <div className="bg-[#181A20] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Lock className="w-5 h-5 shrink-0" />
            <h2 id="creator-login-title" className="font-display text-xl font-bold text-white">
              Acesso do Criador
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-[#22252C] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          Área restrita ao criador do jogo. Digite sua chave secreta para escolher níveis, chefões, armas e regras da partida.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="creator-passcode-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Chave Secreta
            </label>
            <input
              id="creator-passcode-input"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Digite a chave..."
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#111215] border border-white/15 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
            {errorMsg && (
              <p className="text-xs text-red-400 mt-1.5 font-medium" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-[#22252C] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              Desbloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreatorPanelProps {
  level: number;
  money: number;
  ownedWeapons: string[];
  equippedWeaponId: string;
  upgradeLevels: Record<UpgradeDef['id'], number>;
  forcedEnemyKey: string | null;
  modifiers: CreatorModifiers;
  trauma: TraumaState;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  onJumpToLevel: (targetLevel: number, customEnemyKey?: string | null) => void;
  onSelectCustomEnemy: (enemyKey: string | null) => void;
  onSelectWeapon: (weaponId: string) => void;
  onUnlockAllWeapons: () => void;
  onAddMoney: (delta: number) => void;
  onSetMoney: (amount: number) => void;
  onMaxUpgrades: () => void;
  onResetUpgrades: () => void;
  onUpdateModifiers: (next: CreatorModifiers) => void;
  onApplyTraumaAction: (action: 'heal' | 'nose' | 'jaw' | 'skull' | 'blind' | 'artery' | 'tooth' | 'rage' | 'ko') => void;
  onLockCreator: () => void;
  onClose: () => void;
}

type CreatorTab = 'fights' | 'arsenal' | 'rules' | 'security';

export const CreatorPanel: React.FC<CreatorPanelProps> = ({
  level,
  money,
  ownedWeapons,
  equippedWeaponId,
  upgradeLevels,
  forcedEnemyKey,
  modifiers,
  trauma,
  enemyName,
  enemyHp,
  enemyMaxHp,
  onJumpToLevel,
  onSelectCustomEnemy,
  onSelectWeapon,
  onUnlockAllWeapons,
  onAddMoney,
  onSetMoney,
  onMaxUpgrades,
  onResetUpgrades,
  onUpdateModifiers,
  onApplyTraumaAction,
  onLockCreator,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CreatorTab>('fights');
  const [levelInput, setLevelInput] = useState<number>(level);
  const [moneyInput, setMoneyInput] = useState<string>(String(Math.floor(money)));
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFeedback, setPasscodeFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isCustomPassActive, setIsCustomPassActive] = useState<boolean>(() => hasCustomCreatorPasscode());

  useEffect(() => {
    setLevelInput(level);
  }, [level]);

  useEffect(() => {
    setMoneyInput(String(Math.floor(money)));
  }, [money]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bosses = CREATOR_ENEMY_CATALOG.filter((e) => e.isBoss);
  const miniBosses = CREATOR_ENEMY_CATALOG.filter((e) => e.isMiniBoss);

  const handleSavePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPasscode.trim();
    if (trimmed.length < 4) {
      setPasscodeFeedback({ ok: false, text: 'A chave precisa ter pelo menos 4 caracteres.' });
      return;
    }
    if (trimmed !== confirmPasscode.trim()) {
      setPasscodeFeedback({ ok: false, text: 'As duas chaves digitadas não conferem.' });
      return;
    }
    if (updateCreatorPasscode(trimmed)) {
      setIsCustomPassActive(true);
      setNewPasscode('');
      setConfirmPasscode('');
      setPasscodeFeedback({ ok: true, text: 'Nova chave do criador salva neste navegador.' });
    } else {
      setPasscodeFeedback({ ok: false, text: 'Não foi possível salvar a chave.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-panel-title"
    >
      <div className="bg-[#181A20] border border-amber-400/35 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-[#14161B]">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono-tabular font-semibold">
              <Unlock className="w-3.5 h-3.5" />
              <span>Modo Criador Ativo</span>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-400">
                Atual: {enemyName} (Nível {level}) · HP {formatNumber(enemyHp)}/{formatNumber(enemyMaxHp)}
              </span>
            </div>
            <h2 id="creator-panel-title" className="font-display text-2xl font-extrabold text-white mt-0.5">
              Painel de Controle do Criador
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onLockCreator}
              className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-red-300 hover:text-white bg-red-950/60 hover:bg-red-700/80 border border-red-500/30 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              Bloquear &amp; Ocultar
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel"
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white bg-[#22252C] hover:bg-[#2C303A] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              Voltar à Luta
            </button>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="px-6 pt-3 pb-3 border-b border-white/10 bg-[#14161B] flex flex-wrap items-center gap-1.5">
          {[
            { id: 'fights' as const, label: 'Chefões & Níveis', icon: Skull },
            { id: 'arsenal' as const, label: 'Arsenal & Dinheiro', icon: Swords },
            { id: 'rules' as const, label: 'Regras da Luta', icon: Sliders },
            { id: 'security' as const, label: 'Segurança', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 min-h-[38px] px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-[#1E2028] text-zinc-300 hover:text-white hover:bg-[#262934]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'fights' && (
            <>
              {/* Direct Level Selector */}
              <section>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Escolher Nível (1 a {MAX_LEVEL})
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Pule direto para qualquer fase e entre automaticamente na arena.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onJumpToLevel(Math.max(1, level - 1), forcedEnemyKey)}
                      className="min-h-[38px] px-3 py-1.5 text-xs font-mono-tabular font-semibold bg-[#22252C] hover:bg-[#2D313B] text-white rounded-lg cursor-pointer"
                    >
                      -1 Nível
                    </button>
                    <button
                      type="button"
                      onClick={() => onJumpToLevel(Math.min(MAX_LEVEL, level + 1), forcedEnemyKey)}
                      className="min-h-[38px] px-3 py-1.5 text-xs font-mono-tabular font-semibold bg-[#22252C] hover:bg-[#2D313B] text-white rounded-lg cursor-pointer"
                    >
                      +1 Nível
                    </button>
                  </div>
                </div>

                <div className="bg-[#111215] border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={MAX_LEVEL}
                    value={levelInput}
                    onChange={(e) => setLevelInput(Number(e.target.value))}
                    className="flex-1 min-w-[180px] accent-amber-400 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={1}
                    max={MAX_LEVEL}
                    value={levelInput}
                    onChange={(e) =>
                      setLevelInput(Math.max(1, Math.min(MAX_LEVEL, Number(e.target.value) || 1)))
                    }
                    className="w-20 min-h-[40px] px-3 py-1.5 bg-[#181A20] border border-white/15 rounded-lg text-sm font-mono-tabular text-white text-center"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onJumpToLevel(levelInput, forcedEnemyKey);
                      onClose();
                    }}
                    className="min-h-[40px] px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Ir para Nível {levelInput}
                  </button>
                </div>
              </section>

              {/* All 9 Iconic Bosses */}
              <section className="pt-4 border-t border-white/10">
                <h3 className="font-display text-lg font-bold text-white">
                  Lutar Contra Qualquer Chefão
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Clique em qualquer chefão para ir direto ao nível original dele e iniciar o combate.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {bosses.map((boss) => {
                    const targetLvl = boss.nativeLevel ?? 10;
                    const isCurrent = level === targetLvl && !forcedEnemyKey;
                    return (
                      <button
                        key={boss.key}
                        type="button"
                        onClick={() => {
                          onJumpToLevel(targetLvl, null);
                          onClose();
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-400/60'
                            : 'bg-[#111215] border-white/10 hover:border-amber-400/40 hover:bg-[#1D2028]'
                        }`}
                      >
                        <div className="font-mono-tabular text-[11px] font-semibold text-amber-400">
                          {boss.subtitle}
                        </div>
                        <div className="font-display text-base font-bold text-white mt-0.5">
                          {boss.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* All 9 Famous YouTuber Mini-Bosses */}
              <section className="pt-4 border-t border-white/10">
                <h3 className="font-display text-lg font-bold text-white">
                  Mini-Bosses YouTubers (Níveis 5, 15, 25...)
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Clique em qualquer YouTuber para ir direto ao nível dele e testar suas frases icônicas.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {miniBosses.map((mb) => {
                    const targetLvl = mb.nativeLevel ?? 5;
                    const isCurrent = level === targetLvl && !forcedEnemyKey;
                    return (
                      <button
                        key={mb.key}
                        type="button"
                        onClick={() => {
                          onJumpToLevel(targetLvl, null);
                          onClose();
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-rose-500/15 border-rose-400/60'
                            : 'bg-[#111215] border-white/10 hover:border-rose-400/40 hover:bg-[#1D2028]'
                        }`}
                      >
                        <div className="font-mono-tabular text-[11px] font-semibold text-rose-400">
                          {mb.subtitle}
                        </div>
                        <div className="font-display text-base font-bold text-white mt-0.5">
                          {mb.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Free Opponent Override (fight anyone at any level!) */}
              <section className="pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Modo Livre: Forçar Adversário no Nível Atual ({level})
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Escolha qualquer chefão ou lutador comum para enfrentar mantendo o nível escolhido acima.
                    </p>
                  </div>
                  {forcedEnemyKey && (
                    <button
                      type="button"
                      onClick={() => onSelectCustomEnemy(null)}
                      className="min-h-[36px] px-3 py-1.5 text-xs font-semibold bg-[#22252C] hover:bg-[#2E323D] text-amber-300 rounded-lg cursor-pointer"
                    >
                      Voltar à Progressão Normal
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CREATOR_ENEMY_CATALOG.map((opt) => {
                    const selected = forcedEnemyKey === opt.key;
                    return (
                      <button
                        key={`force-${opt.key}`}
                        type="button"
                        onClick={() => {
                          onSelectCustomEnemy(opt.key);
                          onClose();
                        }}
                        className={`text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          selected
                            ? 'bg-red-600/20 border-red-400 text-white'
                            : 'bg-[#111215] border-white/10 text-zinc-300 hover:bg-[#1D2028] hover:text-white'
                        }`}
                      >
                        <div className="font-semibold text-white truncate">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {opt.isBoss
                            ? `Chefão · ${opt.subtitle}`
                            : opt.isMiniBoss
                              ? `Mini-Boss · ${opt.subtitle}`
                              : opt.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeTab === 'arsenal' && (
            <>
              {/* Money Controls */}
              <section>
                <h3 className="font-display text-lg font-bold text-white">
                  Dinheiro do Jogador
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Saldo atual: <span className="font-mono-tabular font-bold text-emerald-400">{formatMoney(money)}</span>
                </p>

                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  {[
                    { label: '+R$ 10 mil', amount: 10_000 },
                    { label: '+R$ 1 milhão', amount: 1_000_000 },
                    { label: '+R$ 100 milhões', amount: 100_000_000 },
                    { label: '+R$ 10 bilhões', amount: 10_000_000_000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onAddMoney(preset.amount)}
                      className="min-h-[40px] px-4 py-2 text-xs font-mono-tabular font-semibold bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 rounded-lg cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onSetMoney(0)}
                    className="min-h-[40px] px-4 py-2 text-xs font-semibold bg-[#22252C] hover:bg-[#2E323D] text-zinc-300 rounded-lg cursor-pointer"
                  >
                    Zerar Saldo
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="number"
                    min={0}
                    value={moneyInput}
                    onChange={(e) => setMoneyInput(e.target.value)}
                    className="w-52 min-h-[40px] px-3 py-2 bg-[#111215] border border-white/15 rounded-lg text-sm font-mono-tabular text-white"
                  />
                  <button
                    type="button"
                    onClick={() => onSetMoney(Math.max(0, Number(moneyInput) || 0))}
                    className="min-h-[40px] px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg cursor-pointer"
                  >
                    Definir Valor Exato
                  </button>
                </div>
              </section>

              {/* Weapons */}
              <section className="pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Todas as Armas ({ownedWeapons.length}/{WEAPONS.length} liberadas)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Clique em qualquer arma para desbloquear e equipar na hora.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onUnlockAllWeapons}
                    className="min-h-[40px] px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Desbloquear Todas
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {WEAPONS.map((w) => {
                    const equipped = equippedWeaponId === w.id;
                    const owned = ownedWeapons.includes(w.id);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onSelectWeapon(w.id)}
                        className={`text-left px-3.5 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                          equipped
                            ? 'bg-red-600/20 border-red-400 text-white'
                            : 'bg-[#111215] border-white/10 hover:bg-[#1D2028] text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white truncate">{w.name}</span>
                          <span className="font-mono-tabular text-[11px] text-amber-300 shrink-0">
                            {equipped ? 'Equipada' : owned ? 'Liberada' : 'Equipar'}
                          </span>
                        </div>
                        <div className="font-mono-tabular text-[11px] text-zinc-400 mt-0.5">
                          Dano base: {formatNumber(w.baseDamage)} · Perfura {Math.round(w.armorPierce * 100)}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Upgrades */}
              <section className="pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Melhorias da Arena</h3>
                    <p className="text-xs text-zinc-400">
                      Maximize ou zere todas as habilidades de combate.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onResetUpgrades}
                      className="min-h-[38px] px-3.5 py-2 text-xs font-semibold bg-[#22252C] hover:bg-[#2E323D] text-zinc-300 rounded-lg cursor-pointer"
                    >
                      Zerar Melhorias
                    </button>
                    <button
                      type="button"
                      onClick={onMaxUpgrades}
                      className="min-h-[38px] px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg cursor-pointer"
                    >
                      Maximizar Tudo
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono-tabular">
                  {UPGRADES.map((u) => (
                    <div key={u.id} className="bg-[#111215] border border-white/10 rounded-lg px-3 py-2">
                      <div className="text-zinc-300 font-semibold truncate">{u.name}</div>
                      <div className="text-amber-300 mt-0.5">
                        Nível {upgradeLevels[u.id] || 0}
                        {u.maxLevel ? `/${u.maxLevel}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'rules' && (
            <>
              <section>
                <h3 className="font-display text-lg font-bold text-white">
                  Modificadores de Combate
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Personalize as regras da arena do jeito que quiser.
                </p>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      key: 'disableCounterAttacks' as const,
                      title: 'Desativar Contra-Ataques',
                      desc: 'O inimigo nunca contra-ataca e você não perde dinheiro nem combo.',
                    },
                    {
                      key: 'disableEnemyGuard' as const,
                      title: 'Desativar Bloqueio / Guarda',
                      desc: 'O oponente nunca levanta os braços para defender os golpes.',
                    },
                    {
                      key: 'disableEnemyRegen' as const,
                      title: 'Desativar Regeneração',
                      desc: 'O HP do oponente não regenera quando você para de bater.',
                    },
                    {
                      key: 'infiniteRage' as const,
                      title: 'Fúria Infinita (Modo Massacre)',
                      desc: 'Mantém a barra de fúria cheia e o bônus de massacre ativo.',
                    },
                    {
                      key: 'oneHitKo' as const,
                      title: 'Golpe Mortal (1-Hit K.O.)',
                      desc: 'Qualquer soco nocauteia instantaneamente qualquer chefão.',
                    },
                  ].map((item) => {
                    const enabled = modifiers[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          onUpdateModifiers({
                            ...modifiers,
                            [item.key]: !enabled,
                          })
                        }
                        className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                          enabled
                            ? 'bg-emerald-500/15 border-emerald-400/60'
                            : 'bg-[#111215] border-white/10 hover:bg-[#1D2028]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-white">{item.title}</span>
                          <span
                            className={`font-mono-tabular text-xs font-bold ${
                              enabled ? 'text-emerald-400' : 'text-zinc-500'
                            }`}
                          >
                            {enabled ? 'ATIVO' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Damage Multiplier */}
                <div className="mt-4 bg-[#111215] border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">Multiplicador de Dano</div>
                    <div className="text-xs text-zinc-400">
                      Multiplique o dano final de todos os golpes e armas.
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {([1, 5, 25, 100] as const).map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() =>
                          onUpdateModifiers({ ...modifiers, damageMultiplier: mult })
                        }
                        className={`min-h-[38px] px-3.5 py-1.5 text-xs font-mono-tabular font-bold rounded-lg cursor-pointer ${
                          modifiers.damageMultiplier === mult
                            ? 'bg-amber-400 text-zinc-950'
                            : 'bg-[#22252C] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {mult}x
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Trauma & Visual Inspector */}
              <section className="pt-4 border-t border-white/10">
                <h3 className="font-display text-lg font-bold text-white">
                  Testador Rápido de Traumas e Ações
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Aplique traumas instantâneos no rosto atual ou execute ações imediatas.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('nose')}
                    className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      trauma.noseBroken
                        ? 'bg-red-600/25 border-red-400 text-white'
                        : 'bg-[#111215] border-white/10 text-zinc-200 hover:bg-[#1D2028]'
                    }`}
                  >
                    Quebrar Nariz
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('jaw')}
                    className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      trauma.jawFractured
                        ? 'bg-red-600/25 border-red-400 text-white'
                        : 'bg-[#111215] border-white/10 text-zinc-200 hover:bg-[#1D2028]'
                    }`}
                  >
                    Expor Mandíbula
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('skull')}
                    className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      trauma.skullExposed
                        ? 'bg-red-600/25 border-red-400 text-white'
                        : 'bg-[#111215] border-white/10 text-zinc-200 hover:bg-[#1D2028]'
                    }`}
                  >
                    Expor Crânio
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('blind')}
                    className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      trauma.isBlind
                        ? 'bg-red-600/25 border-red-400 text-white'
                        : 'bg-[#111215] border-white/10 text-zinc-200 hover:bg-[#1D2028]'
                    }`}
                  >
                    Cegar Olhos
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('artery')}
                    className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      trauma.arterialRupture
                        ? 'bg-red-600/25 border-red-400 text-white'
                        : 'bg-[#111215] border-white/10 text-zinc-200 hover:bg-[#1D2028]'
                    }`}
                  >
                    Ruptura Arterial
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('tooth')}
                    className="min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border bg-[#111215] border-white/10 text-zinc-200 hover:bg-[#1D2028] cursor-pointer"
                  >
                    Arrancar Dente ({trauma.teethRemaining}/6)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('rage')}
                    className="min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border bg-amber-500/15 border-amber-400/50 text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                  >
                    Encher Fúria 100%
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyTraumaAction('heal')}
                    className="min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg border bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 cursor-pointer"
                  >
                    Curar Alvo &amp; Limpar Sangue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyTraumaAction('ko');
                      onClose();
                    }}
                    className="min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  >
                    Nocautear Agora
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === 'security' && (
            <section className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Proteção Exclusiva do Criador
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Para jogadores comuns no link compartilhado, nenhum botão do criador aparece na tela. O painel só abre com o atalho secreto e sua chave verificada por hash SHA-256.
                </p>
              </div>

              <div className="bg-[#111215] border border-white/10 rounded-xl p-4 space-y-2 text-xs text-zinc-300">
                <div className="font-semibold text-white">Atalhos Secretos de Abertura</div>
                <div>· Teclado: pressione <span className="font-mono-tabular text-amber-300">Ctrl + Shift + D</span> ou digite <span className="font-mono-tabular text-amber-300">criador</span></div>
                <div>· Mouse / Celular: toque <span className="font-mono-tabular text-amber-300">7 vezes rápidas</span> no título <span className="font-semibold text-white">Soca-Cara</span></div>
              </div>

              <form onSubmit={handleSavePasscode} className="bg-[#111215] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white">
                    Personalizar Chave Secreta neste Navegador
                  </div>
                  {isCustomPassActive && (
                    <button
                      type="button"
                      onClick={() => {
                        resetCreatorPasscodeToDefault();
                        setIsCustomPassActive(false);
                        setPasscodeFeedback({ ok: true, text: 'Chave restaurada para a padrão do criador.' });
                      }}
                      className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      Restaurar Chave Padrão
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Nova chave secreta (mín. 4 dígitos)"
                    className="min-h-[40px] px-3 py-2 bg-[#181A20] border border-white/15 rounded-lg text-sm text-white placeholder:text-zinc-600"
                  />
                  <input
                    type="password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Confirmar nova chave"
                    className="min-h-[40px] px-3 py-2 bg-[#181A20] border border-white/15 rounded-lg text-sm text-white placeholder:text-zinc-600"
                  />
                </div>

                {passcodeFeedback && (
                  <p className={`text-xs font-medium ${passcodeFeedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {passcodeFeedback.text}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-zinc-500">
                    Ao sair ou clicar em &quot;Bloquear &amp; Ocultar&quot;, o botão some da tela até você digitar a chave novamente.
                  </span>
                  <button
                    type="submit"
                    className="min-h-[38px] px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Salvar Nova Chave
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
