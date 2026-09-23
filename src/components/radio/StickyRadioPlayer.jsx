import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useRadio } from "../../context/RadioContext";
import { useLanguage } from "../../context/LanguageContext";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
};

function StickyRadioPlayer() {
  const {
    queue,
    currentItem,
    isPlaying,
    isLoading,
    error,
    volume,
    isMuted,
    currentTime,
    duration,
    togglePlay,
    setVolume,
    toggleMute,
    seekTo,
  } = useRadio();
  const { language } = useLanguage();
  const location = useLocation();
  const [minimized, setMinimized] = useState(false);
  const [hidden, setHidden] = useState(false);

  const inBackoffice = /^\/(admin|employee|chief)/.test(location.pathname);
  if (inBackoffice) return null;

  const hasContent = queue.length > 0 || currentItem;
  if (hidden || !hasContent) return null;

  const title = currentItem?.title || "Rubavu Today Radio";
  const showProgress = Number.isFinite(duration) && duration > 0;
  const percent =
    showProgress && duration > 0
      ? Math.min(100, (currentTime / duration) * 100)
      : 0;

  if (minimized) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/95 px-3 py-2 text-white backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <p className="truncate text-[12px] font-bold text-white">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={togglePlay}
            className="grid h-9 w-9 place-items-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            )}
          </button>
          <button
            onClick={() => setMinimized(false)}
            className="grid h-8 w-8 place-items-center rounded text-slate-400 transition hover:text-white"
            aria-label="Expand radio player"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => setHidden(true)}
            className="text-slate-400 transition hover:text-white"
            aria-label="Close radio player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const statusText = error
    ? error
: isLoading
        ? language === "rw"
          ? "Birimo byoherezwa..."
          : "Loading..."
      : isPlaying
        ? language === "rw"
          ? "Uri kumva..."
          : "Now playing"
        : language === "rw"
          ? "Kanda kugira wumve"
          : "Press play to listen";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 text-white shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 sm:px-6">
        <button
          onClick={() => setMinimized(true)}
          className="hidden shrink-0 items-center gap-2 text-left sm:flex"
          aria-label="Minimize radio player"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="font-body text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-400">
            Rubavu Today Radio
          </span>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={togglePlay}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-600 text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold leading-tight text-white">
              {title}
            </p>
            <p
              className={`truncate text-[11px] leading-tight ${
                error
                  ? "font-semibold text-red-400"
                  : isPlaying && !isLoading
                    ? "font-semibold text-emerald-400"
                    : "text-slate-400"
              }`}
            >
              {statusText}
            </p>
          </div>
          {showProgress && (
            <div className="hidden w-full max-w-[200px] shrink-0 items-center gap-2 lg:flex">
              <span className="text-[10px] tabular-nums text-slate-400">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={Math.floor(duration) || 1}
                step="1"
                value={Math.min(duration, currentTime)}
                onChange={(e) => seekTo(e.target.value)}
                style={{ backgroundSize: `${percent}% 100%` }}
                className="radio-range flex-1 accent-red-600"
                aria-label="Seek radio stream"
              />
              <span className="text-[10px] tabular-nums text-slate-400">
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-slate-400 transition hover:text-white"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(e.target.value)}
            className="radio-range w-20 accent-red-600 sm:w-24"
            aria-label="Radio volume"
          />
          <Link
            to="/radio"
            className="hidden shrink-0 rounded border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition hover:border-red-600 hover:text-red-400 sm:inline-block"
          >
            {language === "rw" ? "Radiyo" : "Radio"}
          </Link>
        </div>

        <button
          onClick={() => setMinimized(true)}
          className="hidden shrink-0 text-slate-400 transition hover:text-white sm:grid sm:h-8 sm:w-8 sm:place-items-center"
          aria-label="Minimize radio player"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => setHidden(true)}
          className="shrink-0 text-slate-400 transition hover:text-white"
          aria-label="Close radio player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default StickyRadioPlayer;