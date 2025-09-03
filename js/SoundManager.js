export default class SoundManager {
  static _sound = null;
  static _unlocked = false;
  static _volume = 1;

  //one per scene
  static init(scene) {
    if (!scene?.sound) return;
    SoundManager._sound = scene.sound;

    // unlock sounds (browser requirements?)
    if (!SoundManager._unlocked) {
      scene.input?.once("pointerdown", async () => {
        try {
          const ctx = SoundManager._sound.context;
          if (ctx && ctx.state === "suspended") await ctx.resume();
        } catch {}
        SoundManager._unlocked = true;
      });
    }
  }

  static setVolume(v) {
    SoundManager._volume = Phaser.Math.Clamp(v ?? 1, 0, 1);
  }
  static mute() {
    SoundManager._sound?.setMute(true);
  }
  static unmute() {
    SoundManager._sound?.setMute(false);
  }

  static play(key, cfg = {}) {
    if (!SoundManager._sound || !key) return null;
    const sfx = SoundManager._sound.add(key, {
      volume: SoundManager._volume,
      ...cfg,
    });
    sfx.once("complete", () => sfx.destroy());
    sfx.play();
    return sfx;
  }

  static click() {
    return SoundManager.play("sfx_click");
  }
  static correct() {
    return SoundManager.play("sfx_correct");
  }
  static wrong() {
    return SoundManager.play("sfx_wrong");
  }
}
