import React from "react";
import {
  ExternalLink,
  Loader2,
  Pause,
  Play,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRadio } from "../context/RadioContext";
import { useLanguage } from "../context/LanguageContext";
import { getYouTubeThumbnail } from "../utils/youtube";
import { SiteSEO } from "../components/SEO/SEO";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
};

function RadioPage() {
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
    currentTime,
    duration,
    togglePlay,
    playItem,
    setVolume,
    toggleMute,
    seekTo,
    hasLoadedRadio,
  } = useRadio();

  const playingNow = currentItem;
  const showProgress = Number.isFinite(duration) && duration > 0;
  const percent =
    showProgress && duration > 0
      ? Math.min(100, (currentTime / duration) * 100)
      : 0;

  return (
    <>
      <SiteSEO />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <h1 className="font-masthead text-2xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-3xl">
              Rubavu Today Radio
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
            {rw
              ? "Tegeka amatwi, usome amakuru mu gihe umenyesha Rubavu imwe n'umwe."
              : "Tune in and keep reading — the latest Rubavu news, live from our studio."}
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
          <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:gap-8">
            <div className="relative flex h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-900 sm:h-44 md:w-56">
              {playingNow?.thumbnail || getYouTubeThumbnail(playingNow?.youtube_url) ? (
                <img
                  src={playingNow.thumbnail || getYouTubeThumbnail(playingNow?.youtube_url)}
                  alt={playingNow.title || "Radio program"}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Radio className="h-16 w-16 text-slate-700" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-body text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-400">
                {rw ? "Urwego ruri gukorera" : "Now on air"}
              </p>
              <h2 className="mt-1 font-masthead text-xl font-extrabold leading-tight text-white sm:text-2xl">
                {playingNow?.title || "Rubavu Today Radio"}
              </h2>
              {playingNow?.description && (
                <p className="mt-2 line-clamp-3 text-sm text-slate-300">
                  {playingNow.description}
                </p>
              )}
              <p
                className={`mt-3 text-sm font-semibold ${
                  error
                    ? "text-red-400"
                    : isLoading
                      ? "text-slate-400"
                      : isPlaying
                        ? "text-emerald-400"
                        : "text-slate-400"
                }`}
              >
                {error
                  ? error
: isLoading
                        ? rw
                          ? "Birimo byoherezwa..."
                          : "Loading..."
                        : isPlaying
                      ? rw
                        ? "Uri kumva..."
                        : "Now playing"
                      : rw
                        ? "Kanda kugira wumve"
                        : "Press play to listen"}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button
                  onClick={togglePlay}
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

                {playingNow?.youtube_url && (
                  <a
                    href={playingNow.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 underline-offset-4 transition hover:text-red-400 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {rw ? "Reba kuri YouTube" : "Source on YouTube"}
                  </a>
                )}
              </div>
            </div>
          </div>

          {showProgress && (
            <div className="flex items-center gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
              <span className="text-[11px] tabular-nums text-slate-400">
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
              <span className="text-[11px] tabular-nums text-slate-400">
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="font-masthead text-lg font-extrabold uppercase tracking-tight text-slate-900">
            {rw ? "Ibizakurikira" : "Up next"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {rw
              ? "Andi makuru y'urubuga rwa radio."
              : "More programs from the Rubavu Today radio queue."}
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {!hasLoadedRadio ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                {rw ? "Birimo byoherezwa..." : "Loading radio..."}
              </p>
            ) : queue.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Radio className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  {rw
                    ? "Nta radio iri gukorera muri iki gihe."
                    : "No live radio is currently available."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {queue.map((item, index) => {
                  const isNowPlaying = playingNow && item.id === playingNow.id;
                  return (
                    <li key={item.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                      <span className="w-8 shrink-0 text-center font-masthead text-sm font-extrabold text-slate-400">
                        {item.queue_order || index + 1}
                      </span>
                      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100">
                        {item.thumbnail || getYouTubeThumbnail(item.youtube_url) ? (
                          <img
                            src={item.thumbnail || getYouTubeThumbnail(item.youtube_url)}
                            alt={item.title || "Radio program"}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Radio className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {item.title || "Untitled program"}
                        </p>
                        {item.description && (
                          <p className="truncate text-xs text-slate-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isNowPlaying ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                              isPlaying
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {rw ? "Iri gukorera" : "Now playing"}
                          </span>
                        ) : (
                          <button
                            onClick={() => playItem(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-red-600"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            {rw ? "Kumva" : "Play"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          {rw
            ? "Rubavu Today Radio ikoresha amakuru atangwa neza kandi yemewe. Inkuru zose z'urubuga zikomeza gukina hakoreshejwe uburyo bwa YouTube buboneye."
            : "Rubavu Today Radio broadcasts content owned or licensed by Rubavu Today. Playback uses the official YouTube embedded player; the YouTube link for each program opens the original source video in your browser."}
        </p>
      </section>
    </>
  );
}

export default RadioPage;