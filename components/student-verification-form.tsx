"use client";

import { useState, FormEvent } from "react";
import { SideBySidePreview } from "./side-by-side-preview";
import { useRouter } from "next/navigation";

interface StudentVerificationFormProps {
  onSuccess?: () => void;
}

export function StudentVerificationForm({ onSuccess }: StudentVerificationFormProps) {
  const router = useRouter();
  const [collegeName, setCollegeName] = useState("");
  const [cardImage, setCardImage] = useState<string | null>(null); // base64
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCardImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!collegeName.trim() || !cardImage) {
      setError("Please fill in your college name and upload your student card.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/student-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeName, cardImage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setSuccess("Your student verification request has been submitted! Pending administrator approval.");
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      } else {
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-600">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-600">
          🎉 {success}
        </div>
      )}

      <label className="block text-sm font-bold text-[#564b60]">
        College / University Name
        <input
          type="text"
          required
          value={collegeName}
          onChange={(e) => setCollegeName(e.target.value)}
          placeholder="e.g. Gurugram University"
          className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5] text-sm"
        />
      </label>

      <div>
        <span className="block text-sm font-bold text-[#564b60] mb-2">Upload Student ID Card Photo</span>
        <p className="text-xs text-[#756a7d] mb-4">Paste clipboard image (Ctrl+V) or click to choose file.</p>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <label
            tabIndex={0}
            onPaste={handlePaste}
            className="flex h-16 flex-col items-center justify-center rounded-xl border border-dashed border-[#7441b5] bg-[#7441b5]/5 px-5 cursor-pointer font-bold text-[#7441b5] transition hover:bg-[#7441b5]/10 text-xs text-center outline-none focus:ring-2 focus:ring-[#7441b5]"
          >
            <span>Select File or Paste Clipboard (Ctrl+V)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {cardImage && (
            <div
              onClick={() => setPreviewOpen(true)}
              className="relative h-20 w-32 rounded-xl overflow-hidden border border-[#e7dff0] bg-black/5 cursor-zoom-in group flex-shrink-0"
            >
              <img src={cardImage} alt="Card preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold uppercase transition">
                🔍 Zoom & Compare
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto rounded-xl bg-[#ff6679] hover:bg-[#eb4e64] disabled:bg-slate-400 text-white font-extrabold px-8 py-3.5 shadow-lg shadow-[#ff6679]/15 text-xs transition"
      >
        {loading ? "Submitting Request..." : "Request Student Verification"}
      </button>

      {previewOpen && cardImage && (
        <SideBySidePreview
          images={[cardImage]}
          initialSelectedIndex={0}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </form>
  );
}
