import React, { useRef, useState, useEffect } from "react";

export default function CinematicIntro({ onComplete }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt autoplay
    video.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      });

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleFinish();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleFinish = () => {
    if (isEnding) return;
    setIsEnding(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div className={`cinematic-intro-overlay ${isEnding ? "fade-out" : ""}`}>
      {/* Background Ambience & Noise */}
      <div className="intro-backdrop-veil" />

      {/* Video Container with Antique Gold Frame */}
      <div className="intro-video-frame">
        <video
          ref={videoRef}
          className="intro-video-element"
          autoPlay
          muted={isMuted}
          playsInline
          preload="auto"
          onClick={toggleSound}
        >
          <source src="/video/official_intro.mp4" type="video/mp4" />
          <source src="/video/intro.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Vignette */}
        <div className="intro-cinematic-vignette" />

        {/* Ornate Gold Frame Borders */}
        <div className="intro-gold-frame-border" />
      </div>

      {/* Top Controls: Official Brand Tag, Sound Toggle, Skip */}
      <div className="intro-top-controls">
        <div className="intro-brand-tag">
          <img
            src="/assets/brand/emblem_gold_only.png"
            alt="LA BELLE JIAN"
            className="intro-tag-emblem"
          />
          <div className="intro-tag-texts">
            <span className="intro-tag-en">LA BELLE JIAN</span>
            <span className="intro-tag-ko">라벨르지안 공식 앤틱 도감</span>
          </div>
        </div>

        <div className="intro-actions-group">
          <button
            type="button"
            className="intro-sound-btn"
            onClick={toggleSound}
            title={isMuted ? "음소거 해제 (소리 켜기)" : "소리 끄기"}
          >
            {isMuted ? "🔇 소리 켜기" : "🔊 소리 켜짐"}
          </button>

          <button
            type="button"
            className="intro-skip-btn"
            onClick={handleFinish}
            title="인트로 건너뛰고 수장고 입장"
          >
            <span>수장고 입장하기 ➔</span>
          </button>
        </div>
      </div>

      {/* Bottom Progress & Skip Prompt */}
      <div className="intro-bottom-bar">
        <div className="intro-progress-track">
          <div
            className="intro-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="intro-caption-line">
          <span>ARCHIVUM IMPERIALE • LA BELLE JIAN</span>
          <span className="intro-skip-hint" onClick={handleFinish}>
            클릭하여 바로 시작 (Space / Enter)
          </span>
        </div>
      </div>
    </div>
  );
}
