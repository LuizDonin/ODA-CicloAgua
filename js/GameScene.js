import SoundManager from "../js/SoundManager.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(payload) {
    // loads Json
    this.gameData = payload?.data || this.registry.get("gameData");
    this.quiz = this.gameData?.quiz || {
      settings: {},
      sprites: {},
      questions: [],
    };
    SoundManager.init(this);
  }

  create() {
    const { width: w, height: h } = this.scale;

    this.add.image(w / 2, h / 2, "capa_bg");
    this.add
      .text(w / 2, h / 2 - 200, "CICLO DA ÁGUA", {
        fontSize: 80,
        color: "#fff",
        fontFamily: "Nunito",
      })
      .setOrigin(0.5);
    const startBtn = this.add
      .text(w / 2, h / 2 + 10, "Iniciar", {
        fontSize: 28,
        color: "#000",
        backgroundColor: "#fff",
        padding: { x: 30, y: 20 },
        fontFamily: "Nunito",
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });

    startBtn.on("pointerup", () => {
      SoundManager.click();
      this.children.removeAll();
      this.startDragPhase();
    });

    //listeners to change between scenes
    this.game.events.on("drag:complete", this.onDragComplete, this);
    this.game.events.on("quiz:complete", this.onQuizComplete, this);
  }

  startDragPhase() {
    const data = this.registry.get("gameData");
    this.scene.start("dragSystem", { data });
  }

  //when drag&drop is complete, starts quiz scene
  onDragComplete(payload) {
    this.scene.stop("dragSystem");
    this.scene.start("quizSystem", {
      quiz: this.quiz,
      dragScore: payload?.score || 0,
    });
  }

  //when quiz is complete, calls the generic modal with game infos and sets button to start game again
  onQuizComplete(result) {
    const { width: w, height: h } = this.scale;
    this.children.removeAll();
    this.add
      .text(
        w / 2,
        h / 2 - 20,
        `Fim! Drag: ${result.dragScore} | Quiz: ${result.quizScore}/${result.total}`,
        { fontSize: 26, color: "#fff" }
      )
      .setOrigin(0.5);
    this.add
      .text(w / 2, h / 2 + 40, "Jogar de novo", {
        fontSize: 20,
        color: "#000",
        backgroundColor: "#fff",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" })
      .on("pointerup", () => this.scene.restart({ data: this.gameData }));
  }

  shutdown() {
    this.game.events.off("drag:complete", this.onDragComplete, this);
    this.game.events.off("quiz:complete", this.onQuizComplete, this);
  }
}
