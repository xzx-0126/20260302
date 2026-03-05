let shapes = [];
let song;
let amplitude;
let points = [[-3, 5], [3, 7], [1, 5],[2,4],[4,3],[5,2],[6,2],[8,4],[8,-1],[6,0],[0,-3],[2,-6],[-2,-3],[-4,-2],[-5,-1],[-6,1],[-6,2]];

function preload() {
  song = loadSound('midnight-quirk-255361.mp3', () => {}, () => {
    console.error("Failed to load audio file.");
    alert("Audio file not found! Please ensure 'midnight-quirk-255361.mp3' is in the same folder.");
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();

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
      scale(-sizeFactor, -sizeFactor); // 向右移動時左右顛倒
    } else {
      scale(sizeFactor, -sizeFactor); // 向左移動時恢復原樣
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
