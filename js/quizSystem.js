export default class quizSystem extends Phaser.Scene {
    constructor() { super('quizSystem'); }
  
    init(data) {
        this.quiz = data?.quiz || [];
        this.dragScore = data?.dragScore || 0;
        this.index = 0;
        this.score = 0;
    }
  
    create() { this.showQ(); }
  
    showQ() {

    }
  }
  