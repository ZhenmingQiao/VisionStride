let video;
let keyNames = [
  "topRightCorner",
  "topLeftCorner",
  "bottomRightCorner",
  "bottomLeftCorner",
];
let qrCodePos;
let qrCodeSize = 0;
let peoplePos;
let direction = 0;
let distance = 0;
let danger = false;
let lastTime = 0;
let sounds = [];
let infoMusicTime = 0;
let lastDirection = 0;
let lastDistance = 0;
let lastSendTime = 0;
let stopSoundEnable = true;
let timerId = null;

function preload() {
  sounds.push(loadSound("sounds/10oclock.m4a"));
  sounds.push(loadSound("sounds/11oclock.m4a"));
  sounds.push(loadSound("sounds/12oclock.m4a"));
  sounds.push(loadSound("sounds/1oclock.m4a"));
  sounds.push(loadSound("sounds/2oclcok.m4a"));
  sounds.push(loadSound("sounds/Left_turn.m4a"));
  sounds.push(loadSound("sounds/Right_turn.m4a"));
  sounds.push(loadSound("sounds/Step_down.m4a"));
  sounds.push(loadSound("sounds/Stop_stop_stop.m4a"));
  sounds.push(loadSound("sounds/inonemeter.m4a"));
  sounds.push(loadSound("sounds/inthreemeters.m4a"));
}

async function setup() {
  createCanvas(800, 600);

  let constraints = {
    video: {
      facingMode: { exact: "environment" }, // 调用后置摄像头
    },
  };
  video = createCapture(constraints);
  video.size(640, 480);
  video.hide();

  frameRate(30);
  noStroke();
  imageMode(CENTER);

  qrCodePos = createVector(0, 0);
  peoplePos = createVector(width / 2, height);
}

function draw() {
  background(220);

  image(video, width / 2, height / 2, width, height);

  loadPixels();
  let d = pixelDensity();
  const code = jsQR(pixels, width * d, height * d);
  if (code) {
    for (let i = 0; i < 4; i++) {
      let k = keyNames[i];
      let val = code.location[k];
      ellipse(val.x / d, val.y / d, 5, 5);
    }

    let startP = code.location.topLeftCorner;
    let endP = code.location.bottomRightCorner;
    qrCodePos.x = abs(startP.x - endP.x) / d / 2 + startP.x / d;
    qrCodePos.y = abs(startP.y - endP.y) / d / 2 + startP.y / d;
    qrCodeSize = abs(startP.x - endP.x);
  }

  danger = !code;

  if (danger) {
    if (lastTime == 0) {
      lastTime = millis();
    }

    if (millis() - lastTime > 1500) {
      playDangerMusic();
      lastTime = 0;
    }
  } else {
    lastTime = 0;
    stopSoundEnable = true;
  }

  fill(255, 255, 0);
  ellipse(peoplePos.x, peoplePos.y, 100, 100);
  fill(255, 25, 5);
  ellipse(qrCodePos.x, qrCodePos.y, 10, 10);

  let angle = calculateAngle(peoplePos, qrCodePos);
  direction = angleToClock(angle);

  distance = int(map(qrCodeSize, 500, 50, 1, 5)); //改二维码大小来调整距离

  textSize(18);
  fill(255);
  text("Direction：" + direction + "o'clock", 8, 26);
  text("Distance：" + distance + "meters", 8, 44);
  text("Alarm：" + (danger ? "on" : "off"), 8, 62);

  if (lastDirection != direction || lastDistance != distance) {
    playInfoMusic();
  }

  let leftServo = 0;
  let rightServo = 0;
  if (direction == 10) {
    leftServo = 255;
  } else if (direction == 11) {
    leftServo = 100;
  }
  if (direction == 1) {
    rightServo = 100;
  }
  if (direction == 2) {
    rightServo = 255;
  }

  lastDirection = direction;
  lastDistance = distance;
}

function playInfoMusic() {
  if (!danger && !sounds[8].isPlaying()) {
    for (let i = 0; i < sounds.length; i++) {
      sounds[i].stop();
    }
    if (timerId) {
      clearTimeout(timerId);
    }

    if (direction == 10) {
      sounds[0].play();
    } else if (direction == 11) {
      sounds[1].play();
    } else if (direction == 1) {
      sounds[3].play();
    } else if (direction == 2) {
      sounds[4].play();
    } else if (direction == 12) {
      sounds[2].play();
    }

    timerId = setTimeout(() => {
      if (distance < 3) {
        sounds[9].play();
      } else {
        sounds[10].play();
      }
    }, 1000);
  }
}

function playDangerMusic() {
  if (stopSoundEnable) {
    stopSoundEnable = false;
    if ([10, 11].includes(direction)) {
      let m = sounds[5];
      if (!m.isPlaying()) {
        m.play();
      }
      console.log("向左");
    } else if ([1, 2].includes(direction)) {
      let m = sounds[6];
      if (!m.isPlaying()) {
        m.play();
      }
      console.log("向右");
    } else {
      let m = sounds[8];
      if (!m.isPlaying()) {
        m.play();
      }
    }
  }
}

function calculateAngle(A, B) {
  let deltaX = B.x - A.x;
  let deltaY = A.y - B.y;
  let angle = degrees(atan2(deltaY, deltaX));
  return angle;
}

function angleToClock(angle) {
  if (angle < 0) {
    angle += 360;
  }

  let clockAngle = (450 - angle) % 360;
  let clockHour = round(clockAngle / 30);

  if (clockHour == 0) {
    clockHour = 12;
  }

  return clockHour;
}

function blobToString(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result);
    };

    reader.onerror = function () {
      reject(new Error("Failed to read blob as string."));
    };

    reader.readAsText(blob);
  });
}
