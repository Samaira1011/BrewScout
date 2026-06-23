"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";

interface CafeFormProps {
  initialData?: {
    id: string;
    slug: string;
    name: string;
    address: string;
    city: string;
    neighborhood: string;
    description: string;
    openingHours: { open: string; close: string } | string;
    gradient: string;
    menuDesc: string;
    menuPhotoUrl: string;
    instagramUrl: string;
    businessProofUrl: string;
    vibeTags: string[];
    foodTags: string[];
    galleryPhotos?: string[]; // Multiple gallery photos
  };
}

const PRESET_GRADIENTS = [
  { name: "Sunset Pink", value: "from-[#ff9a8b] to-[#ff6a88]", preview: "bg-gradient-to-br from-[#ff9a8b] to-[#ff6a88]" },
  { name: "Neon Purple", value: "from-[#8e7dff] to-[#5f32c4]", preview: "bg-gradient-to-br from-[#8e7dff] to-[#5f32c4]" },
  { name: "Amber Glow", value: "from-[#f9d423] to-[#ff7b54]", preview: "bg-gradient-to-br from-[#f9d423] to-[#ff7b54]" },
  { name: "Mint Fresh", value: "from-[#4facfe] to-[#00f2fe]", preview: "bg-gradient-to-br from-[#4facfe] to-[#00f2fe]" },
  { name: "Emerald Sun", value: "from-[#11998e] to-[#38ef7d]", preview: "bg-gradient-to-br from-[#11998e] to-[#38ef7d]" },
  { name: "Midnight Teal", value: "from-[#111827] to-[#047857]", preview: "bg-gradient-to-br from-[#111827] to-[#047857]" }
];

const VIBE_OPTIONS = [
  "Plant-filled", "Date-worthy", "Brunch", "Deep focus", "Work-friendly", "Quiet", "Late-night", "Main character", "Music"
];

const FOOD_OPTIONS = [
  "Coffee", "Bakery", "Sandwiches", "Desserts"
];

const TIME_OPTIONS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "2:00 AM"
];

export function CafeForm({ initialData }: CafeFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  // Basic Info Fields
  const [name, setName] = useState(initialData?.name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "Bengaluru");
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || "");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Hours
  let initialHours = { open: "9:00 AM", close: "10:00 PM" };
  if (initialData?.openingHours) {
    try {
      initialHours = typeof initialData.openingHours === "string" 
        ? JSON.parse(initialData.openingHours) 
        : initialData.openingHours;
    } catch (_) {}
  }
  const [openTime, setOpenTime] = useState(initialHours.open);
  const [closeTime, setCloseTime] = useState(initialHours.close);

  // Gradient & Instagram Links
  const [gradient, setGradient] = useState(initialData?.gradient || PRESET_GRADIENTS[0].value);
  const [instagramUrl, setInstagramUrl] = useState(initialData?.instagramUrl || "");

  // Tags & Custom Tag States
  const [selectedVibes, setSelectedVibes] = useState<string[]>(initialData?.vibeTags || []);
  const [selectedFoods, setSelectedFoods] = useState<string[]>(initialData?.foodTags || []);
  const [vibeOptions, setVibeOptions] = useState<string[]>(VIBE_OPTIONS);
  const [foodOptions, setFoodOptions] = useState<string[]>(FOOD_OPTIONS);
  const [customVibeInput, setCustomVibeInput] = useState("");
  const [customFoodInput, setCustomFoodInput] = useState("");

  // Merge initial custom tags into local options
  useEffect(() => {
    if (initialData?.vibeTags) {
      setVibeOptions(prev => Array.from(new Set([...prev, ...initialData.vibeTags])));
    }
    if (initialData?.foodTags) {
      setFoodOptions(prev => Array.from(new Set([...prev, ...initialData.foodTags])));
    }
  }, [initialData]);

  // Menu Info
  const [menuDesc, setMenuDesc] = useState(initialData?.menuDesc || "");

  // Single uploads (Cover, Menu, Proof)
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);

  const [coverPreview, setCoverPreview] = useState<string>(initialData?.businessProofUrl ? "/uploads/placeholder-cafe.jpg" : ""); 
  const [menuPreview, setMenuPreview] = useState<string>(initialData?.menuPhotoUrl || "");
  const [proofPreview, setProofPreview] = useState<string>(initialData?.businessProofUrl || "");

  // Multiple Gallery Uploads
  const [galleryImages, setGalleryImages] = useState<string[]>([]); // New uploads (base64)
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>(initialData?.galleryPhotos || []); // Retained URLs

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tag helper actions
  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  const toggleFood = (food: string) => {
    setSelectedFoods(prev => 
      prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
    );
  };

  const addCustomVibe = () => {
    const trimmed = customVibeInput.trim();
    if (!trimmed) return;
    if (!vibeOptions.includes(trimmed)) {
      setVibeOptions(prev => [...prev, trimmed]);
    }
    if (!selectedVibes.includes(trimmed)) {
      setSelectedVibes(prev => [...prev, trimmed]);
    }
    setCustomVibeInput("");
  };

  const addCustomFood = () => {
    const trimmed = customFoodInput.trim();
    if (!trimmed) return;
    if (!foodOptions.includes(trimmed)) {
      setFoodOptions(prev => [...prev, trimmed]);
    }
    if (!selectedFoods.includes(trimmed)) {
      setSelectedFoods(prev => [...prev, trimmed]);
    }
    setCustomFoodInput("");
  };

  // Convert File to base64
  const processFile = (file: File, callback: (base64: string) => void) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "menu" | "proof") => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, (base64) => {
      if (type === "cover") {
        setCoverImage(base64);
        setCoverPreview(base64);
      } else if (type === "menu") {
        setMenuImage(base64);
        setMenuPreview(base64);
      } else if (type === "proof") {
        setProofImage(base64);
        setProofPreview(base64);
      }
    });
  };

  // Multiple Gallery Change
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      processFile(files[i], (base64) => {
        setGalleryImages(prev => [...prev, base64]);
      });
    }
  };

  // Clipboard Paste Support
  const handlePaste = (e: React.ClipboardEvent, type: "cover" | "menu" | "proof" | "gallery") => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file, (base64) => {
            if (type === "cover") {
              setCoverImage(base64);
              setCoverPreview(base64);
            } else if (type === "menu") {
              setMenuImage(base64);
              setMenuPreview(base64);
            } else if (type === "proof") {
              setProofImage(base64);
              setProofPreview(base64);
            } else if (type === "gallery") {
              setGalleryImages(prev => [...prev, base64]);
            }
          });
        }
      }
    }
  };

  const removeGalleryImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setGalleryImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name || !address || !city || !description) {
      setError("Please fill in all basic fields.");
      setLoading(false);
      return;
    }

    let finalProof = proofImage;
    if (!isEdit && !proofImage) {
      finalProof = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    }

    let finalCover = coverImage;
    if (!isEdit && !coverImage) {
      finalCover = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    }

    try {
      const url = isEdit ? `/api/cafes/${initialData.slug}` : "/api/cafes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city,
          neighborhood,
          description,
          openingHours: JSON.stringify({ open: openTime, close: closeTime }),
          gradient,
          instagramUrl,
          vibeTags: selectedVibes,
          foodTags: selectedFoods,
          menuDesc,
          coverImage: finalCover,
          menuImage,
          proofImage: finalProof,
          galleryImages,             // New uploads
          existingGalleryUrls        // Kept items
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit cafe details.");
      }

      setSuccess(isEdit ? "Listing updated successfully!" : "Cafe submitted! Pending verification from our team.");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto pb-24 text-[#21152d]">
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-sm font-semibold text-red-600">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-sm font-semibold text-emerald-600">
          🎉 {success}
        </div>
      )}

      {/* SECTION 1: BASIC INFORMATION */}
      <section className="rounded-3xl bg-white p-7 card-shadow border border-[#e7dff0]/60 space-y-6">
        <div>
          <h2 className="text-2xl font-black">Basic Information</h2>
          <p className="text-sm text-[#756a7d] mt-1">Let customers know your name and where to find you.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-bold text-[#564b60]">
            Cafe / Restaurant Name *
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5]"
              placeholder="e.g. Brewed Awakenings"
            />
          </label>

          <label className="block text-sm font-bold text-[#564b60]">
            Neighborhood / Area
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5]"
              placeholder="e.g. Indiranagar"
            />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <label className="block sm:col-span-2 text-sm font-bold text-[#564b60]">
            Street Address *
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5]"
              placeholder="e.g. 24, 12th Main, Indiranagar"
            />
          </label>

          <label className="block text-sm font-bold text-[#564b60]">
            City *
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5]"
              placeholder="e.g. Bengaluru"
            />
          </label>
        </div>

        <label className="block text-sm font-bold text-[#564b60]">
          Description *
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5] leading-6 resize-none"
            placeholder="Share the story of your place, the seating, the light, or what makes your coffee and food special..."
          />
        </label>
      </section>

      {/* SECTION 2: HOURS & LINKS */}
      <section className="rounded-3xl bg-white p-7 card-shadow border border-[#e7dff0]/60 space-y-6">
        <div>
          <h2 className="text-2xl font-black">Hours & Links</h2>
          <p className="text-sm text-[#756a7d] mt-1">Specify operational details and social links.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-bold text-[#564b60]">
            Open Time
            <select
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] bg-white px-4 py-3 text-[#21152d] outline-[#7441b5]"
            >
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-[#564b60]">
            Close Time
            <select
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] bg-white px-4 py-3 text-[#21152d] outline-[#7441b5]"
            >
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-bold text-[#564b60]">
          Instagram URL
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5]"
            placeholder="https://instagram.com/yourhandle"
          />
        </label>
      </section>

      {/* SECTION 3: VISUAL DESIGN & VIBES */}
      <section className="rounded-3xl bg-white p-7 card-shadow border border-[#e7dff0]/60 space-y-6">
        <div>
          <h2 className="text-2xl font-black">Visual & Vibe Design</h2>
          <p className="text-sm text-[#756a7d] mt-1">Make your page stand out with a beautiful theme and specific mood tags.</p>
        </div>

        {/* Gradient Picker */}
        <div>
          <span className="block text-sm font-bold text-[#564b60] mb-3">Gradient Accent Banner</span>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {PRESET_GRADIENTS.map(item => (
              <button
                type="button"
                key={item.name}
                onClick={() => setGradient(item.value)}
                className={`rounded-2xl p-4 flex flex-col justify-between items-start text-left border-2 transition ${
                  gradient === item.value 
                    ? "border-[#7441b5] ring-2 ring-[#7441b5]/15" 
                    : "border-transparent bg-[#fbf9ff] hover:bg-[#f4eff9]"
                }`}
              >
                <div className={`h-8 w-full rounded-lg ${item.preview}`} />
                <span className="text-xs font-black mt-3 text-[#21152d]">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cover Photo with paste support */}
        <div>
          <span className="block text-sm font-bold text-[#564b60]">Primary Header Photo</span>
          <p className="text-xs text-[#756a7d] mt-0.5 mb-3">Upload a cover photo. You can also paste an image here directly using Ctrl+V.</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label 
              tabIndex={0}
              onPaste={(e) => handlePaste(e, "cover")}
              className="flex h-16 flex-col items-center justify-center rounded-xl border border-dashed border-[#7441b5] bg-[#7441b5]/5 px-5 cursor-pointer font-bold text-[#7441b5] transition hover:bg-[#7441b5]/10 focus:ring-2 focus:ring-[#7441b5] outline-none text-center"
            >
              <span>Select File or Paste Clipboard (Ctrl+V)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "cover")}
                className="hidden"
              />
            </label>
            {coverPreview && (
              <div className="relative h-20 w-36 rounded-xl overflow-hidden border border-[#e7dff0] bg-black/5">
                <img src={coverPreview} alt="Cover Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Vibe Tags & Custom Tag Input */}
        <div className="space-y-4">
          <div>
            <span className="block text-sm font-bold text-[#564b60]">Vibe Tags</span>
            <p className="text-xs text-[#756a7d] mt-0.5">Select from presets or add custom vibes below.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {vibeOptions.map(vibe => {
              const active = selectedVibes.includes(vibe);
              return (
                <button
                  type="button"
                  key={vibe}
                  onClick={() => toggleVibe(vibe)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition border ${
                    active 
                      ? "bg-[#7441b5] text-white border-transparent" 
                      : "bg-[#fbf9ff] text-[#564b60] border-[#e7dff0] hover:bg-[#f4eff9]"
                  }`}
                >
                  {vibe}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. Pet-friendly"
              value={customVibeInput}
              onChange={(e) => setCustomVibeInput(e.target.value)}
              className="flex-1 rounded-xl border border-[#e7dff0] px-3 py-2 text-xs outline-[#7441b5]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomVibe();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomVibe}
              className="rounded-xl bg-[#7441b5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5f32c4]"
            >
              + Add Vibe
            </button>
          </div>
        </div>

        {/* Food Tags & Custom Tag Input */}
        <div className="space-y-4">
          <div>
            <span className="block text-sm font-bold text-[#564b60]">Food Offerings & Tags</span>
            <p className="text-xs text-[#756a7d] mt-0.5">Select menu highlights or type custom offerings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map(food => {
              const active = selectedFoods.includes(food);
              return (
                <button
                  type="button"
                  key={food}
                  onClick={() => toggleFood(food)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition border ${
                    active 
                      ? "bg-[#ff6679] text-white border-transparent" 
                      : "bg-[#fbf9ff] text-[#564b60] border-[#e7dff0] hover:bg-[#f4eff9]"
                  }`}
                >
                  {food}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. Cocktails"
              value={customFoodInput}
              onChange={(e) => setCustomFoodInput(e.target.value)}
              className="flex-1 rounded-xl border border-[#e7dff0] px-3 py-2 text-xs outline-[#7441b5]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomFood();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomFood}
              className="rounded-xl bg-[#ff6679] px-4 py-2 text-xs font-bold text-white hover:bg-[#eb4e64]"
            >
              + Add Offering
            </button>
          </div>
        </div>

        {/* Cafe Gallery (Multiple Photo Upload) */}
        <div className="border-t border-[#e7dff0] pt-6 space-y-4">
          <div>
            <h3 className="text-lg font-black">Photo Gallery</h3>
            <p className="text-sm text-[#756a7d] mt-0.5">Add multiple photos of your interiors, coffee, food, and storefront.</p>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {/* Display Pre-existing Gallery */}
            {existingGalleryUrls.map((url, index) => (
              <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border border-[#e7dff0] bg-black/5 group">
                <img src={url} alt="Gallery item" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index, true)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/75 text-white flex items-center justify-center text-xs font-bold hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Display Newly Uploaded Gallery */}
            {galleryImages.map((base64, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-[#e7dff0] bg-black/5 group">
                <img src={base64} alt="Gallery item upload" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index, false)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/75 text-white flex items-center justify-center text-xs font-bold hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Gallery Upload Slot with Paste Support */}
            <label 
              tabIndex={0}
              onPaste={(e) => handlePaste(e, "gallery")}
              className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#7441b5]/30 bg-[#7441b5]/5 cursor-pointer font-bold text-[#7441b5] transition hover:bg-[#7441b5]/10 text-center p-3 outline-none focus:ring-2 focus:ring-[#7441b5]"
            >
              <span className="text-2xl">📸</span>
              <span className="text-xs mt-2">Add Photo(s)</span>
              <span className="text-[10px] text-[#756a7d] mt-1">(Select, Drag, or Paste Ctrl+V)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 4: MENU MANAGEMENT */}
      <section className="rounded-3xl bg-white p-7 card-shadow border border-[#e7dff0]/60 space-y-6">
        <div>
          <h2 className="text-2xl font-black">Menu Information</h2>
          <p className="text-sm text-[#756a7d] mt-1">Provide pricing and options for customers to check before visiting.</p>
        </div>

        <label className="block text-sm font-bold text-[#564b60]">
          Text Menu Items
          <textarea
            rows={5}
            value={menuDesc}
            onChange={(e) => setMenuDesc(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 text-[#21152d] outline-[#7441b5] leading-6 resize-none"
            placeholder="e.g. &#10;Specialty Coffee: Espresso ($3), Latte ($4.5), Pour Over ($5)&#10;Bakery: Butter Croissant ($3.5), Almond Croissant ($4.5)&#10;Mains: Avocado Sourdough ($8)"
          />
        </label>

        {/* Menu Image with Paste Support */}
        <div>
          <span className="block text-sm font-bold text-[#564b60]">Upload Menu Photo / PDF Image</span>
          <p className="text-xs text-[#756a7d] mt-0.5 mb-3">Upload a visual printout of your menu. Paste (Ctrl+V) also works.</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label 
              tabIndex={0}
              onPaste={(e) => handlePaste(e, "menu")}
              className="flex h-16 flex-col items-center justify-center rounded-xl border border-dashed border-[#7441b5] bg-[#7441b5]/5 px-5 cursor-pointer font-bold text-[#7441b5] transition hover:bg-[#7441b5]/10 focus:ring-2 focus:ring-[#7441b5] outline-none text-center"
            >
              <span>Select File or Paste Clipboard (Ctrl+V)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "menu")}
                className="hidden"
              />
            </label>
            {menuPreview && (
              <div className="relative h-20 w-36 rounded-xl overflow-hidden border border-[#e7dff0] bg-black/5">
                <img src={menuPreview} alt="Menu Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: BUSINESS VERIFICATION */}
      <section className="rounded-3xl bg-white p-7 card-shadow border border-[#e7dff0]/60 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black">Business Verification</h2>
            <span className="rounded-full bg-[#ff6679]/10 px-2.5 py-0.5 text-xs font-bold text-[#ff6679]">Required</span>
          </div>
          <p className="text-sm text-[#756a7d] mt-1">To ensure only genuine owners manage listings, please verify ownership.</p>
        </div>

        <div className="rounded-2xl bg-[#fbf9ff] p-5 border border-[#e7dff0] text-xs leading-5 text-[#564b60] space-y-2">
          <p className="font-bold text-[#21152d]">Acceptable Documents:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Business License / Incorporating Document</li>
            <li>GST / VAT registration certificate</li>
            <li>Utility bill showing business name and address</li>
            <li>Photos of the storefront with sign board and staff</li>
          </ul>
        </div>

        {/* Business Document with Paste Support */}
        <div>
          <span className="block text-sm font-bold text-[#564b60]">Upload Verification Document (Image)</span>
          <p className="text-xs text-[#756a7d] mt-0.5 mb-3">Your uploaded documents are private and only visible to administrators. Paste (Ctrl+V) also works.</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label 
              tabIndex={0}
              onPaste={(e) => handlePaste(e, "proof")}
              className="flex h-16 flex-col items-center justify-center rounded-xl border border-dashed border-[#7441b5] bg-[#7441b5]/5 px-5 cursor-pointer font-bold text-[#7441b5] transition hover:bg-[#7441b5]/10 focus:ring-2 focus:ring-[#7441b5] outline-none text-center"
            >
              <span>Select File or Paste Clipboard (Ctrl+V)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "proof")}
                className="hidden"
              />
            </label>
            {proofPreview && (
              <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-[#e7dff0] bg-black/5 flex items-center justify-center">
                <img src={proofPreview} alt="Verification Document" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SUBMIT BUTTONS */}
      <div className="flex items-center justify-end gap-4">
        <Link 
          href="/dashboard" 
          className="rounded-2xl border border-[#e7dff0] bg-white px-8 py-4 font-bold text-[#564b60] hover:bg-[#fbf9ff]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[#ff6679] hover:bg-[#eb4e64] disabled:bg-slate-400 text-white font-extrabold px-10 py-4 shadow-lg shadow-[#ff6679]/15"
        >
          {loading ? "Submitting..." : isEdit ? "Save Changes" : "Submit & Request Verification"}
        </button>
      </div>
    </form>
  );
}
