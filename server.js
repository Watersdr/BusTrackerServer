const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let LocationMap = {};
let MethodMap = {};
methodMap['subscribe'] = subscribe;
methodMap['unsubscribe'] = unsubscribe;
methodMap['publish'] = publish;
methodMap['endPublish'] = endPublish;
methodMap['emitLocation'] = emitLocation;

wss.on('connection', function connection(ws) {
    ws.on('message', data => {
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        }
        catch(error) {
            console.log('Invalid JSON');
        }
        const method = methodMap[jsonData.method];
        if(!method)
        {
            console.log('Invalid method');
        }
        try {
            method(jsonData);
        }
        catch(error) {
            console.log('Internal error handling client message');
        }
    });
});

function subscribe(ws, jsonData)
{
    const locationID = jsonData.locationID;
    if (isNaN(locationID))
        return;
    let subscription = LocationMap[locationID];
    subscription.subscribe(ws);
}

function unsubscribe(ws, jsonData)
{

}

function publish(ws, jsonData)
{
    const locationID = jsonData.locationID;
    if (isNaN(locationID))
        return;
    LocationMap[locationID] = new Subscription(ws, locationID);
}

function emitLocation(ws, jsonData)
{

}

function endPublish(ws, jsonData)
{

}

class Subscription {
    constructor(publisherSocket,locationID) {
        this.publisherSocket = publisherSocket;
        this.locationID = locationID;
        this.subscribers = [];
        this.locationHistory = [];
        this.latestLocation = {};
    }

    subscribe(subscriberSocket) {
        this.subscribers.push(subscriberSocket);
    }

    unsubscribe(subscriberSocket) {

    }

    broadcast() {
        const message = new LatestLocationMessage(subscribers, latestLocation);
        message.send();
    }
}

class LatestLocationMessage extends Message {
    constructor(receivers, location) {
        // Don't pass in an ack (callback) because for now the server
        // doesn't care if the client gets the message or not
        super(receivers, 'LatestLocation', location);
    }
}

class Message {
    constuctor(receivers, method, payload, ack){
        this.receivers = receivers;
        this.method = method;
        this.payload = payload;
        this.ack = ack;
    }

    send() {
        const data = {method: this.method, ...this.payload};
        const message = JSON.stringify(data);
        if(this.ack) {
            for (let receiver of this.receivers)
                receiver.send(message, this.ack);
        }
        else {
            for (let receiver of this.receivers)
                receiver.send(message);
        }
    }
}