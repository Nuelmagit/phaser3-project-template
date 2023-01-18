import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
      super({
        key: 'BootScene',
        active: true
      });
    }
  
    preload() {
      // map tiles
      this.load.image('tiles', 'assets/map/sprsheet.png');
      // map in json format
      this.load.tilemapTiledJSON('map', 'assets/map/tilesetcollection.json');
      // our two characters
      this.load.spritesheet('player', 'assets/orc.png', {
        frameWidth: 32,
        frameHeight: 32
      });
  
      this.load.spritesheet('male_pirate', 'assets/outfits/descarga64.png', {
        frameWidth: 64,
        frameHeight: 64
      });
  
      this.load.spritesheet('male_addon_1', 'assets/outfits/descarga64.png', {
        frameWidth: 64,
        frameHeight: 64
      });
  
  
      this.load.image('golem', 'assets/images/coppergolem.png');
      this.load.image('ent', 'assets/images/dark-ent.png');
      this.load.image('demon', 'assets/images/demon.png');
      this.load.image('worm', 'assets/images/giant-worm.png');
      this.load.image('wolf', 'assets/images/wolf.png');
      this.load.image('sword', 'assets/images/attack-icon.png');
    }
  
    create() {
      console.log(this);
      this.scene.start('WorldScene');
    }
  }