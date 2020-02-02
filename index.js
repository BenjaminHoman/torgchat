const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const uuidv1 = require('uuid/v1');
const port = 3000;

var clients = [];

app.use(express.static('public'));

app.ws('/event-endpoint', function(ws, req){
	if (ws.readyState === ws.OPEN){
		ws.client_id = uuidv1();
		ws.send(JSON.stringify({
			which: "current state",
			positions: getPositions(clients)
		}));
		clients.push(ws);
		console.log(`new connection ${ws.client_id}`);
	}

	ws.on('message', function(msg){
		var data = JSON.parse(msg);
		if (data.which == "new player"){
			data.client_id = ws.client_id;
			ws.x = data.x;
			ws.y = data.y;
			ws.anim = data.anim;
			ws.flipX = data.flipX;
			broadCast(clients, JSON.stringify(data), ws.client_id);
			console.log(`ws message from: ${ws.client_id} message: ${msg}`);

		} else if (data.which == "my position"){
			ws.x = data.x;
			ws.y = data.y;
			ws.anim = data.anim;
			ws.flipX = data.flipX;
		}
	});
	ws.on('close', function(connection){
		clients = clients.filter((cli) => cli.client_id != ws.client_id);
		broadCast(clients, JSON.stringify({
			which: "remove player",
			client_id: ws.client_id

		}), ws.client_id);
		console.log(`socket disconnected: ${ws.client_id} clients left ${clients.length}`);
	});
	ws.on('error', function(msg){
		console.log("Error occured");
	});
});

function broadCast(clients, event, id){
	console.log('broadcasting pass');
	clients.forEach(function(client){
		if (client.client_id != id && client.readyState === client.OPEN){
			client.send(event);
			console.log('broadcasting');
		}
	});
}

function broadCastAll(clients, event){
	clients.forEach(function(client){
		if (client.readyState === client.OPEN){
			client.send(event);
		}
	});
}

function getPositions(clients){
	return clients.map(function(client){
		return {
			client_id: client.client_id, 
			x: client.x,
			y: client.y,
			anim: client.anim,
			flipX: client.flipX
		};
	});
}

setInterval(function(){
	var positions = getPositions(clients);
	broadCastAll(clients, JSON.stringify({
		which: "set positions",
		positions: positions

	}));

}, 10);

app.listen(port, () => console.log(`App listening on port ${port}`));