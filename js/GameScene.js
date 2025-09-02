export default class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    
    init(data) {
        this.quiz = data?.quiz || [];
    }
  
    create() {
        const { width:w, height:h } = this.scale;

        this.add.image(w/2, h/2, 'capa_bg');
        this.add.text(w/2, h/2 - 200, 'CICLO DA ÁGUA', { fontSize: 80, color: '#fff', fontFamily: 'Nunito' }).setOrigin(0.5);
        const startBtn = this.add.text(w/2, h/2 + 10, 'Iniciar', { fontSize: 28, color: '#000', backgroundColor: '#fff', padding:{x:30,y:20}, fontFamily: 'Nunito' })
            .setOrigin(0.5)
            .setInteractive({ cursor: 'pointer' });

        startBtn.on('pointerup', () => {
            this.children.removeAll();
            this.startDragPhase();
        });

        this.game.events.on('drag:complete', this.onDragComplete, this);
        this.game.events.on('quiz:complete', this.onQuizComplete, this);
    }
  
    startDragPhase() {
        const data = this.registry.get('gameData');
        this.scene.start('dragSystem', { data });
    }
  
    onDragComplete(payload) {
      this.scene.start('quizSystem', { quiz: this.quiz, dragScore: payload?.score || 0 });
    }
  
    onQuizComplete(result) {
        const { width:w, height:h } = this.scale;
        this.children.removeAll();
        this.add.text(w/2, h/2 - 20, `Fim! Drag: ${result.dragScore} | Quiz: ${result.quizScore}/${result.total}`, { fontSize: 26, color:'#fff'}).setOrigin(0.5);
        const again = this.add.text(w/2, h/2 + 40, 'Jogar de novo', { fontSize:20, color:'#000', backgroundColor:'#fff', padding:{x:12,y:8}})
            .setOrigin(0.5)
            .setInteractive({cursor:'pointer'})
            .on('pointerup', () => this.scene.restart({ quiz: this.quiz })); // volta pra capa
    }
  
    shutdown() {
        this.game.events.off('drag:complete', this.onDragComplete, this);
        this.game.events.off('quiz:complete', this.onQuizComplete, this);
    }
  }
  