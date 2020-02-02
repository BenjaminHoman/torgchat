
function gameWidth(){
	return window.innerWidth/5;
}

function gameHeight(){
	return window.innerHeight/5;
}

function isMobileRight(phaser){
	return phaser.input.activePointer.isDown && phaser.input.activePointer.x > gameWidth()/2;
}

function isMobileLeft(phaser){
	return phaser.input.activePointer.isDown && phaser.input.activePointer.x < gameWidth()/2;
}

function isMobileUp(phaser){
	return phaser.input.activePointer.isDown && phaser.input.activePointer.y < gameHeight()/2;
}