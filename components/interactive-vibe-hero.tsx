"use client";

import { useState } from "react";

type VibeKey = "focus" | "brunch" | "late" | "music";

interface VibeDetails {
  id: VibeKey;
  name: string;
  emoji: string;
  score: number;
  description: string;
  quote: string;
  reviewer: string;
  bgClass: string;
  stars: number;
  stats: {
    wifi: { label: string; val: number; color: string };
    noise: { label: string; val: number; color: string };
    seating: { label: string; val: number; color: string };
    coffee: { label: string; val: number; color: string };
  };
}

const vibePresets: Record<VibeKey, VibeDetails> = {
  focus: {
    id: "focus",
    name: "Deep Focus",
    emoji: "💻",
    score: 9.6,
    description: "Ultra-fast WiFi, silent zones, and plenty of power outlets.",
    quote: "Found my remote work paradise. Plentiful charging outlets and super fast speed.",
    reviewer: "Aarav S. · Verified Reviewer",
    bgClass: "bg-[#c9ff4d] text-[#21152d]",
    stars: 5,
    stats: {
      wifi: { label: "WiFi Speed", val: 98, color: "bg-[#c9ff4d]" },
      noise: { label: "Quietness", val: 92, color: "bg-[#ff8a9a]" },
      seating: { label: "Desk Space", val: 90, color: "bg-[#b993ff]" },
      coffee: { label: "Espresso Quality", val: 88, color: "bg-[#ffd66b]" },
    }
  },
  brunch: {
    id: "brunch",
    name: "Date-worthy",
    emoji: "🥐",
    score: 9.2,
    description: "Bright sunlit corners, aesthetic greenery, and top-tier pancakes.",
    quote: "Splendid natural lighting and lovely outdoor garden seating.",
    reviewer: "Elena R. · Silver Explorer",
    bgClass: "bg-[#ff8a9a] text-white",
    stars: 5,
    stats: {
      wifi: { label: "WiFi Speed", val: 65, color: "bg-[#c9ff4d]" },
      noise: { label: "Quietness", val: 40, color: "bg-[#ff8a9a]" },
      seating: { label: "Aesthetics", val: 96, color: "bg-[#b993ff]" },
      coffee: { label: "Artisan Brews", val: 94, color: "bg-[#ffd66b]" },
    }
  },
  music: {
    id: "music",
    name: "Main Character",
    emoji: "🎧",
    score: 9.5,
    description: "Spinning vinyl records, cozy velvet couches, and specialty filter coffee.",
    quote: "Immense retro atmosphere. Felt like I was in a classic film.",
    reviewer: "Sia P. · Gold Reviewer",
    bgClass: "bg-[#b993ff] text-white",
    stars: 5,
    stats: {
      wifi: { label: "WiFi Speed", val: 78, color: "bg-[#c9ff4d]" },
      noise: { label: "Lofi Beats", val: 85, color: "bg-[#ff8a9a]" },
      seating: { label: "Velvet Seating", val: 92, color: "bg-[#b993ff]" },
      coffee: { label: "Single Origin", val: 98, color: "bg-[#ffd66b]" },
    }
  },
  late: {
    id: "late",
    name: "Late-night",
    emoji: "🌙",
    score: 8.9,
    description: "Warm atmospheric lamps, open past midnight, fresh warm cookies.",
    quote: "A gorgeous spot to write or study when the rest of the town is asleep.",
    reviewer: "Kabir M. · Bronze Explorer",
    bgClass: "bg-[#ffd66b] text-[#21152d]",
    stars: 4,
    stats: {
      wifi: { label: "WiFi Speed", val: 80, color: "bg-[#c9ff4d]" },
      noise: { label: "Cosy Lighting", val: 90, color: "bg-[#ff8a9a]" },
      seating: { label: "Lounge Couches", val: 95, color: "bg-[#b993ff]" },
      coffee: { label: "Late Brews", val: 85, color: "bg-[#ffd66b]" },
    }
  }
};

export function InteractiveVibeHero() {
  const [selectedVibe, setSelectedVibe] = useState<VibeKey>("focus");
  const active = vibePresets[selectedVibe];

  return (
    <div className="relative flex flex-col justify-between min-h-[500px] w-full">
      {/* Vibe Selection Tabs */}
      <div className="z-20 mb-8 flex flex-wrap gap-2 rounded-2xl bg-white/5 p-1.5 backdrop-blur-md border border-white/10 self-center lg:self-start">
        {(Object.keys(vibePresets) as VibeKey[]).map((key) => {
          const v = vibePresets[key];
          const isSelected = selectedVibe === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedVibe(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                isSelected
                  ? "bg-white text-[#21152d] shadow-md scale-105"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{v.emoji}</span>
              <span>{v.name}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Interactive Canvas */}
      <div className="relative w-full h-[380px] lg:h-[400px]">
        
        {/* Card 1: Vibe Score Card */}
        <div
          className={`absolute right-0 top-0 z-15 w-[250px] sm:w-[280px] p-6 rounded-[2rem] shadow-2xl transition-all duration-500 ease-out border border-white/10 animate-float-slow ${active.bgClass}`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
            Vibe score
          </p>
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-6xl sm:text-7xl font-black tracking-tighter">
              {active.score}
            </span>
            <span className="text-xl font-bold opacity-80">/10</span>
          </div>
          <p className="mt-4 text-xs font-bold leading-relaxed">
            {active.description}
          </p>
        </div>

        {/* Card 2: Verified Review Card */}
        <div
          className="absolute bottom-0 left-0 z-10 w-[270px] sm:w-[320px] p-6 rounded-[2rem] border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out animate-float-medium"
        >
          <div className="mb-8 flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9ff4d]" /> Verified visit
            </span>
            <span className="tracking-normal text-[#c9ff4d]">
              {"★".repeat(active.stars)}
              {"☆".repeat(5 - active.stars)}
            </span>
          </div>
          <p className="text-sm font-bold italic leading-relaxed text-white">
            &quot;{active.quote}&quot;
          </p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#c9ff4d]">
            {active.reviewer}
          </p>
        </div>

        {/* Card 3: Live Stats Panel */}
        <div
          className="absolute top-[110px] left-[20px] sm:left-[60px] z-5 w-[200px] sm:w-[240px] p-5 rounded-3xl border border-white/10 bg-[#1e142c]/90 text-white shadow-xl backdrop-blur-lg transition-all duration-500 ease-out"
        >
          <h4 className="text-[9px] font-black uppercase tracking-widest text-[#c9ff4d] mb-4">
            Vibe Diagnostics
          </h4>
          
          <div className="flex flex-col gap-3">
            {Object.entries(active.stats).map(([statKey, item]) => (
              <div key={statKey}>
                <div className="flex justify-between text-[9px] font-bold text-white/70 mb-1">
                  <span>{item.label}</span>
                  <span className="font-mono text-[#c9ff4d]">{item.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.val}%` }}
                    className={`h-full rounded-full transition-width ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
