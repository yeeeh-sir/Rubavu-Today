import React, { useRef, useState } from "react";
import { getProfileImageUrl, getStoredUser, uploadProfileImage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import rubavuLogo from "../../Rubavu.jpeg";

function Profile() {
  const { refreshUser } = useAuth();
  const user = getStoredUser();
  const currentProfileImage = getProfileImageUrl(user);

  const [previewImage, setPreviewImage] = useState(currentProfileImage);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Shyiramo ifoto ya JPG, PNG cyangwa WebP gusa.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setPreviewImage(reader.result);
    };

    reader.readAsDataURL(file);

  };

  const handleUpload = async () => {
    const file = selectedFile;

    if (!file) {
      setErrorMessage("Hitamo ifoto mbere yo kuyibika.");
      return;
    }

    setUploading(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await uploadProfileImage(file);
      setStatusMessage("Ifoto yavuguruwe neza.");
      await refreshUser();
      const updated = getStoredUser();
      setPreviewImage(getProfileImageUrl(updated));
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setErrorMessage(err?.message || "Ntibyashobotse kubika ifoto.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full font-serif">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <img src={rubavuLogo} alt="Rubavu Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Umwirondoro w'umukoresha
          </h1>
        </div>

        <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            {previewImage ? (
              <img
                src={previewImage}
                alt={user?.full_name || "Profile"}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-red-600 text-3xl font-black text-white shadow-lg">
                {(user?.full_name || "U").trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="w-full min-w-0">
            <p className="text-sm font-bold text-slate-900">
              Ifoto y'umwirondoro
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Hitamo ifoto (JPG, PNG cyangwa WebP) kugira ngo iboneke ku nkuru zawe.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={triggerFileSelect}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Hitamo ifoto
              </button>

              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Birimo kubikwa..." : "Bika ifoto"}
                </button>
              )}

              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewImage(currentProfileImage);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100"
                >
                  Kureka
                </button>
              )}
            </div>

            {statusMessage && (
              <p className="mt-2 text-xs font-semibold text-emerald-600" role="status">
                ✓ {statusMessage}
              </p>
            )}

            {errorMessage && (
              <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
                ✕ {errorMessage}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5 text-sm font-sans">
          <div className="border-b border-slate-100 pb-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Full Name
            </span>
            <p className="font-semibold text-slate-800 mt-1 font-serif text-base">
              {user?.full_name || "N/A"}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Imeyili
            </span>
            <p className="font-semibold text-slate-800 mt-1 font-serif text-base">
              {user?.email || "N/A"}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role
            </span>
            <p className="font-semibold text-blue-600 mt-1 font-serif text-base">
              {user?.role || "N/A"}
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account Status
            </span>
            <span className="inline-block mt-1.5 bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-xs">
              {user?.status || "Active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;