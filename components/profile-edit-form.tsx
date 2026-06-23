"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  name: string | null;
  phoneNumber: string | null;
  photoUrl: string | null;
  bio: string | null;
  instagram: string | null;
  twitter: string | null;
  city: string | null;
  favoriteCoffee: string | null;
  gender: string | null;
  dob: string | null;
}

interface ProfileEditFormProps {
  user: UserProfile;
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields state
  const [name, setName] = useState(user.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [bio, setBio] = useState(user.bio || "");
  const [instagram, setInstagram] = useState(user.instagram || "");
  const [twitter, setTwitter] = useState(user.twitter || "");
  const [city, setCity] = useState(user.city || "");
  const [favoriteCoffee, setFavoriteCoffee] = useState(user.favoriteCoffee || "");
  const [gender, setGender] = useState(user.gender || "");
  
  // Format Date to YYYY-MM-DD for date input
  const getFormattedDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };
  const [dob, setDob] = useState(getFormattedDate(user.dob));

  // Avatar state
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.photoUrl);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoBase64(base64);
      setPreviewUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          phoneNumber: phoneNumber.trim() || null,
          bio: bio.trim() || null,
          instagram: instagram.trim() || null,
          twitter: twitter.trim() || null,
          city: city.trim() || null,
          favoriteCoffee: favoriteCoffee || null,
          gender: gender || null,
          dob: dob ? new Date(dob).toISOString() : null,
          photoBase64
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSuccess(true);
      setIsEditing(false);
      
      // Force refresh data in layout and server components
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong saving changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2.5rem] bg-white p-8 card-shadow border border-[#e7dff0]">
      <div className="flex justify-between items-center border-b border-[#f4eff9] pb-4 mb-6">
        <div>
          <h3 className="text-2xl font-black text-[#21152d]">Profile Customization</h3>
          <p className="text-xs text-[#756a7d] mt-1">Configure your personal information, preferences, and display details.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-[#7441b5] hover:bg-[#5f32c4] text-white font-extrabold text-xs py-3 px-5 transition shadow"
          >
            Edit Settings
          </button>
        )}
      </div>

      {success && (
        <p className="mb-6 p-3 bg-green-100 text-green-800 rounded-xl text-xs font-semibold">
          ✓ Profile changes successfully saved!
        </p>
      )}

      {error && (
        <p className="mb-6 p-3 bg-red-100 text-red-800 rounded-xl text-xs font-semibold">
          ✗ {error}
        </p>
      )}

      {!isEditing ? (
        // STATIC VIEW STATE
        <div className="grid gap-6 sm:grid-cols-2 text-sm text-[#21152d]">
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Display Name</span>
              <span className="font-semibold text-base">{user.name || "No name set"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Phone Number</span>
              <span className="font-semibold">{user.phoneNumber || "No phone number set"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Short Bio</span>
              <p className="text-[#564b60] leading-relaxed mt-1 italic">{user.bio || "No biography added yet."}</p>
            </div>
            <div className="flex gap-4">
              {user.instagram && (
                <div>
                  <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Instagram</span>
                  <a href={`https://instagram.com/${user.instagram}`} target="_blank" className="text-[#7441b5] font-semibold hover:underline">
                    @{user.instagram}
                  </a>
                </div>
              )}
              {user.twitter && (
                <div>
                  <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Twitter</span>
                  <a href={`https://twitter.com/${user.twitter}`} target="_blank" className="text-[#7441b5] font-semibold hover:underline">
                    @{user.twitter}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-l border-[#f4eff9] pl-6">
            <div>
              <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">City Location</span>
              <span className="font-semibold">{user.city || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Favorite Coffee Style</span>
              <span className="font-semibold">{user.favoriteCoffee || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Gender</span>
              <span className="font-semibold">{user.gender || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider">Date of Birth</span>
              <span className="font-semibold">
                {user.dob ? new Date(user.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Not specified"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // EDITING FORM STATE
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Left side details form inputs */}
            <div className="space-y-4">
              {/* DP avatar upload with preview */}
              <div className="flex items-center gap-4 border-b border-[#f4eff9] pb-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border border-[#e7dff0] bg-slate-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <label className="block">
                  <span className="block text-xs font-bold text-[#756a7d] uppercase tracking-wider mb-1">Display Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-[#756a7d] file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#f4eff9] file:text-[#7441b5] hover:file:bg-[#e7dff0] cursor-pointer"
                  />
                </label>
              </div>

              <label className="block text-xs font-bold">Display Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
                  placeholder="e.g. Maya R."
                />
              </label>

              <label className="block text-xs font-bold">Phone Number
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
                  placeholder="e.g. +91 9876543210"
                />
              </label>

              <label className="block text-xs font-bold">Short Bio
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d] resize-none"
                  placeholder="Write a brief intro about yourself..."
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-bold">Instagram Handle
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
                    placeholder="username"
                  />
                </label>
                <label className="block text-xs font-bold">Twitter Handle
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
                    placeholder="username"
                  />
                </label>
              </div>
            </div>

            {/* Right side preference & demographic inputs */}
            <div className="space-y-4 border-l border-[#f4eff9] pl-6">
              <label className="block text-xs font-bold">City Location
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
                  placeholder="e.g. Bengaluru"
                />
              </label>

              <label className="block text-xs font-bold">Favorite Coffee Style
                <select
                  value={favoriteCoffee}
                  onChange={(e) => setFavoriteCoffee(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e7dff0] bg-white px-4 py-3 text-[#21152d]"
                >
                  <option value="">Select Coffee Style</option>
                  <option value="Espresso">Espresso</option>
                  <option value="Cappuccino">Cappuccino</option>
                  <option value="Flat White">Flat White</option>
                  <option value="Latte">Latte</option>
                  <option value="Cold Brew">Cold Brew</option>
                  <option value="V60 Pourover">V60 Pourover</option>
                  <option value="Cortado">Cortado</option>
                  <option value="Iced Americano">Iced Americano</option>
                  <option value="Other / Tea">Other / Tea</option>
                </select>
              </label>

              <label className="block text-xs font-bold">Gender
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e7dff0] bg-white px-4 py-3 text-[#21152d]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </label>

              <label className="block text-xs font-bold">Date of Birth
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]"
                />
              </label>
            </div>

          </div>

          <div className="flex gap-4 border-t border-[#f4eff9] pt-6">
            <button
              disabled={loading}
              type="submit"
              className="rounded-xl bg-[#21152d] hover:bg-[#171020] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 px-6 transition shadow"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              disabled={loading}
              type="button"
              onClick={() => {
                setIsEditing(false);
                setPreviewUrl(user.photoUrl);
                setPhotoBase64(null);
              }}
              className="rounded-xl border border-[#e7dff0] hover:bg-slate-50 text-[#564b60] font-bold text-xs py-3.5 px-6 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
