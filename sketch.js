let shapes = [];
let song;
let amplitude;
let points = [[-3, 5], [3, 7], [1, 5],[2,4],[4,3],[5,2],[6,2],[8,4],[8,-1],[6,0],[0,-3],[2,-6],[-2,-3],[-4,-2],[-5,-1],[-6,1],[-6,2]];
let bubbles = [];
let bursts = [];

// 水泡破裂粒子類別
class BurstParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 1);
    this.alpha = 255;
    this.size = random(2, 5);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // 重力效果
    this.alpha -= 8;
  }

  display() {
    push();
    noStroke();
    fill(100, 150, 255, this.alpha);
    circle(this.x, this.y, this.size);
    pop();
  }

  isAlive() {
    return this.alpha > 0;
  }
}

// 破裂效果類別
class Burst {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.particles = [];
    
    // 生成破裂粒子
    for (let i = 0; i < 12; i++) {
      this.particles.push(new BurstParticle(x, y));
    }
  }

  update() {
    for (let p of this.particles) {
      p.update();
    }
  }

  display() {
    // 繪製破裂中心的漣漪效果
    push();
    strokeWeight(2);
    stroke(100, 150, 255, 150);
    noFill();
    circle(this.x, this.y, this.radius);
    pop();

    // 繪製粒子
    for (let p of this.particles) {
      p.display();
    }
  }

  isAlive() {
    return this.particles.some(p => p.isAlive());
  }
}

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x; // 水泡的初始 x 座標
    this.y = y; // 水泡的初始 y 座標（從畫面底部開始）
    this.radius = random(5, 20); // 隨機大小
    this.velocityY = random(-1.5, -0.5); // 向上漂浮的速度 
    this.velocityX = random(-0.5, 0.5); // 輕微的橫向漂動
    this.alpha = 200; 
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
     this.alpha -= 0.2; 
  }

  display() {
    push();
    strokeWeight(2);
    stroke(100, 150, 255, this.alpha);
    fill(100, 150, 255, this.alpha / 3);
    circle(this.x, this.y, this.radius * 2);
    pop();
  }

  isAlive() {
    return this.y > -50 && this.alpha > 0;
  }

  isBurst() {
    return this.y < 0; // 到達距離頂部 800神px 的位置時破裂
  }
}

function preload() {
  song = loadSound('midnight-quirk-255361.mp3', () => {}, () => {
    console.error("Failed to load audio file.");
    alert("Audio file not found! Please ensure 'midnight-quirk-255361.mp3' is in the same folder.");
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();

  // 初始化水泡
  for (let i = 0; i < 8; i++) {
    bubbles.push(new Bubble(random(windowWidth), windowHeight + 20));
  }

  // 產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    // 透過 map() 讀取全域陣列 points，產生變形後的頂點
    let multiplier = random(10, 30); // 移到這裡，讓整個形狀使用同一個縮放倍數
    let shapePoints = points.map(pt => {
      return {
        x: pt[0] * multiplier,
        y: pt[1] * multiplier
      };
    });

    shapes.push({
      x: random(windowWidth),
      y: random(windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      points: shapePoints
    });
  }
}

function draw() {
  background('#ffcdb2');
  strokeWeight(2);

  // 隨機生成新的水泡
  if (random() < 0.15) { // 15% 的概率每幀生成新水泡
    bubbles.push(new Bubble(random(windowWidth), windowHeight + 10));
  }

  // 更新和顯示水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    
    // 檢查是否到達頂部破裂
    if (bubbles[i].isBurst()) {
      bursts.push(new Burst(bubbles[i].x, bubbles[i].y, bubbles[i].radius));
      bubbles.splice(i, 1);
    } else {
      bubbles[i].display();
      
      // 移除已消失的水泡
      if (!bubbles[i].isAlive()) {
        bubbles.splice(i, 1);
      }
    }
  }

  // 更新和顯示破裂效果
  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].update();
    bursts[i].display();
    
    // 移除已消失的破裂效果
    if (!bursts[i].isAlive()) {
      bursts.splice(i, 1);
    }
  }

  // 取得當前音量並計算縮放倍率
  let level = amplitude.getLevel();
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) shape.dx *= -1;
    if (shape.y < 0 || shape.y > windowHeight) shape.dy *= -1;

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放並繪製
    push();
    translate(shape.x, shape.y);
    if (shape.dx > 0) {
      scale(-sizeFactor, sizeFactor); // 向右移動時左右顛倒
    } else {
      scale(sizeFactor, sizeFactor); // 向左移動時恢復原樣
    }
    beginShape();
    for (let pt of shape.points) {
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);
    pop();
    
  }

  if (song && song.isLoaded() && !song.isPlaying()) {
    fill(50);
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Click to Play', width / 2, height / 2);
  }
}

function mousePressed() {
  if (!song || !song.isLoaded()) return;
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}
