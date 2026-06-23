"use client";

import { useState } from "react";

interface MenuViewerProps {
  menuDesc?: string | null;
  menuPhotoUrl?: string | null;
}

export function MenuViewer({ menuDesc, menuPhotoUrl }: MenuViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "photo">(
    menuDesc ? "text" : "photo"
  );

  const hasText = !!menuDesc && menuDesc.trim().length > 0;
  const hasPhoto = !!menuPhotoUrl && menuPhotoUrl.trim().length > 0;
  const hasMenu = hasText || hasPhoto;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-3 w-full rounded-xl border border-white/20 px-5 py-3.5 font-bold text-white hover:bg-white/10 hover:border-white transition-colors"
      >
        View menu
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] grid place-items-center bg-[#171020]/90 p-4 md:p-8 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-3xl rounded-[2.2rem] bg-white p-6 md:p-8 text-[#21152d] card-shadow max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e7dff0] pb-4">
              <div>
                <h3 className="text-2xl font-black">Cafe Menu</h3>
                <p className="text-xs text-[#756a7d] mt-0.5">Explore drink lists, pastries, and main offerings.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#f4eff9] hover:bg-[#ff6679]/10 hover:text-[#ff6679] transition font-black text-sm"
              >
                ✕
              </button>
            </div>

            {/* Tab switchers if both available */}
            {hasText && hasPhoto && (
              <div className="mt-5 flex rounded-xl bg-[#f4eff9] p-1">
                <button
                  onClick={() => setActiveTab("text")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-black transition ${
                    activeTab === "text" 
                      ? "bg-white text-[#7441b5] card-shadow" 
                      : "text-[#756a7d] hover:text-[#21152d]"
                  }`}
                >
                  📝 Menu List
                </button>
                <button
                  onClick={() => setActiveTab("photo")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-black transition ${
                    activeTab === "photo" 
                      ? "bg-white text-[#7441b5] card-shadow" 
                      : "text-[#756a7d] hover:text-[#21152d]"
                  }`}
                >
                  🖼️ Photo Menu
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="mt-6 flex-1 overflow-y-auto min-h-[30vh]">
              {!hasMenu ? (
                <div className="text-center py-12 text-[#756a7d]">
                  <span className="text-4xl block mb-3">🍽️</span>
                  <p className="font-bold">No menu uploaded by the business yet.</p>
                  <p className="text-xs mt-1">Check back later or ask their staff on your visit!</p>
                </div>
              ) : activeTab === "text" && hasText ? (
                <div className="bg-[#fbf9ff] border border-[#e7dff0]/60 rounded-2xl p-6 md:p-8 whitespace-pre-line leading-8 font-semibold text-lg text-[#564b60]">
                  {menuDesc}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-[#fbf9ff] border border-[#e7dff0]/60 rounded-2xl p-2 min-h-[40vh] relative group overflow-hidden">
                  {menuPhotoUrl ? (
                    <img 
                      src={menuPhotoUrl} 
                      alt="Cafe Menu Print" 
                      className="max-h-[50vh] object-contain rounded-xl shadow"
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#756a7d]">No photo menu uploaded.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-[#e7dff0] pt-4 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-[#ff6679] hover:bg-[#eb4e64] text-white font-extrabold px-6 py-3 text-sm transition"
              >
                Close Menu
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
