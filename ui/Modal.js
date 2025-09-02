export default class Modal extends Phaser.GameObjects.Container {
    constructor(scene, options = {}) {
      super(scene, 0, 0);
      scene.add.existing(this);

      // default options
      this.opts = {
        width: Math.min(760, scene.scale.width * 0.85),
        height: Math.min(300, scene.scale.height * 0.65),
        overlayAlpha: 0.65,
        depth: 5000,
        text: '',
        buttonText: '',
        ...options
      };
  
      this.setDepth(this.opts.depth);
      this.setScrollFactor?.(0);
  
      // modal - blocking interactions
      this.overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, this.opts.overlayAlpha)
        .setOrigin(0, 0)
        .setInteractive();
  
      this.panel = scene.add.rectangle(0, 0, this.opts.width, this.opts.height, 0x111111, 0.95)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff, 0.18);
  
      // dynamic text
      this.message = scene.add.text(0, 0, this.opts.text, {
        fontFamily: 'Nunito',
        fontSize: '22px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: this.opts.width - 60, useAdvancedWrap: true }
      }).setOrigin(0.5);
  
      // Button
      this.button = scene.add.text(0, 0, this.opts.buttonText, {
        fontFamily: 'Nunito',
        fontSize: '20px',
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: { x: 16, y: 10 }
      }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
  
      this.button.on('pointerup',   () => this.close());
  
      this.add([this.overlay, this.panel, this.message, this.button]);
  
      // Layout and resize
      this.layout = () => {
        const W = scene.scale.width;
        const H = scene.scale.height;
  
        this.overlay.setSize(W, H);
  
        const panelW = Math.min(760, W * 0.85);
        const panelH = Math.min(300, H * 0.65);
        this.panel.setPosition(W / 2, H / 2).setSize(panelW, panelH);
  
        this.message.setPosition(W / 2, H / 2 - 40);
        this.message.setWordWrapWidth(panelW - 60, true);
  
        this.button.setPosition(W / 2, H / 2 + (panelH / 2) - 48);
      };
      this.layout();
  
      scene.scale.on('resize', this.layout);
  
      this.setVisible(false);
      this.setActive(false);
    }
  
    setText(text) {
      this.message.setText(text || '');
      this.layout();
      return this;
    }
  
    setButtonText(txt) {
      this.button.setText(txt || 'OK');
      this.layout();
      return this;
    }
  
    open({ text, buttonText } = {}) {
      if (text !== undefined) this.setText(text);
      if (buttonText !== undefined) this.setButtonText(buttonText);
  
      this.setVisible(true);
      this.setActive(true);
      this.setDepth(this.opts.depth);
  
      this.alpha = 0;
      this.scene.tweens.add({ targets: this, alpha: 1, duration: 160, ease: 'Quad.easeOut' });
      return this;
    }
  
    close() {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 140,
        ease: 'Quad.easeIn',
        onComplete: () => {
            this.destroy(true);
        }
      });
    }
  
    destroy(fromScene) {
      super.destroy(fromScene);
    }
  }
  