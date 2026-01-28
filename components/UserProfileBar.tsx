import React from 'react';
import { HelpTooltip } from './HelpTooltip';

interface UserProfileBarProps {
  level: number;
  exp: number;
  expToNextLevel: number;
  rankName: string;
}

export const UserProfileBar: React.FC<UserProfileBarProps> = ({ level, exp, expToNextLevel, rankName }) => {
  const progressPercentage = expToNextLevel > 0 ? (exp / expToNextLevel) * 100 : 0;

  const helpContent = (
    <div className="space-y-4 text-sm text-medium-text">
        <h4 className="font-bold text-light-text text-lg">How EXP & Ranks Work</h4>
        <p>Gain <strong className="text-green-400">Experience Points (EXP)</strong> by correctly answering questions in practice mode. The more difficult an item is, the more EXP you'll earn!</p>
        <p>Filling your EXP bar increases your <strong className="text-brand-primary">Level</strong>. As you level up, you'll unlock new Ranks and visual upgrades for the app, making your learning journey more rewarding.</p>
        <div>
            <p className="font-semibold text-light-text text-base mb-2">Rank Tiers & UI Upgrades:</p>
            <ul className="space-y-3">
                {/* Bronze Tier */}
                <li className="p-3 rounded-md border border-yellow-800 bg-yellow-900/10">
                  <strong className="text-yellow-700">Bronze Tier</strong>
                  <p className="text-xs mt-1">The start of your journey.</p>
                  <ul className="list-disc list-inside text-xs mt-2 space-y-1 pl-2">
                    <li><strong className="text-orange-400">Level 5:</strong> Upgrade to a <strong className="text-orange-400">Polished Bronze</strong> theme.</li>
                  </ul>
                </li>
                {/* Silver Tier */}
                <li className="p-3 rounded-md border border-slate-500 bg-slate-800/20">
                  <strong className="text-slate-300">Silver Tier (Level 10)</strong>
                  <p className="text-xs mt-1">A cool, metallic theme reflecting your progress.</p>
                   <ul className="list-disc list-inside text-xs mt-2 space-y-1 pl-2">
                    <li><strong className="text-sky-300">Level 15:</strong> The theme evolves into <strong className="text-sky-300">Sterling Silver</strong>.</li>
                  </ul>
                </li>
                {/* Gold Tier */}
                <li className="p-3 rounded-md border border-yellow-400 bg-yellow-900/20">
                  <strong className="text-yellow-300">Gold Tier (Level 20)</strong>
                  <p className="text-xs mt-1">A prestigious theme showcasing your mastery.</p>
                   <ul className="list-disc list-inside text-xs mt-2 space-y-1 pl-2">
                    <li><strong className="text-yellow-200">Level 30:</strong> Your frame shines brighter as <strong className="text-yellow-200">Polished Gold</strong>.</li>
                  </ul>
                </li>
                {/* Platinum Tier */}
                <li className="p-3 rounded-md border border-cyan-400 bg-cyan-900/20">
                  <strong className="text-cyan-300">Platinum Tier (Level 40)</strong>
                  <p className="text-xs mt-1">The ultimate rank for language experts.</p>
                   <ul className="list-disc list-inside text-xs mt-2 space-y-1 pl-2">
                    <li><strong className="text-cyan-200">Level 50:</strong> Achieve the final form: <strong className="text-cyan-200">Radiant Platinum</strong>, with a glowing aura.</li>
                  </ul>
                </li>
            </ul>
        </div>
    </div>
  );

  return (
    <div className="p-4 bg-dark-card rounded-lg border border-dark-border">
      <div className="flex justify-between items-center mb-2">
        <div className='flex items-center gap-3'>
            <span className="font-bold text-lg text-brand-primary">Level {level}</span>
            <span className="text-sm font-semibold px-2 py-0.5 bg-dark-border rounded-full">{rankName}</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-sm text-medium-text">
            {exp} / {expToNextLevel} EXP
            </span>
            <HelpTooltip>{helpContent}</HelpTooltip>
        </div>
      </div>
      <div className="w-full bg-dark-border rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 h-2.5 rounded-full transition-all duration-500 bg-[length:200%_100%] animate-shimmer"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={exp}
          aria-valuemin={0}
          aria-valuemax={expToNextLevel}
        ></div>
      </div>
    </div>
  );
};