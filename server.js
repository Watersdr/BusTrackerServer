const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  console.log('hey man');
  // Maximimum latitude and longitude values (min = -max)
  const maxLat = 85;
  const maxLong = 180;

  // Calculate a minute of latitude/longitude
  // = 1/(range * 60)
  const minuteLat = 1/(maxLat*120);
  const minuteLong = 1/(maxLong*120);

  // Initialize lat and long anywhere between max/min bounds
  let lat = Math.random() * maxLat * (Math.random < 0.5 ? -1 : 1);
  let long = Math.random() * maxLong * (Math.random < 0.5 ? -1 : 1)
  
  while(1) {
    
        // Send to Client
      setTimeout(() => {
          ws.send({latitude: lat.toString(), longitude: long.toString()});
      }, 5000);

      //Update latitude and longitude up to a minute increment
      lat += Math.random() * minuteLat * (Math.random < 0.5 ? -1 : 1);
      long += Math.random() * minuteLong * (Math.random < 0.5 ? -1 : 1);

      // Bounds check
      lat = (lat > maxLat ? maxLat : lat);
      lat = (lat < -maxLat ? -maxLat : lat);
      long = (long > maxLong ? maxLong : long);
      long = (long < -maxLong ? -maxLong : long);
  }
  //ws.on('message', function incoming(message) {
     //console.log('received: %s', message);
  //});
});