import SoundManager from "../js/SoundManager.js";
export default class Modal extends Phaser.GameObjects.Container {
  constructor(scene, options = {}) {
    super(scene, 0, 0);
    scene.add.existing(this);

    //default options
    this.opts = {
      width: Math.min(760, scene.scale.width * 0.85),
      height: Math.min(300, scene.scale.height * 0.65),
      overlayAlpha: 0.65,
      depth: 5000,
      text: "",
      buttonText: "OK",
      onConfirm: null, 
      ...options,
    };

    this.setDepth(this.opts.depth);

    const W = scene.scale.width;
    const H = scene.scale.height;

    this.overlay = scene.add
      .rectangle(0, 0, W, H, 0x000000, this.opts.overlayAlpha)
      .setOrigin(0, 0)
      .setInteractive();

    this.panel = scene.add
      .rectangle(
        W / 2,
        H / 2,
        this.opts.width,
        this.opts.height,
        0x111111,
        0.95
      )
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff, 0.18);

    this.message = scene.add
      .text(W / 2, H / 2 - 40, this.opts.text, {
        fontFamily: "Nunito",
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: this.opts.width - 60, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    this.button = scene.add
      .text(W / 2, H / 2 + this.opts.height / 2 - 48, this.opts.buttonText, {
        fontFamily: "Nunito",
        fontSize: "20px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });

    // calls "callback" and closes the modal (avoid double click)
    this.button.on("pointerup", () => {
      SoundManager.click();
      this.button.disableInteractive();
      try {
        if (typeof this.opts.onConfirm === "function") {
          this.opts.onConfirm(this);
        }
      } finally {
        this.close();
      }
    });

    this.add([this.overlay, this.panel, this.message, this.button]);

    this.setVisible(false);
    this.setActive(false);
    this.alpha = 0;
  }

  refreshLayout() {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;

    this.overlay.setSize(W, H);

    const panelW = Math.min(760, W * 0.85);
    const panelH = Math.min(300, H * 0.65);
    this.panel.setPosition(W / 2, H / 2).setSize(panelW, panelH);

    this.message.setPosition(W / 2, H / 2 - 40);
    this.message.setWordWrapWidth(panelW - 60, true);

    this.button.setPosition(W / 2, H / 2 + panelH / 2 - 48);
  }

  setText(text) {
    this.message.setText(text || "");
    return this;
  }

  setButtonText(txt) {
    this.button.setText(txt || "OK");
    return this;
  }

  // allows callback after creation of the modal
  setOnConfirm(fn) {
    this.opts.onConfirm = fn;
    return this;
  }

  open({ text, buttonText, onConfirm } = {}) {
    if (text !== undefined) this.setText(text);
    if (buttonText !== undefined) this.setButtonText(buttonText);
    if (onConfirm !== undefined) this.setOnConfirm(onConfirm);

    this.refreshLayout();

    this.setVisible(true);
    this.setActive(true);
    this.setDepth(this.opts.depth);
    this.alpha = 0;

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 160,
      ease: "Quad.easeOut",
    });

    return this;
  }

  close() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 140,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.scene.input.setDefaultCursor("default");
        this.destroy(true);
      },
    });
  }
}
