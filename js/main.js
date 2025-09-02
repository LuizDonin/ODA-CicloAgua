import GameScene from './GameScene.js'
import dataLoader from './dataLoader.js'
import dragSystem from './dragSystem.js'
import quizSystem from './quizSystem.js'

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: "#000000",
    parent: "game-container",
    scale: {
    mode: Phaser.Scale.FIT,
    width: 1920,
    height: 1080,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    fontFamily: 'Nunito',
    min: {
        width: 320,
        height: 180
    },
    max: {
        width: 1920,
        height: 1080
    },
    expandParent: true
},
    scene: [dataLoader, GameScene, dragSystem, quizSystem],
};

new Phaser.Game(config);
