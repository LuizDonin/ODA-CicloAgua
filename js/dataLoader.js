export default class dataLoader extends Phaser.Scene {
    constructor() { super('PreloadScene'); }
  
    preload() {
        const font = new FontFace("Nunito", "url(./resources/Nunito-Regular.ttf)");
        font.load().then((loaded) => {
            document.fonts.add(loaded);
        });

        this.load.json('gameData', 'jogo.json');

        this.load.image('game_bg', 'assets/images/game_bg.png');
        this.load.image('words_bg', 'assets/images/words_bg.png');
        this.load.image('words_img', 'assets/images/words_img.png');
        this.load.image('capa_bg', 'assets/images/capa_bg.png');
        this.load.image('Text_1', 'assets/images/Text_1.png');
        this.load.image('Text_2', 'assets/images/Text_2.png');
        this.load.image('Text_3', 'assets/images/Text_3.png');
        this.load.image('Text_4', 'assets/images/Text_4.png');
    }
  
    async create() {    
        const data = this.cache.json.get('gameData');
    
        this.registry.set('gameData', data);
    
        this.scene.start('GameScene', { data });
      }
  }
  