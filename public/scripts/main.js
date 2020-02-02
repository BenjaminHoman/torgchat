
class Torgman {
	constructor(phaser, groundLayer, x, y){
		if (x == null){
			x = Phaser.Math.Between(0, 350);
		}
		this.player = phaser.physics.add.sprite(x, y, 'torgman');
		this.player.setScale(0.3);
		this.player.setOrigin(0);
		this.player.setBounce(0);
		this.player.setCollideWorldBounds(true);

		phaser.physics.add.collider(groundLayer, this.player);

		phaser.anims.create({
			key: 'walk',
			frames: phaser.anims.generateFrameNumbers('torgman', { start: 1, end: 3 }),
			frameRate: 10,
			repeat: -1
		});

		phaser.anims.create({
			key: 'idle',
			frames: [{ key: 'torgman', frame: 0 }],
			frameRate: 20
		});

		phaser.anims.create({
			key: 'jump',
			frames: [{ key: 'torgman', frame: 4 }],
			frameRate: 20
		});
	}
}

var config = {
	type: Phaser.AUTO,
	width: window.innerWidth/5,
	height: window.innerHeight/5,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 1000 },
			debug: false
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	},
	antialias: false
};

var game = new Phaser.Game(config);
var phaser = null;
var groundLayer = null;
var player = null;
var otherPlayersMap = new Map();
var stars = null;
var cursors = null;
var pointer = null;
var score = 0;
var scoreText = null;
var fog = null;
var fog2 = null;
var si = null;
var intervalStarted = false;

function preload() {
	this.load.tilemapTiledJSON('map', 'assets/stage1.json');
	this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 16, frameHeight: 16});

	this.load.spritesheet('torgman',
		'assets/torgman_small.png',
		{ frameWidth: 117, frameHeight: 100 }
	);

	this.load.image('sky', 'assets/background.png');
	this.load.image('fog', 'assets/fog.png');
}

function create() {
	this.add.tileSprite(0, 0, 5000, 5000, 'sky').setScrollFactor(0.5);

	// load the map 
    map = this.make.tilemap({key: 'map'});
    
    var groundTiles = map.addTilesetImage('tiles');
    groundLayer = map.createDynamicLayer('ground', groundTiles, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);

    var arcadeLayer = map.createDynamicLayer('arcade', groundTiles, 0, 0);
    arcadeLayer.setCollisionByExclusion([-1]);
 
    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

	// //create player
	player = new Torgman(this, groundLayer, null, 0);

	this.cameras.main.setBounds(0,0, 800, 600);
	this.cameras.main.startFollow(player.player);
	this.cameras.main.setBackgroundColor(0xbababa)

	cursors = this.input.keyboard.createCursorKeys();
	pointer = this.input.activePointer;

	fog = this.add.tileSprite(0, 0, 5000, 5000, 'fog').setScrollFactor(0.8);
	fog2 = this.add.tileSprite(100, 0, 5000, 5000, 'fog').setScrollFactor(0.8);

	phaser = this;

	si = new ServerInterface({
		handleNewPlayer: function(data){
			var newPlayer = new Torgman(phaser, groundLayer, data.x, data.y);
			newPlayer.client_id = data.client_id;
			otherPlayersMap.set(newPlayer.client_id, newPlayer);
			console.log(`new player. id: ${data.client_id}`);
		},
		handleRemovePlayer: function(data){
			var otherPlayer = otherPlayersMap.get(data.client_id);
			if (otherPlayer){
				otherPlayer.player.destroy();
				otherPlayersMap.delete(data.client_id);
			}
			console.log(`remove player. id: ${data.client_id}`);
		},
		handleSetPositions: function(data){
			data.positions.forEach(function(position){
				var other = otherPlayersMap.get(position.client_id);
				if (other){
					other.player.x = position.x;
					other.player.y = position.y;
					other.player.anims.play(position.anim, true);
					other.player.flipX = position.flipX;
				}
			});
			//console.log('set positions');
		},
		handleCurrentState: function(data){
			data.positions.forEach(function(pos){
				if (pos.client_id !== player.client_id){
					var newPlayer = new Torgman(phaser, groundLayer, pos.x, pos.y);
					newPlayer.client_id = pos.client_id;
					otherPlayersMap.set(newPlayer.client_id, newPlayer);
					console.log(`current player. id: ${newPlayer.client_id}`);
				}
			});
		},
		handleNewSelf: function(sock){
			sock.send(JSON.stringify({
				which: 'new player',
				x: player.player.x,
				y: player.player.y,
				anim: player.anim,
				flipX: player.flipX
			}));
		}
	});
	si.connect();
}

function leftTouch(){
	var pointerDown = phaser.input.activePointer.isDown;
	let halfX = window.innerWidth/5/2;
	let halfY = window.innerHeight/5/2;

	if (pointerDown){
		let x = phaser.input.activePointer.x;
		let y = phaser.input.activePointer.y;

		if (x < halfX){
			return true;
		}
	}
	return false;
}

function rightTouch(){
	var pointerDown = phaser.input.activePointer.isDown;
	let halfX = window.innerWidth/5/2;
	let halfY = window.innerHeight/5/2;

	if (pointerDown){
		let x = phaser.input.activePointer.x;
		let y = phaser.input.activePointer.y;

		if (x > halfX){
			return true;
		}
	}
	return false;
}

function upTouch(){
	var pointerDown = phaser.input.activePointer.isDown;
	let halfX = window.innerWidth/5/2;
	let halfY = window.innerHeight/5/2;

	if (pointerDown){
		let x = phaser.input.activePointer.x;
		let y = phaser.input.activePointer.y;

		if (y < halfY){
			return true;
		}
	}
	return false;
}

function update() {
	if (cursors.left.isDown || leftTouch()) {
		player.player.setVelocityX(-100);
		player.player.anims.play('walk', true);
		player.player.flipX = true;
		player.anim = 'walk';
		player.flipX = true;

	} else if (cursors.right.isDown || rightTouch()) {
		player.player.setVelocityX(100);
		player.player.anims.play('walk', true);
		player.player.flipX = false;
		player.anim = 'walk';
		player.flipX = false;

	} else {
		player.player.setVelocityX(0);
		player.player.anims.play('idle');
		player.anim = 'idle';
	}

	if ((cursors.up.isDown || upTouch()) && player.player.body.onFloor()) {
		player.player.setVelocityY(-330);
	}

	if (!player.player.body.onFloor()){
		player.player.anims.play('jump', true);
		player.anim = 'jump';
	}

	fog.tilePositionX += 0.1;
	fog2.tilePositionX += 0.3;
	fog2.tilePositionY += 0.15;

	if (!intervalStarted){
		intervalStarted = true;
		setInterval(function(){
			if (si.sock.readyState === si.sock.OPEN){
				si.sock.send(JSON.stringify({
					which: "my position",
					x: player.player.x,
					y: player.player.y,
					anim: player.anim,
					flipX: player.flipX
				}));
			}

		}, 10);
	}
}