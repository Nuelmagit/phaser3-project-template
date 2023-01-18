import Phaser from 'phaser';
import "./chat";
import "./refreshToken";
import {BootScene} from "./scenes/boot-scene";
import {WorldScene} from "./scenes/world-scene";
const baseUrl = "http://localhost:3000";


function signIn() {
    var data = {
      email: "b@b.com",
      password: "123"
    };
    $.ajax({
      type: 'POST',
      url: `${baseUrl}/login`,
      data,
      success: function (data) {
        console.log(data)
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        //window.location.replace('/game.html');
      },
      error: function (xhr) {
        window.alert(JSON.stringify(xhr));
        window.location.replace('/index.html');
      }
    });
  }


  signIn();


var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 640,
    height: 480,
    zoom: 3,
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: {
          y: 0
        },
        debug: true // set to true to view zones
      }
    },
    scene: [
      BootScene,
      WorldScene
    ]
  };
var game = new Phaser.Game(config);