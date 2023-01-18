import Phaser from 'phaser';
import { io } from "socket.io-client";
const baseUrl = "http://localhost:3000";
export class WorldScene extends Phaser.Scene {
    obstacles;
    constructor() {
      super({
        key: 'WorldScene'
      });

    }
  
    create() {
      this.socket = io(baseUrl);
  
      this.otherPlayers = this.physics.add.group();
  
      // create map
      this.createMap();
      // create player animations
      this.createAnimations();
      // user input
      this.cursors = this.input.keyboard.createCursorKeys();
      // create enemies
      this.createEnemies();
      // listen for web socket events
      this.socket.on('currentPlayers', function (players) {
        console.log("p`layers", players)
        Object.keys(players).forEach(function (id) {
          if (players[id].playerId === this.socket.id) {
            this.createPlayer(players[id]);
          } else {
            this.addOtherPlayers(players[id]);
          }
        }.bind(this));
      }.bind(this));
  
      this.socket.on('newPlayer', function (playerInfo) {
        this.addOtherPlayers(playerInfo);
      }.bind(this));
  
      this.socket.on('playerDisconected', function (playerId) {
        this.otherPlayers.getChildren().forEach(function (player) {
          if (playerId === player.playerId) {
            player.destroy();
          }
        }.bind(this));
      }.bind(this));
  
      this.socket.on('playerMoved', function (playerInfo) {
        this.otherPlayers.getChildren().forEach(function (player) {
          if (playerInfo.playerId === player.playerId) {
            player.flipX = playerInfo.flipX;
            player.setPosition(playerInfo.x, playerInfo.y);
          }
        }.bind(this));
      }.bind(this));
  
      this.socket.on('new message', (data) => {
        const usernameSpan = document.createElement('span');
        const usernameText = document.createTextNode(data.username);
        usernameSpan.className = 'username';
        usernameSpan.appendChild(usernameText);
        const messageBodySpan = document.createElement('span');
        const messageBodyText = document.createTextNode(data.message);
        messageBodySpan.className = 'messageBody';
        messageBodySpan.appendChild(messageBodyText);
        const messageLi = document.createElement('li');
        messageLi.setAttribute('username', data.username);
        messageLi.append(usernameSpan);
        messageLi.append(messageBodySpan);
        addMessageElement(messageLi);
      });
  
    }
  
    
  createMap() {
    // create the map
    this.map = this.make.tilemap({
      key: 'map'
    });
    // first parameter is the name of the tilemap in tiled
    var tiles = this.map.addTilesetImage('tileset', 'tiles', 32, 32, 0, 0);
  
    // creating the layers
    this.map.createLayer('background', tiles, 0, 0);
    this.obstacles = this.map.createLayer('blocked', tiles, 0, 0);
  
    // make all tiles in obstacles collidable
    this.obstacles.setCollisionByExclusion([-1]);
  
    // don't go out of the map
    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;
  }
  
  
  createAnimations() {
  
    /**
     * Outfit animatioons unmount
     */
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('male_pirate', {
        frames: [0, 48, 92, 130, 168, 205,232, 258, 278]
      }),
      frameRate: 10,
      repeat: -1
    });
  
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('male_addon_1', {
        frames: [16]
      }),
      frameRate: 10,
      repeat: -1
    });
  
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('male_pirate', {
        frames: [2, 50, 94, 132, 170, 207, 234, 260, 280]
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('male_pirate', {
        frames: [4, 52, 96, 134, 172, 209, 236, 262, 282]
      }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('male_pirate', {
        frames: [6, 54, 98, 136, 174, 211, 238, 264, 284]
      }),
      frameRate: 10,
      repeat: -1
    });
  
  
    /**
     * Addon 1 animations.
     */
  }
  createPlayer(playerInfo) {
   // our player sprite created through the physics system
   this.player = this.add.sprite(0, 0, 'male_pirate', 0);
   this.container = this.add.container(playerInfo.x, playerInfo.y);
   this.container.setSize(32, 32);
   this.physics.world.enable(this.container);
   this.container.add(this.player);
  console.log(this.player )
   //add addon 1
   this.addon1 = this.add.sprite(0, 0, 'male_addon_1', 16); 
   this.addon1.setScale(0.5);
   this.addon1.setSize(8, 8);
   //this.physics.world.enable(this.addon1);
   this.container.add(this.addon1);
  
   // add weapon
    this.weapon = this.add.sprite(10, 0, 'sword');
    this.weapon.setScale(0.5);
    this.weapon.setSize(8, 8);
    this.physics.world.enable(this.weapon);
    this.container.add(this.weapon);
    this.attacking = false;
  
   // update camera
   this.updateCamera();
   // don't go out of the map
   this.container.body.setCollideWorldBounds(true);
  
    //dont stack with monster
   const result = this.physics.add.collider(this.container, this.spawns);
  
       // don't walk on trees/rocks
  const result2 = this.physics.add.collider(this.container, this.obstacles);
  
   this.physics.add.overlap(this.weapon, this.spawns, this.onMeetEnemy, false, this);
  }
  
  addOtherPlayers(playerInfo) {
    const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'player', 9);
    otherPlayer.setTint(Math.random() * 0xffffff);
    otherPlayer.playerId = playerInfo.playerId;
    this.otherPlayers.add(otherPlayer);
  }
  
  updateCamera() {
    // limit camera to map
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.container);
    this.cameras.main.roundPixels = true; // avoid tile bleed
  }
  
  createEnemies() {
   // where the enemies will be
   this.spawns = this.physics.add.group({
    classType: Phaser.GameObjects.Sprite
  });
  for (var i = 0; i < 20; i++) {
    const location = this.getValidLocation();
    // parameters are x, y, width, height
    var enemy = this.spawns.create(location.x, location.y, this.getEnemySprite());
    enemy.body.setCollideWorldBounds(true);
    enemy.body.setImmovable();
  }
  
  // move enemies
  this.timedEvent = this.time.addEvent({
    delay: 3000,
    callback: this.moveEnemies,
    callbackScope: this,
    loop: true
  });
  
  }
  
  moveEnemies () {
    this.spawns.getChildren().forEach((enemy) => {
      const randNumber = Math.floor((Math.random() * 4) + 1);
      switch(randNumber) {
        case 1:
          enemy.body.setVelocityX(50);
          break;
        case 2:
          enemy.body.setVelocityX(-50);
          break;
        case 3:
          enemy.body.setVelocityY(50);
          break;
        case 4:
          enemy.body.setVelocityY(50);
          break;
        default:
          enemy.body.setVelocityX(50);
      }
    });
    setTimeout(() => {
      this.spawns.setVelocityX(0);
      this.spawns.setVelocityY(0);
    }, 500);
  }
  
  getEnemySprite() {
    var sprites = ['golem', 'ent', 'demon', 'worm', 'wolf'];
    return sprites[Math.floor(Math.random() * sprites.length)];
  }
  getValidLocation() {
    var validLocation = false;
    var x, y;
    while (!validLocation) {
      x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
  
      var occupied = false;
      this.spawns.getChildren().forEach((child) => {
        if (child.getBounds().contains(x, y)) {
          occupied = true;
        }
      });
      if (!occupied) validLocation = true;
    }
    return { x, y };
  }
  
    onMeetEnemy(player, enemy) {
      if (this.attacking) {
        const location = this.getValidLocation();
        enemy.x = location.x;
        enemy.y = location.y;
      }
    }
  
  
    update() {
      if (this.container) {
        this.container.body.setVelocity(0);
  
        // Horizontal movement
        if (this.cursors.left.isDown) {
          this.container.body.setVelocityX(-70);
        } else if (this.cursors.right.isDown) {
          this.container.body.setVelocityX(70);
        }
  
        // Vertical movement
        if (this.cursors.up.isDown) {
          this.container.body.setVelocityY(-80);
        } else if (this.cursors.down.isDown) {
          this.container.body.setVelocityY(80);
        }
  
        // Update the animation last and give left/right animations precedence over up/down animations
        if (this.cursors.left.isDown) {
          this.player.anims.play('left', true);
          //this.player.flipX = true;
  
          //this.weapon.flipX = true;
          this.weapon.setX(-10);
        } else if (this.cursors.right.isDown) {
          this.player.anims.play('right', true);
          //this.player.flipX = false;
  
          //this.weapon.flipX = false;
          this.weapon.setX(10);
        } else if (this.cursors.up.isDown) {
          this.player.anims.play('up', true);
        } else if (this.cursors.down.isDown) {
          this.player.anims.play('down', true);
        } else {
          this.player.anims.stop();
        }
  
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.attacking && document.activeElement !== inputMessage) {
          this.attacking = true;
          setTimeout(() => {
            this.attacking = false;
            this.weapon.angle = 0;
          }, 150);
        }
  
        if (this.attacking) {
          if (this.weapon.flipX) {
            this.weapon.angle -= 10;
          } else {
            this.weapon.angle += 10;
          }
        }
  
        // emit player movement
        var x = this.container.x;
        var y = this.container.y;
        var flipX = this.player.flipX;
        if (this.container.oldPosition && (x !== this.container.oldPosition.x || y !== this.container.oldPosition.y || flipX !== this.container.oldPosition.flipX)) {
          this.socket.emit('playerMovement', { x, y, flipX });
        }
        // save old position data
        this.container.oldPosition = {
          x: this.container.x,
          y: this.container.y,
          flipX: this.player.flipX
        };
      }
    }
  }