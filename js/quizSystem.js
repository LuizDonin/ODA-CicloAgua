import { shuffleIfNeeded, evaluateAnswer } from "./validation.js";
import Modal from "../ui/Modal.js";
import SoundManager from "./SoundManager.js";

export default class quizSystem extends Phaser.Scene {
  constructor() {
    super("quizSystem");
  }

  init(data) {
    this.quizData = data?.quiz || { settings: {}, sprites: {}, questions: [] };
    this.dragScore = data?.dragScore || 0;

    this.index = 0;
    this.score = 0;

    this.locked = false;
    this.blinkTween = null;

    this.qLayer = null;
    this.answerButtons = [];
  }

  create() {
    const { width: w, height: h } = this.scale;

    this.bg = this.add.image(0, 0, "game_bg").setOrigin(0, 0).setDepth(-1000);

    const gameData = this.registry.get("gameData");

    const introMsg = gameData?.phaseintros?.intro2;

    new Modal(this, {
      text: introMsg,
      buttonText: "Iniciar",
    }).open();

    //Persistent HUD
    this.hud = this.add
      .text(16, 16, `Quiz: 0/${this.quizData.questions.length}`, {
        fontFamily: "Nunito",
        fontSize: "22px",
        color: "#fff",
      })
      .setDepth(100);

    // current question container
    this.qLayer = this.add.container(0, 0).setDepth(0);

    this.showQ();
  }

  showQ() {
    // checks if is last question and opens final modal
    if (this.index >= this.quizData.questions.length) {
      this.openFinalModal();
      return;
    }

    // limpa SOMENTE a camada da pergunta
    if (this.blinkTween) {
      this.blinkTween.stop();
      this.blinkTween = null;
    }
    this.qLayer.removeAll(true);
    this.answerButtons = [];
    this.locked = false;

    const W = this.scale.width;
    const H = this.scale.height;

    const sprites = this.quizData.sprites || {};
    const settings = this.quizData.settings || {};
    const shuffleOptions = !!settings.shuffleOptions;

    const q = this.quizData.questions[this.index];

    //question sprite + centralized text
    const qSprite = this.add
      .image(W / 2, H * 0.28, sprites.questionSprite)
      .setOrigin(0.5);
    const qWrap = Math.max(
      80,
      (qSprite.displayWidth || qSprite.width || W * 0.8) - 60
    );

    const qText = this.add
      .text(qSprite.x, qSprite.y, q.question, {
        fontFamily: "Nunito",
        fontSize: "26px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: qWrap, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    this.qLayer.add([qSprite, qText]);

    const options = shuffleIfNeeded(q.options, !!shuffleOptions);

    const probe = this.add.image(0, 0, sprites.answerSprite).setVisible(false);
    const ansW = probe.displayWidth;
    const ansH = probe.displayHeight;
    probe.destroy();

    const spacing = Math.round(Math.max(12, ansH * 0.2));
    const firstY = Math.round(
      qSprite.y +
        (qSprite.displayHeight || qSprite.height || 160) / 2 +
        40 +
        ansH / 2
    );

    //sets buttons based on Json texts (and place buttons on correct spots on scene)
    options.forEach((opt, i) => {
      const cx = W / 2;
      const cy = firstY + i * (ansH + spacing);

      const bg = this.add.image(0, 0, sprites.answerSprite).setOrigin(0.5);
      const wrap = Math.max(60, (bg.displayWidth || ansW) - 60);

      const txt = this.add
        .text(0, 0, opt.text, {
          fontFamily: "Nunito",
          fontSize: "20px",
          color: "#000000",
          align: "center",
          wordWrap: { width: wrap, useAdvancedWrap: true },
        })
        .setOrigin(0.5);

      const btn = this.add.container(cx, cy, [bg, txt]);
      btn.setSize(bg.displayWidth || ansW, bg.displayHeight || ansH);
      btn.setData("isCorrect", !!opt.isCorrect);
      btn.setData("bg", bg);
      btn.setData("txt", txt);

      btn.setInteractive({ cursor: "pointer" });
      btn.on("pointerover", () => {
        if (!this.locked) btn.setScale(1.02);
      });
      btn.on("pointerout", () => {
        btn.setScale(1);
      });
      btn.on("pointerup", () => {
        if (!this.locked) this._handleAnswer(btn, sprites);
      });

      this.qLayer.add(btn);
      this.answerButtons.push(btn);
    });
  }

  //shuffles quiz answers
  _shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  _disableAll() {
    this.answerButtons?.forEach((b) => b.disableInteractive());
  }
  _enableAll() {
    this.answerButtons?.forEach((b) => b.setInteractive({ cursor: "pointer" }));
  }

  //handles chosen answer
  _handleAnswer(chosenBtn, sprites) {
    this.locked = true;
    this._disableAll();

    const { isCorrect, delta } = evaluateAnswer(chosenBtn.getData("isCorrect"));
    const bg = chosenBtn.getData("bg");

    if (isCorrect) {
      if (sprites.answerSpriteCorrect)
        bg.setTexture(sprites.answerSpriteCorrect);
      SoundManager.correct();
      this.score += delta;
      this.hud?.setText(
        `Quiz: ${this.score}/${this.quizData.questions.length}`
      );

      this.time.delayedCall(1500, () => {
        this.index++;
        this.showQ();
      });
    } else {
      if (sprites.answerSpriteWrong) bg.setTexture(sprites.answerSpriteWrong);
      SoundManager.wrong();
      const correctBtn = this.answerButtons.find((b) => b.getData("isCorrect"));
      if (correctBtn) {
        const correctBg = correctBtn.getData("bg");
        if (sprites.answerSpriteCorrect)
          correctBg.setTexture(sprites.answerSpriteCorrect);
        this.blinkTween = this.tweens.add({
          targets: correctBtn,
          alpha: 0.35,
          duration: 160,
          yoyo: true,
          repeat: 2,
          onComplete: () => correctBtn.setAlpha(1),
        });
      }

      this.time.delayedCall(1500, () => {
        this.index++;
        this.showQ();
      });
    }
  }

  //opens generic modal with game infos
  openFinalModal() {
    const gameData = this.registry.get("gameData");
    const dragTotal = Array.isArray(gameData?.items)
      ? gameData.items.length
      : 0;
    const quizTotal = this.quizData.questions.length;

    const totalScore = this.dragScore + this.score;
    const totalPossible = dragTotal + quizTotal;

    const msg =
      `Parabéns!\n\n` +
      `Pontuação Drag & Drop: ${this.dragScore}/${dragTotal}\n` +
      `Pontuação Quiz: ${this.score}/${quizTotal}\n\n` +
      `Pontuação Total: ${totalScore}/${totalPossible}`;

    new Modal(this, {
      text: msg,
      buttonText: "Reiniciar",
      onConfirm: () => {
        this.scene.start("GameScene", { data: gameData });
      },
    }).open();
  }
}
