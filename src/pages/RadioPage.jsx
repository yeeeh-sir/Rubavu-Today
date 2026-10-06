import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  Pause,
  Phone,
  Play,
  Send,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRadio } from "../context/RadioContext";
import { useLanguage } from "../context/LanguageContext";
import { SiteSEO } from "../components/SEO/SEO";
import { Link } from "react-router-dom";
import radioLogo from "../Rubavu Today Radio.png";

const RADIO_SHARE_URL = "https://www.rubavutoday.com/radio";
const RADIO_SOCIAL_DESCRIPTION =
  "Amakuru, ibiganiro, imyidagaduro, umuziki n'izindi porogaramu zo muri Rubavu.";

function RadioPage() {
  const [shareMessage, setShareMessage] = useState("");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const { language } = useLanguage();
  const rw = language === "rw";
  const {
    queue,
    currentItem,
    isPlaying,
    isLoading,
    error,
    volume,
    isMuted,
    togglePlay,
    playItem,
    setVolume,
    toggleMute,
    hasLoadedRadio,
  } = useRadio();

  const playingNow = currentItem;
  const playableItem = currentItem || queue[0];
  const radioShareUrl = RADIO_SHARE_URL;
  const pageDescription = rw
    ? "Amakuru, ibiganiro, imyidagaduro, umuziki n'izindi porogaramu zo muri Rubavu."
    : "News, discussions, entertainment, music and more from across Rubavu.";
  const statusText = error
    ? rw ? "Ntibibashije gukina" : "Unavailable"
    : isLoading
      ? rw ? "Birimo guhuza..." : "Connecting..."
      : isPlaying
        ? rw ? "Uri kumva" : "Playing"
        : !hasLoadedRadio
          ? rw ? "Birimo kugenzura..." : "Checking availability..."
          : playableItem
            ? rw ? "Yiteguye kumvwa" : "Ready to play"
            : rw ? "Ntibiri gukorera ubu" : "Offline";
  const statusColor = error
    ? "text-red-400"
    : isPlaying
      ? "text-emerald-400"
      : isLoading || !hasLoadedRadio
        ? "text-amber-300"
        : "text-slate-400";

    const copyRadioLink = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(radioShareUrl);
        } else {
          const linkInput = document.createElement("textarea");
          linkInput.value = radioShareUrl;
          linkInput.setAttribute("readonly", "");
          linkInput.style.position = "fixed";
          linkInput.style.opacity = "0";
          document.body.appendChild(linkInput);
          linkInput.select();
          const copied = document.execCommand("copy");
          linkInput.remove();
          if (!copied) throw new Error("Clipboard unavailable");
        }
        setShareMenuOpen(false);
        setShareMessage(rw ? "Ihuza ryakoporowe." : "Radio link copied.");
      } catch {
        setShareMessage(rw ? "Ntibyashobotse gukoporora ihuza." : "Could not copy the radio link.");
      }
    };

    const shareRadio = async () => {
      if (!navigator.share) {
        await copyRadioLink();
        return;
      }
      try {
        await navigator.share({
          title: "RubavuToday Radio",
          text: pageDescription,
          url: radioShareUrl,
        });
        setShareMenuOpen(false);
        setShareMessage("");
      } catch (shareError) {
        if (shareError.name !== "AbortError") await copyRadioLink();
      }
    };

    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(
      `RubavuToday Radio - ${pageDescription} ${radioShareUrl}`
    )}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(radioShareUrl)}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(radioShareUrl)}`;
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(radioShareUrl)}&title=${encodeURIComponent("RubavuToday Radio")}`;
    const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(radioShareUrl)}&text=${encodeURIComponent(`RubavuToday Radio - ${pageDescription}`)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(radioShareUrl)}&text=${encodeURIComponent(`RubavuToday Radio - ${pageDescription}`)}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent("RubavuToday Radio")}&body=${encodeURIComponent(`${pageDescription} ${radioShareUrl}`)}`;

  return (
    <>
      <SiteSEO
        title="RubavuToday Radio"
        description={RADIO_SOCIAL_DESCRIPTION}
        canonicalPath="/radio"
        image="/Rubavu-Today-Radio.png"
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 flex flex-col items-center gap-3 border-b border-slate-200 pb-5 text-center">
          <div className="flex w-full min-w-0 flex-col items-center gap-2">
            <img
              src={radioLogo}
              alt="RubavuToday Radio"
              className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
            />
            <div className="min-w-0">
              <h1 className="break-words font-masthead text-xl font-extrabold uppercase tracking-tight text-red-700 sm:text-2xl">
                RubavuToday Radio
              </h1>
              <p className="mx-auto mt-1 max-w-2xl break-words text-sm leading-relaxed text-slate-700">
                {pageDescription}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-9 max-w-full items-center justify-center gap-2 border border-red-200 px-3 py-1.5 text-center text-sm font-bold leading-snug text-red-700 transition hover:border-red-600 hover:bg-red-50 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {rw ? "Garuka ku makuru" : "Back to Rubavu Today"}
          </Link>
        </header>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
          <div className="flex flex-col gap-6 p-4 sm:p-8 md:flex-row md:items-center md:gap-8">
            <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-44 md:w-56">
              <img src={radioLogo} alt="RubavuToday Radio" className="h-28 w-28 object-contain" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-body text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-400">
                {rw ? "Porogaramu iriho" : "Current program"}
              </p>
              <h2 className="mt-1 break-words font-masthead text-xl font-extrabold leading-tight text-white sm:text-2xl">
                {playingNow?.title || "Rubavu Today Radio"}
              </h2>
              {playingNow?.description && (
                <p className="mt-2 break-words text-sm leading-relaxed text-slate-300">
                  {playingNow.description}
                </p>
              )}
              <div className="mt-3 flex min-w-0 items-center gap-3">
                <p className={`min-w-0 break-words text-sm font-semibold leading-relaxed ${statusColor}`} role="status" aria-live="polite">
                  {statusText}{error ? `: ${error}` : ""}
                </p>
                <div
                  className={`radio-waveform ${isPlaying ? "is-playing" : ""}`}
                  aria-hidden="true"
                >
                  <span className="h-2" style={{ animationDelay: "0ms" }} />
                  <span className="h-4" style={{ animationDelay: "100ms" }} />
                  <span className="h-3" style={{ animationDelay: "200ms" }} />
                  <span className="h-5" style={{ animationDelay: "300ms" }} />
                  <span className="h-3" style={{ animationDelay: "400ms" }} />
                  <span className="h-4" style={{ animationDelay: "500ms" }} />
                  <span className="h-2" style={{ animationDelay: "600ms" }} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-6">
                <button
                  onClick={() => (currentItem ? togglePlay() : playableItem && playItem(playableItem))}
                  disabled={!playableItem || isLoading}
                  className="inline-flex items-center gap-3 rounded-full bg-red-600 px-6 py-3 font-body text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-900/30 transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                  {isPlaying ? (rw ? "Hagarika" : "Pause") : rw ? "Kumva" : "Play"}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="text-slate-300 transition hover:text-white"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="radio-range w-24 accent-red-600 sm:w-36"
                    aria-label="Radio volume"
                  />
                  <span className="w-9 text-xs tabular-nums text-slate-400">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShareMenuOpen((open) => !open)}
                    className="inline-flex min-h-11 items-center gap-2 border border-slate-600 px-3 text-xs font-bold text-slate-100 transition hover:border-red-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={rw ? "Sangira RubavuToday Radio" : "Share RubavuToday Radio"}
                    aria-expanded={shareMenuOpen}
                    aria-controls="radio-share-options"
                  >
                    <Share2 className="h-4 w-4" />
                    {rw ? "Sangira" : "Share"}
                  </button>
                  {shareMenuOpen && (
                    <div
                      id="radio-share-options"
                      className="absolute left-0 top-full z-30 mt-2 max-h-[70vh] w-[min(88vw,20rem)] overflow-y-auto border border-slate-700 bg-slate-900 p-3 text-white shadow-xl xl:bottom-0 xl:left-full xl:top-auto xl:mt-0 xl:ml-2"
                    >
                      <p className="mb-2 text-xs font-bold uppercase text-slate-300">
                        {rw ? "Sangira kuri" : "Share on"}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareMenuOpen(false)} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-emerald-500 hover:text-emerald-300">
                          <span className="relative grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#25D366] text-white" aria-hidden="true">
                            <MessageCircle className="h-5 w-5" />
                            <Phone className="absolute h-2 w-2" />
                          </span>
                          <span className="min-w-0">WhatsApp</span>
                        </a>
                        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareMenuOpen(false)} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-blue-500 hover:text-blue-300">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1877F2] text-sm font-black text-white" aria-hidden="true">f</span>
                          <span className="min-w-0">Facebook</span>
                        </a>
                        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareMenuOpen(false)} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-sky-500 hover:text-sky-300">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-[#0A66C2] text-[10px] font-black text-white" aria-hidden="true">in</span>
                          <span className="min-w-0">LinkedIn</span>
                        </a>
                        <a href={redditUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareMenuOpen(false)} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-orange-500 hover:text-orange-300">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#FF4500] text-white" aria-hidden="true"><MessageCircle className="h-3 w-3" /></span>
                          <span className="min-w-0">Reddit</span>
                        </a>
                        <a href={xUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareMenuOpen(false)} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-slate-400 hover:text-white">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-black" aria-hidden="true">X</span>
                          <span className="min-w-0">X</span>
                        </a>
                        <a href={telegramUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareMenuOpen(false)} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-sky-500 hover:text-sky-300">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-500 text-white" aria-hidden="true"><Send className="h-3 w-3" /></span>
                          <span className="min-w-0">Telegram</span>
                        </a>
                        <a href={emailUrl} onClick={() => setShareMenuOpen(false)} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-amber-400 hover:text-amber-200">
                          <Mail className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                          <span className="min-w-0">Email</span>
                        </a>
                        <button type="button" onClick={shareRadio} className="inline-flex min-h-11 min-w-0 items-center gap-2 border border-slate-700 px-2 text-xs font-semibold leading-tight hover:border-red-400 hover:text-red-300">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-600 text-white" aria-hidden="true"><Share2 className="h-3 w-3" /></span>
                          <span className="min-w-0">{rw ? "Izindi porogaramu" : "More apps"}</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={copyRadioLink}
                        className="mt-2 inline-flex min-h-11 w-full items-center gap-2 border border-slate-700 px-2 text-xs font-semibold hover:border-slate-400"
                      >
                        {shareMessage.includes("copied") || shareMessage.includes("yakoporowe") ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {rw ? "Koporora ihuza" : "Copy radio link"}
                      </button>
                    </div>
                  )}
                </div>
                {shareMessage && (
                  <p className="w-full text-xs text-slate-300" role="status" aria-live="polite">
                    {shareMessage}
                  </p>
                )}

              </div>
            </div>
          </div>
        </div>

        <style>{`
          .radio-waveform {
            display: flex;
            height: 1.5rem;
            flex: none;
            align-items: center;
            gap: 3px;
          }

          .radio-waveform span {
            width: 3px;
            border-radius: 9999px;
            background: #f87171;
            transform: scaleY(0.35);
            transform-origin: center;
          }

          .radio-waveform.is-playing span {
            animation: radio-wave 650ms ease-in-out infinite alternate;
          }

          @keyframes radio-wave {
            from { transform: scaleY(0.3); }
            to { transform: scaleY(1); }
          }

          @media (prefers-reduced-motion: reduce) {
            .radio-waveform.is-playing span {
              animation: none;
              transform: scaleY(0.7);
            }
          }
        `}</style>
      </section>
    </>
  );
}

export default RadioPage;