export default class dataLoader extends Phaser.Scene {
    constructor() { super('PreloadScene'); }
  
    preload() {
        const font = new FontFace("Nunito", "url(./resources/Nunito-Regular.ttf)");
        font.load().then((loaded) => {
            document.fonts.add(loaded);
        });
        this.load.image('game_bg', 'assets/images/game_bg.png');
        this.load.image('words_bg', 'assets/images/words_bg.png');
        this.load.image('words_img', 'assets/images/words_img.png');
        this.load.image('capa_bg', 'assets/images/capa_bg.png');
    }
  
    create() {
        this.scene.start('GameScene');
    }
  }
  