
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