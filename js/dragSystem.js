export default class dragSystem extends Phaser.Scene {
    constructor() { super('dragSystem'); }
  
    init(data) {
        this.quiz = data?.quiz || [];
        this.correct = 0;
    }
  
    create() {

    }
  }
  