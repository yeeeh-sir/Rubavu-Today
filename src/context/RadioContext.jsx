import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getRadio } from "../services/api";
import { extractYouTubeVideoId } from "../utils/youtube";

const RadioContext = createContext(null);

const VOLUME_KEY = "rubavu_today_radio_volume";

let youtubeApiPromise = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    const checkReady = () => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return true;
      }
      return false;
    };
    if (checkReady()) return;
    const previousHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousHandler === "function") previousHandler();
      checkReady();
    };
    if (!document.getElementById("rubavu-yt-iframe-api")) {
      const script = document.createElement("script");
      script.id = "rubavu-yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

export function RadioProvider({ children }) {
  const playerRef = useRef(null);
  const currentItemRef = useRef(null);
  const queueRef = useRef([]);
  const videoIdRef = useRef(null);
  const pendingItemRef = useRef(null);
  const pausedPositionRef = useRef(null);
  const volumeRef = useRef(1);
  const isMutedRef = useRef(false);
  const mountedRef = useRef(true);

  const [queue, setQueue] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasLoadedRadio, setHasLoadedRadio] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    currentItemRef.current = currentItem;
  }, [currentItem]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    let initial = 1;
    try {
      const stored = localStorage.getItem(VOLUME_KEY);
      if (stored != null) {
        initial = Math.min(1, Math.max(0, Number(stored) || 1));
      }
    } catch {
      initial = 1;
    }
    setVolumeState(initial);
  }, []);

  const applyVolume = useCallback((player, vol, muted) => {
    if (!player || !player.setVolume) return;
    try {
      player.setVolume(Math.round((muted ? 0 : vol) * 100));
    } catch { }
    try {
      if (muted) player.mute();
      else player.unMute();
    } catch { }
  }, []);

  const playFromPosition = useCallback((player, position) => {
    if (!player || !player.getDuration || !player.seekTo || !player.playVideo) return;

    try {
      const durationInSeconds = Math.floor(player.getDuration());
      const maxStart = Math.max(0, durationInSeconds - 1);
      const startAt = maxStart > 0
        ? Math.min(maxStart, Math.max(0, Math.floor(position)))
        : 0;

      player.seekTo(startAt, true);
      setCurrentTime(startAt);
      player.playVideo();
      setIsLoading(true);
      setIsPlaying(false);
    } catch { }
  }, []);

  const playFromRandomPosition = useCallback((player) => {
    if (!player || !player.getDuration) return;

    const durationInSeconds = Math.floor(player.getDuration());
    const maxStart = Math.max(0, durationInSeconds - 1);
    const minimumStart = Math.min(30, maxStart);
    const startRange = Math.max(0, maxStart - minimumStart);
    const startAt = startRange > 0
      ? minimumStart + Math.floor(Math.random() * (startRange + 1))
      : 0;

    playFromPosition(player, startAt);
  }, [playFromPosition]);

  const executePlayback = useCallback(
    (item) => {
      if (!mountedRef.current) return;
      const videoId = extractYouTubeVideoId(item && item.youtube_url);
      if (!videoId) {
        setCurrentItem(item || null);
        setDuration(0);
        setCurrentTime(0);
        setIsLoading(false);
        setIsPlaying(false);
        setError("Invalid radio source.");
        return;
      }
      setCurrentItem(item);
      setError("");
      setDuration(0);
      setCurrentTime(0);
      const player = playerRef.current;
      if (player && player.loadVideoById) {
        const changed = videoIdRef.current !== videoId;
        videoIdRef.current = videoId;
        applyVolume(player, volumeRef.current, isMutedRef.current);
        if (changed) {
          pausedPositionRef.current = null;
          player.cueVideoById(videoId, 0);
          setIsLoading(true);
          setIsPlaying(false);
        } else if (pausedPositionRef.current !== null) {
          const resumeAt = pausedPositionRef.current + Math.floor(Math.random() * 11) + 5;
          pausedPositionRef.current = null;
          playFromPosition(player, resumeAt);
        } else {
          playFromRandomPosition(player);
        }
      } else {
        pendingItemRef.current = item;
      }
    },
    [applyVolume, playFromPosition, playFromRandomPosition]
  );

  const handlersRef = useRef({});
  handlersRef.current = {
    onReady: (event) => {
      playerRef.current = event.target || playerRef.current;
      applyVolume(playerRef.current, volumeRef.current, isMutedRef.current);
      if (pendingItemRef.current) {
        const item = pendingItemRef.current;
        pendingItemRef.current = null;
        executePlayback(item);
      }
    },
    onStateChange: (event) => {
      const state = event.data;
      if (state === 1) {
        setError("");
        setIsLoading(false);
        setIsPlaying(true);
      } else if (state === 2) {
        setIsLoading(false);
        setIsPlaying(false);
      } else if (state === 3) {
        setIsLoading(true);
      } else if (state === 5) {
        setIsLoading(false);
        playFromRandomPosition(playerRef.current);
      } else if (state === 0) {
        pausedPositionRef.current = null;
        playFromRandomPosition(playerRef.current);
      }
    },
    onError: (event) => {
      const code = event && event.data;
      setError(
        code === 100 || code === 2 || code === 5
          ? "Invalid radio source."
          : "This radio program cannot be played at the moment."
      );
      setIsLoading(false);
      setIsPlaying(false);
    },
  };

  useEffect(() => {
    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.bottom = "0";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.overflow = "hidden";
    document.body.appendChild(container);

    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (!YT || cancelled || playerRef.current || !container || !container.isConnected) return;
      const player = new YT.Player(container, {
        width: "100%",
        height: "100%",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => handlersRef.current.onReady(event),
          onStateChange: (event) => handlersRef.current.onStateChange(event),
          onError: (event) => handlersRef.current.onError(event),
        },
      });
      playerRef.current = player;
    });
    return () => {
      cancelled = true;
      const player = playerRef.current;

      if (player && typeof player.destroy === "function") {
        try {
          player.destroy();
        } catch { }
      }

      playerRef.current = null;

      if (container.isConnected) {
        container.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player || !player.getDuration) return;
      try {
        const nextDuration = player.getDuration();
        if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
        const nextTime = player.getCurrentTime();
        if (Number.isFinite(nextTime) && nextTime >= 0) setCurrentTime(nextTime);
      } catch { }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    let cancelled = false;
    getRadio()
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setQueue(items);
        if (data?.nowPlaying) {
          setCurrentItem((prev) => prev || data.nowPlaying);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelled) setHasLoadedRadio(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const playItem = useCallback(
    (item) => {
      executePlayback(item);
    },
    [executePlayback]
  );

  const togglePlay = useCallback(
    (item) => {
      const player = playerRef.current;
      if (item) {
        executePlayback(item);
        return;
      }
      const current = currentItemRef.current;
      if (!player || !player.getPlayerState) {
        if (current) executePlayback(current);
        return;
      }
      if (player.getPlayerState() === 1) {
        try {
          const position = player.getCurrentTime();
          if (Number.isFinite(position) && position >= 0) {
            pausedPositionRef.current = position;
          }
        } catch { }
        player.pauseVideo();
      } else if (current) {
        executePlayback(current);
      }
    },
    [executePlayback]
  );

  const pauseRadio = useCallback(() => {
    const player = playerRef.current;
    if (player && player.pauseVideo) {
      try {
        const position = player.getCurrentTime();
        if (Number.isFinite(position) && position >= 0) {
          pausedPositionRef.current = position;
        }
      } catch { }
      player.pauseVideo();
    }
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback(
    (value) => {
      const clamped = Math.min(1, Math.max(0, Number(value) || 0));
      setVolumeState(clamped);
      volumeRef.current = clamped;
      try {
        localStorage.setItem(VOLUME_KEY, String(clamped));
      } catch { }
      const player = playerRef.current;
      if (player) applyVolume(player, clamped, isMutedRef.current);
    },
    [applyVolume]
  );

  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    isMutedRef.current = next;
    setIsMuted(next);
    const player = playerRef.current;
    if (player) applyVolume(player, volumeRef.current, next);
  }, [applyVolume]);

  const seekTo = useCallback((seconds) => {
    const player = playerRef.current;
    if (player && player.seekTo) {
      try {
        player.seekTo(Math.max(0, Number(seconds) || 0), true);
      } catch { }
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const refreshQueue = useCallback(async () => {
    try {
      const data = await getRadio();
      if (!mountedRef.current) return;
      const items = Array.isArray(data?.items) ? data.items : [];
      setQueue(items);
      setCurrentItem((prev) => prev || (data?.nowPlaying || null));
      setHasLoadedRadio(true);
    } catch {
    }
  }, []);

  const value = {
    queue,
    currentItem,
    isPlaying,
    isLoading,
    error,
    volume,
    isMuted,
    duration,
    currentTime,
    hasLoadedRadio,
    playItem,
    togglePlay,
    pauseRadio,
    setVolume,
    toggleMute,
    seekTo,
    clearError,
    refreshQueue,
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error("useRadio must be used within a RadioProvider");
  }
  return context;
}