import Modal from "../ui/Modal.js";
import SoundManager from "./SoundManager.js";
import {
  isCorrectDrop,
  computeSnapY,
  nextScore,
  isDragComplete,
} from "./validation.js";

export default class dragSystem extends Phaser.Scene {
  constructor() {
    super("dragSystem");
  }

  init(payload) {
    this.dataJSON = payload?.data || this.registry.get("gameData");
    this.correct = 0;
    this.attempts = 0;
    this.feedbackIcon = null;
  }

  create() {
    const introMsg = this.dataJSON?.phaseintros?.intro1;

    this.introModal = new Modal(this, {
      text: introMsg,
      buttonText: "Iniciar",
    });

    this.introModal.open();
    const data = this.dataJSON;
    const dragCfg = data.drag || {};
    const items = data.items || [];
    const targets = data.targets || [];
    const fbKeys = data.feedback || {};

    this.add.image(0, 0, "game_bg").setOrigin(0, 0);

    const W = this.scale.width;
    const H = this.scale.height;

    const useNorm = String(dragCfg.units || "").toLowerCase() === "normalized";
    const sx = useNorm ? W : 1;
    const sy = useNorm ? H : 1;

    // HUD
    this.total = items.length;
    this.hud = this.add.text(16, 16, `Acertos: 0/${this.total}`, {
      fontFamily: "Nunito",
      fontSize: "22px",
      color: "#fff",
    });

    // feedback helpers
    this.clearFeedback = () => {
      if (this.feedbackTimer) {
        this.feedbackTimer.remove();
        this.feedbackTimer = null;
      }
      if (this.feedbackIcon) {
        this.feedbackIcon.destroy();
        this.feedbackIcon = null;
      }
    };

    this.showFeedback = (key) => {
      if (!key) return;
      this.clearFeedback();

      const cx = Math.round(this.scale.width / 2 + 310);
      const cy = Math.round(this.scale.height / 2);

      this.feedbackIcon = this.add
        .image(cx, cy, key)
        .setOrigin(0.5)
        .setDepth(2000)
        .setScale(0.9)
        .setAlpha(0);

      this.tweens.add({
        targets: this.feedbackIcon,
        alpha: 1,
        duration: 120,
        ease: "Quad.easeOut",
      });
      this.feedbackTimer = this.time.delayedCall(1500, () =>
        this.clearFeedback()
      );
    };

    // Drag and drop targets
    this.targetsById = new Map();

    targets.forEach((t) => {
      const x = Math.round(t.x * sx);
      const y = Math.round(t.y * sy);

      const img = this.add.image(x, y, t.sprite).setOrigin(0.5).setAlpha(0.9);

      const zoneW = img.displayWidth;
      const zoneH = img.displayHeight;

      const zone = this.add
        .zone(img.x, img.y, zoneW, zoneH)
        .setRectangleDropZone(zoneW, zoneH);

      zone.setData("id", t.id);
      this.targetsById.set(t.id, { zone, img });
    });

    // Draggables
    const boxKey = dragCfg.textboxSpriteKey;

    items.forEach((it) => {
      const startX = Math.round(it.start.x * sx);
      const startY = Math.round(it.start.y * sy);

      const bg = this.add.image(0, 0, boxKey).setOrigin(0.5);
      const wrapWidth = Math.max(50, (bg.displayWidth || bg.width || 360) - 80);

      const label = this.add
        .text(0, 0, it.text, {
          fontFamily: "Nunito",
          fontSize: "22px",
          color: "#000",
          wordWrap: { width: wrapWidth, useAdvancedWrap: true },
          align: "center",
        })
        .setOrigin(0.5);

      const draggable = this.add.container(startX, startY, [bg, label]);
      const w = bg.displayWidth || bg.width || 360;
      const h = bg.displayHeight || bg.height || 90;
      draggable.setSize(w, h);

      draggable.setData("home", { x: startX, y: startY });
      draggable.setData("targetId", it.targetId);

      draggable.setInteractive({ cursor: "pointer" });
      this.input.setDraggable(draggable);
    });

    // Drag Events
    this.input.on("dragstart", (pointer, obj) => {
      this.clearFeedback();
      obj.setDepth(999);
      obj.setAlpha(0.9);
    });

    this.input.on("drag", (pointer, obj, dx, dy) => {
      obj.x = dx;
      obj.y = dy;
    });

    this.input.on("dragenter", (pointer, obj, zone) => {
      const id = zone?.getData("id");
      const t = id ? this.targetsById.get(id) : null;
      t?.img?.setAlpha(1);
    });

    this.input.on("dragleave", (pointer, obj, zone) => {
      const id = zone?.getData("id");
      const t = id ? this.targetsById.get(id) : null;
      t?.img?.setAlpha(0.9);
    });

    this.input.on("drop", (pointer, obj, zone) => {
      const hitId = zone?.getData("id");
      const mustId = obj.getData("targetId");

      this.attempts += 1;

      const t = hitId ? this.targetsById.get(hitId) : null;

      if (isCorrectDrop(hitId, mustId)) {
        obj.disableInteractive();
        t?.img?.setAlpha(1);
        this.input.setDefaultCursor("default");

        const targetY = computeSnapY(zone, obj.height, 32);
        SoundManager.correct();
        this.tweens.add({
          targets: obj,
          x: zone.x,
          y: targetY,
          duration: 140,
          ease: "Quad.easeOut",
          onComplete: () => this.showFeedback(fbKeys.correct),
        });

        this.correct = nextScore(this.correct, true);
        this.hud.setText(`Acertos: ${this.correct}/${this.total}`);

        if (isDragComplete(this.correct, this.total)) {
          this.time.delayedCall(750, () => this.openResultModal());
        }
      } else {
        const home = obj.getData("home");
        this.tweens.add({
          targets: obj,
          x: home.x,
          y: home.y,
          duration: 220,
          ease: "Quad.easeOut",
        });
        this.input.setDefaultCursor("default");
        t?.img?.setAlpha(0.9);
        this.showFeedback(fbKeys.wrong);
        SoundManager.wrong();
      }
    });

    this.input.on("dragend", (pointer, obj, dropped) => {
      obj.setAlpha(1).setDepth(1);
      if (!dropped) {
        const home = obj.getData("home");
        this.tweens.add({
          targets: obj,
          x: home.x,
          y: home.y,
          duration: 200,
          ease: "Quad.easeOut",
        });
      }
    });
  }

  //Opens final modal - calling the quiz scene on modal button
  openResultModal() {
    this.clearFeedback?.();

    const msg = `Fase 1 concluída!\nTentativas: ${this.attempts}\nAcertos: ${this.correct}/${this.total}`;

    new Modal(this, {
      text: msg,
      buttonText: "Ir para o quiz",
      onConfirm: () => {
        this.game.events.emit("drag:complete", { score: this.correct });
      },
    }).open();
  }
}
