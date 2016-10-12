// Rocky.js
var rocky = require('rocky');

// Global object to store weather data
var weather;

rocky.on('hourchange', function(event) {
  // Send a message to fetch the weather information (on startup and every hour)
  rocky.postMessage({'fetch': true});
});

rocky.on('secondchange', function(event) {
  // Tick every second (required to make sure digital clock seconds update)
  rocky.requestDraw();
});

rocky.on('message', function(event) {
  // Receive a message from the mobile device (pkjs)
  var message = event.data;

  if (message.weather) {
    // Save the weather data
    weather = message.weather;

    // Request a redraw so we see the information
    rocky.requestDraw();
  }
});

rocky.on('draw', function(event) {
  var ctx = event.context;
  var d = new Date();

  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Determine the center point of the display
  // and the max size of watch hands

  var clockX = w / 2;
  var clockY = h / 2;

  var maxLength = (Math.min(w / 2, h / 2)) / 2.2;

  // Calculate the minute hand angle
  var minuteFraction = (d.getMinutes()) / 60;
  var minuteAngle = fractionToRadian(minuteFraction);

  // Draw the minute hand
  drawHand(ctx, clockX , clockY, minuteAngle, maxLength, 'lightgray');

  // Calculate the hour hand angle
  var hourFraction = (d.getHours() % 12 + minuteFraction) / 12;
  var hourAngle = fractionToRadian(hourFraction);

  drawHand(ctx, clockX, clockY, hourAngle, maxLength * 0.6, 'lightblue');
  drawCircle(ctx, clockX, clockY, maxLength * 1.5, 2, 'lightgray');
  drawHourTicks(ctx, clockX, clockY, maxLength * 1.5, 7, Math.PI / 60, 'lightgray');
  drawDigitalTime(ctx, 3.5 * w / 5, 2);
  drawDay(ctx, w / 5, 2);

  // Draw Weather on the bottom of the screen, if available
  if (weather) {
    drawWeather(ctx, weather, w / 2, 8 * h / 10);
  }
});

function drawDigitalTime(ctx, cx, cy) {

  var text = new Date().toLocaleTimeString();

  ctx.fillStyle = 'lightgray';
  ctx.textAlign = 'center';
  ctx.font = '24px bold Gothic';

  ctx.fillText(text, cx, cy, 70);
}

function drawDay(ctx, cx, cy) {
  var day = '';
  switch (new Date().getDay()) {
    case 0:
        day = "SUN";
        break;
    case 1:
        day = "MON";
        break;
    case 2:
        day = "TUE";
        break;
    case 3:
        day = "WED";
        break;
    case 4:
        day = "THU";
        break;
    case 5:
        day = "FRI";
        break;
    case 6:
        day = "SAT";
    }

    ctx.fillStyle = 'lightgray';
    ctx.textAlign = 'center';
    ctx.font = '24px bold Gothic';

    ctx.fillText(day, cx, cy, 30);
}

function drawWeather(ctx, weather, cx, cy) {
  // Create a string describing the weather
  //var weatherString = weather.celcius + 'ºC, ' + weather.desc;
  var weatherString = weather.fahrenheit + ' ºF, ' + weather.desc;

  // Draw the text, top center
  ctx.fillStyle = 'lightgray';
  ctx.textAlign = 'center';
  ctx.font = '24px bold Gothic';
  ctx.fillText(weatherString, cx, cy, 100);
}

function drawHand(ctx, cx, cy, angle, length, color) {
  // Find the end points
  var x2 = cx + Math.sin(angle) * length;
  var y2 = cy - Math.cos(angle) * length;

  // Configure how we want to draw the hand
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;

  // Begin drawing
  ctx.beginPath();

  // Move to the center point, then draw the line
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);

  // Stroke the line (output to display)
  ctx.stroke();
}

function drawCircle(ctx, cx, cy, radius, lineWidth, color) {
  ctx.fillStyle = color;
  ctx.rockyFillRadial(cx, cy, radius - lineWidth, radius, 0, 2 * Math.PI);
}

function drawHourTicks(ctx, cx, cy, outerRadius, tickLength, tickRadian, color) {
  ctx.fillStyle = color;
  for( var tick = 0; tick < 12; tick++) {
    ctx.rockyFillRadial(cx, cy, outerRadius - tickLength, outerRadius, (Math.PI / 6) * tick - (tickRadian / 2), (Math.PI / 6) * tick + (tickRadian / 2));
  }
}

function fractionToRadian(fraction) {
  return fraction * 2 * Math.PI;
}
