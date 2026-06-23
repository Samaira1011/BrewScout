"use client";

import { useState } from "react";

interface SideBySidePreviewProps {
  images: string[];
  initialSelectedIndex?: number;
  onClose: () => void;
}

export function SideBySidePreview({ images, initialSelectedIndex = 0, onClose }: SideBySidePreviewProps) {
  const [leftIndex, setLeftIndex] = useState<number>(initialSelectedIndex);
  const [rightIndex, setRightIndex] = useState<number>(
    images.length > 1 ? (initialSelectedIndex === 0 ? 1 : 0) : 0
  );

  const [leftZoom, setLeftZoom] = useState<number>(1);
  const [rightZoom, setRightZoom] = useState<number>(1);

  if (!images || images.length === 0) return null;

  const leftImage = images[leftIndex];
  const rightImage = images[rightIndex];

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#171020]/95 text-white backdrop-blur-md p-4 md:p-6 animate-fade-in">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-black tracking-tight text-[#c9ff4d] flex items-center gap-2">
            <span>🔍</span> Side-by-Side Compare & Preview
          </h3>
          <p className="text-xs text-white/60">Select different images to compare details side-by-side.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 font-black transition text-sm"
        >
          ✕ Close Preview
        </button>
      </div>

      {/* Comparison Layout */}
      <div className="flex-1 grid md:grid-cols-2 gap-6 min-h-0">
        {/* Left Image Panel */}
        <div className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-4 min-h-0 relative">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-black uppercase text-[#ff6679] tracking-wider">Left Panel</span>
            <div className="flex items-center gap-2">
              <select
                value={leftIndex}
                onChange={(e) => {
                  setLeftIndex(Number(e.target.value));
                  setLeftZoom(1);
                }}
                className="bg-white/10 text-white rounded-lg px-2.5 py-1 text-xs border border-white/10 outline-none"
              >
                {images.map((img, i) => (
                  <option key={i} value={i} className="bg-[#171020]">
                    Image {i + 1} {img.startsWith("data:") ? "(New)" : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setLeftZoom((z) => Math.min(z + 0.25, 3))}
                className="bg-white/10 hover:bg-white/25 rounded px-2 py-1 text-xs font-extrabold"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setLeftZoom((z) => Math.max(z - 0.25, 0.5))}
                className="bg-white/10 hover:bg-white/25 rounded px-2 py-1 text-xs font-extrabold"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setLeftZoom(1)}
                className="bg-white/10 hover:bg-white/25 rounded px-2 py-1 text-xs font-bold"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-xl bg-black/40 border border-white/5 flex items-center justify-center relative p-4 group cursor-grab active:cursor-grabbing">
            <img
              src={leftImage}
              alt="Left Preview"
              style={{ transform: `scale(${leftZoom})` }}
              className="max-h-full max-w-full object-contain transition-transform duration-100 ease-out pointer-events-none"
            />
            <span className="absolute bottom-2 left-2 bg-[#171020]/80 text-[10px] font-bold px-2 py-0.5 rounded text-white/80">
              Zoom: {leftZoom * 100}%
            </span>
          </div>
        </div>

        {/* Right Image Panel */}
        <div className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-4 min-h-0 relative">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-black uppercase text-[#8e7dff] tracking-wider">Right Panel</span>
            <div className="flex items-center gap-2">
              <select
                value={rightIndex}
                onChange={(e) => {
                  setRightIndex(Number(e.target.value));
                  setRightZoom(1);
                }}
                className="bg-white/10 text-white rounded-lg px-2.5 py-1 text-xs border border-white/10 outline-none"
              >
                {images.map((img, i) => (
                  <option key={i} value={i} className="bg-[#171020]">
                    Image {i + 1} {img.startsWith("data:") ? "(New)" : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setRightZoom((z) => Math.min(z + 0.25, 3))}
                className="bg-white/10 hover:bg-white/25 rounded px-2 py-1 text-xs font-extrabold"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setRightZoom((z) => Math.max(z - 0.25, 0.5))}
                className="bg-white/10 hover:bg-white/25 rounded px-2 py-1 text-xs font-extrabold"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setRightZoom(1)}
                className="bg-white/10 hover:bg-white/25 rounded px-2 py-1 text-xs font-bold"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-xl bg-black/40 border border-white/5 flex items-center justify-center relative p-4 group cursor-grab active:cursor-grabbing">
            <img
              src={rightImage}
              alt="Right Preview"
              style={{ transform: `scale(${rightZoom})` }}
              className="max-h-full max-w-full object-contain transition-transform duration-100 ease-out pointer-events-none"
            />
            <span className="absolute bottom-2 left-2 bg-[#171020]/80 text-[10px] font-bold px-2 py-0.5 rounded text-white/80">
              Zoom: {rightZoom * 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnails Carousel Row */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <span className="block text-xs font-bold text-white/70 mb-2">Assign Image to Panel (Click left side of thumbnail for Left Panel, right side for Right Panel)</span>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative h-16 w-24 rounded-lg overflow-hidden border transition bg-white/5 flex-shrink-0 group ${
                leftIndex === idx
                  ? "border-[#ff6679] ring-2 ring-[#ff6679]/20"
                  : rightIndex === idx
                  ? "border-[#8e7dff] ring-2 ring-[#8e7dff]/20"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <img src={img} alt={`thumbnail ${idx}`} className="h-full w-full object-cover" />
              {/* Overlay controls inside thumbnail */}
              <div className="absolute inset-0 flex opacity-0 group-hover:opacity-100 transition duration-150">
                <button
                  type="button"
                  onClick={() => setLeftIndex(idx)}
                  className="flex-1 bg-black/60 hover:bg-[#ff6679]/85 text-[10px] font-bold text-center border-r border-white/10 flex items-center justify-center"
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => setRightIndex(idx)}
                  className="flex-1 bg-black/60 hover:bg-[#8e7dff]/85 text-[10px] font-bold text-center flex items-center justify-center"
                >
                  Right
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
