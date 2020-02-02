
class ClientEvent {
	constructor(){
		this.type = "";
	}
}

class ServerInterface {
	constructor(handlers){
		this.sock = null;
		this.handlers = handlers;
	}

	connect(){
		this.sock = this.createSocket();
	}

	createSocket(){
		var sock = new WebSocket(this.socketUrl());
		var that = this;
		sock.onopen = function(event){
			console.log("Connected to: " + that.socketUrl());
			//sock.send('this is a message');
			that.handlers.handleNewSelf(sock);
		}
		sock.onmessage = function(event){
			var data = JSON.parse(event.data);
			if (data.which == "new player"){
				that.handlers.handleNewPlayer(data);

			} else if (data.which == "remove player"){
				that.handlers.handleRemovePlayer(data);

			} else if (data.which == "set positions"){
				that.handlers.handleSetPositions(data);

			} else if (data.which == "current state"){
				that.handlers.handleCurrentState(data);
			}
		}
		return sock;
	}

	socketUrl(){
		let host = window.location.hostname + (window.location.port ? ':'+window.location.port : '');
		return `ws://${host}/event-endpoint`;
	}

	onSceneInit(){
		console.log("Override this!");
	}
}