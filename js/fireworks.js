window.reqAnimFra = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
      window.setTimeout(callback, 1000/60);
    };
})();

var canvas = document.getElementById('canvas'),
  cCon = canvas.getContext('2d'),
  w = window.innerWidth,
  h = window.innerHeight,
  bungaApi = [],
  particles = [],
  hue,
  totalLim = 8,
  tickLim = 0,
  totalTimer = 15,
  tickTimer = 0,
  mousedown = false,
  mx,
  my;

  canvas.width = w;
  canvas.height = h;

  function random(min, max){
    return Math.random() * (max - min) + min;
  }

function kiraJarak(px1, py1, px2, py2){
  var jarakX = px1 - px2,
      jarakY = py1 - py2;
  return Math.sqrt(Math.pow(jarakX, 2) + Math.pow(jarakY, 2));
}

function bApi(sx, sy, tx, ty){
  this.x = sx;
  this.y = sy;

  this.sx = sx;
  this.sy = sy;

  this.tx = tx;
  this.ty = ty;

  this.distanceToTarget = kiraJarak(sx, sy, tx, ty);
  this.distanceTraveled = 0;

  this.coordinates = [];
  this.coordinateCount = 3;

  while(this.coordinateCount--){
    this.coordinates.push([this.x, this.y]);
  }

  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = 2;
  this.acceleration = 1.05;
  this.brightness = random(50, 70);
  this.targetRadius = 0.5;
}

bApi.prototype.update = function (index){
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);

  if(this.targetRadius < 2.5){
    this.targetRadius += 0.085;
  } else{
    this.targetRadius = 0.5;
  }

  this.speed *= this.acceleration;

  var vx = Math.cos(this.angle) * this.speed,
      vy = Math.sin(this.angle) * this.speed;
  this.distanceTraveled = kiraJarak(this.sx, this.sy, this.x + vx,
     this.y + vy);

  if(this.distanceTraveled >= this.distanceToTarget){
    createParticles(this.tx, this.ty);
    bungaApi.splice(index,1);
  }else {
    this.x += vx;
    this.y += vy;
  }
}

bApi.prototype.draw = function(){
  cCon.beginPath();

  cCon.moveTo(this.coordinates[this.coordinates.length - 1][0],
    this.coordinates[this.coordinates.length - 1][1]);
  cCon.lineTo(this.x, this.y);
  cCon.strokeStyle = 'hsl(' + hue + ', 100%,' + this.brightness + '%)';
  cCon.stroke();
  cCon.beginPath();

  cCon.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
  cCon.stroke();
}

function Particles(x, y){
  this.x = x;
  this.y = y;

  this.coordinates = [];
  this.coordinateCount = 9;

  while(this.coordinateCount--){
    this.coordinates.push([this.x, this.y]);
  }

  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  this.friction = 0.95;
  this.gravity = 1;
  this.hue = random(hue - 50, hue + 50);
  this.brightness = random(50, 80);
  this.alpha = 1;
  this.decay = random(0.015, 0.03);
}

Particles.prototype.update = function (index){
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);

  this.speed *= this.friction;

  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;

  this.alpha -= this.decay;

  if(this.alpha <= this.decay){
    particles.splice(index, 1);
  }
}

Particles.prototype.draw = function(){
  cCon.beginPath();

  cCon.moveTo(this.coordinates[this.coordinates.length - 1][0],
    this.coordinates[this.coordinates.length - 1][1]);
  cCon.lineTo(this.x, this.y);
  cCon.strokeStyle = 'hsla(' + this.hue + ', 100%,' + this.brightness + '%,'
    + this.alpha + ')';
  cCon.stroke();
}

function createParticles(x, y){
  var particleCount = 60;
  while(particleCount--){
    particles.push(new Particles(x, y));
  }
}

function loop(){
  reqAnimFra(loop);

  hue = random(0, 360);

  cCon.globalCompositeOperation = 'destination-out';
  cCon.fillStyle = 'rgba(0, 0, 0, 0.5)';
  cCon.fillRect(0, 0, w, h);
  cCon.globalCompositeOperation = 'lighter';

  var i = bungaApi.length;
  while(i--){
    bungaApi[i].draw();
    bungaApi[i].update(i);
  }

  var i = particles.length;
  while(i--){
    particles[i].draw();
    particles[i].update(i);
  }

  if(tickTimer >= totalTimer){
    if(!mousedown){
      bungaApi.push(new bApi(w / 2, h, random(0, w), random(0, h / 2)));
      tickTimer = 0;
    }
  } else{
      tickTimer++;
  }

  if( tickLim >= totalLim){
    if(mousedown){
      bungaApi.push(new bApi(w / 2, h, mx, my));
      tickLim = 0;
    }
  } else {
    tickLim++;
  }
}

canvas.addEventListener('mousemove', function(e){
  mx = e.pageX - canvas.offsetLeft;
  my = e.pageY - canvas.offsetTop;
});

canvas.addEventListener('mousedown', function(e){
  e.preventDefault();
  mousedown = true;
});

canvas.addEventListener('mouseup', function(e){
  e.preventDefault();
  mousedown = false;
});

window.onload = loop;
