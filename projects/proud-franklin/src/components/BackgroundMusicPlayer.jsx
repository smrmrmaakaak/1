import React, { useEffect, useRef, useState, useCallback } from "react";

export default function BackgroundMusicPlayer({ isEnabled, volume = 0.35 }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVol, setCurrentVol] = useState(volume);
  const [isMuted, setIsMuted] = useState(false);
  const fadeIntervalRef = useRef(null);

  // Initialize and handle play/pause based on isEnabled
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    if (isEnabled && !isMuted) {
      audio.volume = 0;
      audio.play().then(() => {
        setIsPlaying(true);
        // Smooth Fade-In over 2.0 seconds to target volume
        let v = 0;
        fadeIntervalRef.current = setInterval(() => {
          v = Math.min(currentVol, v + 0.02);
          audio.volume = v;
          if (v >= currentVol) {
            clearInterval(fadeIntervalRef.current);
          }
        }, 100);
      }).catch((e) => {
        // Autoplay may need user gesture
        console.log("Audio autoplay waiting for user interaction:", e);
      });
    } else {
      // Smooth Fade-Out
      let v = audio.volume;
      fadeIntervalRef.current = setInterval(() => {
        v = Math.max(0, v - 0.05);
        audio.volume = v;
        if (v <= 0) {
          audio.pause();
          setIsPlaying(false);
          clearInterval(fadeIntervalRef.current);
        }
      }, 80);
    }

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isEnabled, isMuted, currentVol]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      audio.volume = currentVol;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [isPlaying, currentVol]);

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setCurrentVol(newVol);
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = newVol;
    }
    if (newVol === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
  };

  return (
    <div className="bgm-player-widget">
      <audio
        ref={audioRef}
        src="/audio/star_bgm.mp3"
        preload="auto"
      />

      <button
        type="button"
        className={`bgm-control-pill ${isPlaying ? "playing" : "paused"}`}
        onClick={togglePlay}
        title={isPlaying ? "배경음악 일시정지 (별을 따다)" : "배경음악 재생 (별을 따다)"}
        aria-label="배경음악 컨트롤"
      >
        <span className="bgm-icon">{isPlaying ? "🎵" : "🔇"}</span>
        <div className="bgm-text-stack">
          <span className="bgm-title">별을 따다</span>
          <span className="bgm-status">{isPlaying ? "은은하게 재생 중" : "일시정지"}</span>
        </div>

        {/* Animated Equalizer Bars when playing */}
        {isPlaying && (
          <div className="bgm-eq-visualizer" aria-hidden="true">
            <span className="eq-bar bar-1" />
            <span className="eq-bar bar-2" />
            <span className="eq-bar bar-3" />
          </div>
        )}
      </button>

      {/* Volume Slider */}
      <div className="bgm-volume-slider-wrap">
        <span className="vol-glyph">🔈</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : currentVol}
          onChange={handleVolumeChange}
          className="bgm-slider"
          title={`볼륨: ${Math.round((isMuted ? 0 : currentVol) * 100)}%`}
        />
        <span className="vol-percent">{Math.round((isMuted ? 0 : currentVol) * 100)}%</span>
      </div>
    </div>
  );
}
