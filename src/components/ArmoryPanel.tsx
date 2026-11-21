import React, { useState } from 'react';
import {
  UPGRADES,
  UpgradeDef,
  WEAPONS,
  Weapon,
  formatMoney,
  formatNumber,
  getUpgradeCost,
} from '../data/gameData';
import { WeaponIcon } from './WeaponIcon';

interface ArmoryPanelProps {
  money: number;
  ownedWeapons: string[];
  equippedWeaponId: string;
  upgradeLevels: Record<UpgradeDef['id'], number>;
  onBuyWeapon: (weapon: Weapon) => void;
  onEquipWeapon: (weaponId: string) => void;
  onBuyUpgrade: (upgrade: UpgradeDef) => void;
}

export const ArmoryPanel: React.FC<ArmoryPanelProps> = ({
  money,
  ownedWeapons,
  equippedWeaponId,
  upgradeLevels,
  onBuyWeapon,
  onEquipWeapon,
  onBuyUpgrade,
}) => {
  const [activeTab, setActiveTab] = useState<'weapons' | 'upgrades'>('weapons');

  const strengthMult = 1 + (upgradeLevels.strength || 0) * 0.25;

  return (
    <aside className="flex flex-col h-full bg-[#181A20] border-t lg:border-t-0 lg:border-l border-white/10">
      {/* Header & Segmented Tab Switch */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Arsenal & Melhorias
          </h2>
          <span className="font-mono-tabular text-xs text-zinc-400">
            {ownedWeapons.length}/{WEAPONS.length} armas
          </span>
        </div>

        <div
          className="grid grid-cols-2 gap-1 p-1 bg-[#111215] rounded-lg border border-white/5"
          role="tablist"
          aria-label="Categorias da loja"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'weapons'}
            onClick={() => setActiveTab('weapons')}
            className={`min-h-[40px] px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'weapons'
                ? 'bg-[#262932] text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Armas Letais
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upgrades'}
            onClick={() => setActiveTab('upgrades')}
            className={`min-h-[40px] px-3 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'upgrades'
                ? 'bg-[#262932] text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Melhorias
          </button>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto arena-scroll divide-y divide-white/[0.07]">
        {activeTab === 'weapons' ? (
          WEAPONS.map((weapon, index) => {
            const isOwned = ownedWeapons.includes(weapon.id);
            const isEquipped = equippedWeaponId === weapon.id;
            const canAfford = money >= weapon.price;
            const effectiveDamage = Math.round(weapon.baseDamage * strengthMult);

            return (
              <div
                key={weapon.id}
                className={`p-4 sm:px-5 flex items-center justify-between gap-4 transition-colors ${
                  isEquipped ? 'bg-red-950/20' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
                      isEquipped
                        ? 'bg-red-600/20 border-red-500/40 text-red-400'
                        : isOwned
                          ? 'bg-[#22252C] border-white/10 text-zinc-200'
                          : 'bg-[#131519] border-white/5 text-zinc-500'
                    }`}
                  >
                    <WeaponIcon weaponId={weapon.id} className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono-tabular text-xs text-zinc-500">
                        {index + 1}.
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-100 truncate">
                        {weapon.name}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                      {weapon.description}
                    </p>
                    <div className="font-mono-tabular text-xs text-zinc-400 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-zinc-200 font-medium">
                        {formatNumber(effectiveDamage)} dano
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{Math.round(weapon.critChance * 100)}% crit</span>
                      {weapon.bleedDps > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-red-400">{formatNumber(weapon.bleedDps)}/s sangue</span>
                        </>
                      )}
                      {weapon.traumaPower > 1 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-400">{weapon.traumaPower.toFixed(1)}x trauma</span>
                        </>
                      )}
                      {weapon.armorPierce > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{Math.round(weapon.armorPierce * 100)}% perfura</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isEquipped ? (
                    <span className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg whitespace-nowrap shrink-0">
                      Equipada
                    </span>
                  ) : isOwned ? (
                    <button
                      type="button"
                      onClick={() => onEquipWeapon(weapon.id)}
                      className="min-h-[40px] px-4 py-2 text-xs font-semibold bg-[#262932] hover:bg-[#313540] text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Equipar
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyWeapon(weapon)}
                      className={`min-h-[40px] px-4 py-2 text-xs font-semibold font-mono-tabular rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-[#202229] text-zinc-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {formatMoney(weapon.price)}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          UPGRADES.map((upgrade) => {
            const level = upgradeLevels[upgrade.id] || 0;
            const isMaxed = upgrade.maxLevel !== undefined && level >= upgrade.maxLevel;
            const cost = getUpgradeCost(upgrade, level);
            const canAfford = !isMaxed && money >= cost;

            return (
              <div
                key={upgrade.id}
                className="p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {upgrade.name}
                    </h3>
                    <span className="font-mono-tabular text-xs text-zinc-400">
                      Nível {level}
                      {upgrade.maxLevel ? `/${upgrade.maxLevel}` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {upgrade.description}
                  </p>
                  <div className="font-mono-tabular text-xs text-emerald-400 mt-1.5">
                    Atual: {upgrade.effectLabel(level)}
                  </div>
                </div>

                <div className="shrink-0">
                  {isMaxed ? (
                    <span className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 text-xs font-semibold text-zinc-400 border border-white/10 rounded-lg whitespace-nowrap shrink-0">
                      Máximo
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyUpgrade(upgrade)}
                      className={`min-h-[40px] px-4 py-2 text-xs font-semibold font-mono-tabular rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-[#202229] text-zinc-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {formatMoney(cost)}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
