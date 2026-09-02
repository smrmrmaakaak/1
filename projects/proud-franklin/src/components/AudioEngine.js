// Sound completely muted/disabled per user request
class MutedAudioEngine {
  init() {}
  playPageTurn() {}
  playPaperRustle() {}
  playBookOpen() {}
  playSealStamp() {}
  toggleAmbient() { return false; }
}

export const sound = new MutedAudioEngine();
