const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  console.log('hey man');
  // Maximimum latitude and longitude values (min = -max)
  const maxLat = 5;
  const maxLong = 5;

  // Calculate a minute of latitude/longitude
  const minuteLat = 1 / (maxLat * 10);
  const minuteLong = 1 / (maxLong * 10);
  let lat = 39.7684;
  let long = -86.1581;

  setInterval(() => {
    // Send to Client
    console.log('sending');
    ws.send(JSON.stringify({ latitude: lat, longitude: long }));

    //Update latitude and longitude up to a minute increment
    lat += Math.random() * minuteLat * (Math.random() < 0.5 ? -1 : 1);
    long += Math.random() * minuteLong * (Math.random() < 0.5 ? -1 : 1);
  }, 5000);
});