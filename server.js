const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let LocationMap = {};
let MethodMap = {};
// Publisher methods
MethodMap['publish'] = publish;
MethodMap['endPublish'] = endPublish;
MethodMap['emitLocation'] = emitLocation;
MethodMap['getHistory'] = getHistory;
MethodMap['subscribe'] = subscribe;
MethodMap['unsubscribe'] = unsubscribe;

wss.on('connection', function connection(ws) {
  ws.on('message', data => {
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    }
    catch (error) {
      console.log('Invalid JSON');
    }
    const method = MethodMap[jsonData.method];
    if (!method) {
      console.log('Invalid method');
    }
    try {
      method(ws, jsonData);
    }
    catch (error) {
      console.log('Internal error handling client message:', error);
    }
  });
});

function subscribe(ws, jsonData) {
  console.log('subscribe');
  const locationID = jsonData.locationID;
  let subscription = LocationMap[locationID];
  if (subscription)
    subscription.subscribe(ws);
}

function unsubscribe(ws, jsonData) {
  console.log('unsubscribe');
}

function getHistory(ws, jsonData) {
  console.log('getHistory');
  const locationID = jsonData.locationID;
  let subscription = LocationMap[locationID];
  if (subscription) {
    subscription.sendHistory(ws);
  }
}

function publish(ws, jsonData) {
  console.log('publish');
  const locationID = jsonData.locationID;
  LocationMap[locationID] = new Subscription(ws, locationID);
}

function emitLocation(ws, jsonData) {
  console.log('emitLocation');
  const locationID = jsonData.locationID;
  let subscription = LocationMap[locationID];
  if (subscription) {
    subscription.addNewLocation(jsonData.location);
    subscription.broadcast();
  }
}

function endPublish(ws, jsonData) {
  console.log('endPublish');
}

class Subscription {
  constructor(publisherSocket, locationID) {
    this.publisherSocket = publisherSocket;
    this.locationID = locationID;
    this.subscribers = [];
    this.locationHistory = [];
    this.latestLocation = {};
  }

  addNewLocation(location) {
    this.latestLocation = location;
    this.locationHistory.push(location);
  }

  subscribe(subscriberSocket) {
    this.subscribers.push(subscriberSocket);
    const message = new SubscriptionSuccessMessage([subscriberSocket]);
    message.send();
  }

  unsubscribe(subscriberSocket) {

  }

  sendHistory(ws) {
    const message = new LocationHistoryMessage([ws], this.locationHistory);
    message.send();
  }

  broadcast() {
    const message = new LatestLocationMessage(this.subscribers, this.latestLocation);
    message.send();
  }
}

class Message {
  constructor(receivers, method, payload, ack) {
    this.receivers = receivers;
    this.method = method;
    this.payload = payload;
    this.ack = ack;
  }

  send() {
    const data = {
      method: this.method,
      payload: this.payload
    };
    const message = JSON.stringify(data);
    if (this.ack) {
      for (let receiver of this.receivers)
        receiver.send(message, this.ack);
    }
    else {
      for (let receiver of this.receivers)
        receiver.send(message);
    }
  }
}

class SubscriptionSuccessMessage extends Message {
  constructor(receivers) {
    super(receivers, 'SubscriptionSuccess');
  }
}

class LatestLocationMessage extends Message {
  constructor(receivers, location) {
    // Don't pass in an ack (callback) because for now the server
    // doesn't care if the client gets the message or not
    super(receivers, 'LatestLocation', location);
  }
}

class LocationHistoryMessage extends Message {
  constructor(receivers, locations) {
    super(receivers, 'LocationHistory', locations)
  }
}
