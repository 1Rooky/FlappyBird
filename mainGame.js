
const config = {
  type: Phaser.AUTO,
  width: 288 * 2,
  height: 512,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 400 },
      debug: false, 
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
};


function preload() {
    this.load.image("backGround", "Assets/backGroundDay.png");
    this.load.image("greenPipe", "./Assets/pipe-green.png");
    this.load.spritesheet("bird", "./Assets/yellowBirdSheet.png", {
    frameWidth: 34,
    frameHeight: 24,
    startFrame: 0,
    endFrame: 2,
  });
  this.load.image("ground", "./Assets/ground.png");
  this.load.image("gameover", "./Assets/gameover.png");
  
  for (let i = 0; i < 10; i++) {
      this.load.image(`number${i}`, `./Assets/${i}.png`);
    } 
    this.load.audio("die", ["Assets/Audio/die.ogg"]);
    this.load.audio("hit", ["Assets/Audio/hit.ogg"]);
    this.load.audio("point", ["Assets/Audio/point.ogg"]);
    this.load.audio("wing", ["Assets/Audio/wing.ogg"]);
    this.load.audio("swoosh", ["Assets/Audio/swoosh.ogg"]);


    lastFrameFalling = Date.now();
    lastFrameShowingPipe = Date.now();
    fallingTimer = 0;
    pipeTimer = 0;
    Yoffset = 0; // random between -120 and 120
    Min_Gap_Between_Pipes = 120; //change this also
    timeCondition = 2000  ; 
    score = 0 ;
    nextPipe = null;
    speed = -100;
    number2 = null;
}

function create() {

  userInput = this.input.keyboard.createCursorKeys();
  hit =this.sound.add("hit",{loop:false});
  die =this.sound.add("die",{loop:false});
  wing =this.sound.add("wing",{loop:false});
  point =this.sound.add("point",{loop:false});
  swoosh =this.sound.add("swoosh",{loop:false});
  
  backGround = this.textures.get("backGround").getSourceImage();
  greenPipeImg = this.textures.get("greenPipe").getSourceImage();
  groundImg = this.textures.get("ground").getSourceImage();

  this.add.image(backGround.width / 2, backGround.height / 2, "backGround");
  bird = this.physics.add.sprite(
    backGround.width / 3,
    backGround.height / 2,
    "bird"
  );

  this.groundB = this.add.image(
    groundImg.width + groundImg.width / 2,
    backGround.height - groundImg.height / 3,
    "ground"
  );
  this.groundF = this.add.image(
    groundImg.width / 2,
    backGround.height - groundImg.height / 3,
    "ground"
  );

  Pipes = this.physics.add.group({
    immovable: true,
    allowGravity: false,
  });

  ScoreNumbers = this.add.group();
  ScoreNumbers.setDepth(1);

  ground = this.physics.add.staticGroup();

  ground.add(this.groundB);
  ground.add(this.groundF);
  ground.setDepth(1);

  this.physics.add.overlap(bird, ground, collisionHandler);
  this.physics.add.overlap(bird, Pipes, collisionHandler);
  this.physics.add.collider(ground, bird);
  this.physics.add.collider(Pipes, bird);

  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("bird", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: -1,
  });

  bird.setAccelerationY(50);
  bird.anims.play("idle", true);
  
}

function update() {

  this.groundF.x -= 1;
  this.groundB.x -= 1;
  if (this.groundF.x == -groundImg.width / 2)
    this.groundF.x = groundImg.width + groundImg.width / 2;
  if (this.groundB.x == -groundImg.width / 2)
    this.groundB.x = groundImg.width + groundImg.width / 2;

  fallingTimer += Date.now() - lastFrameFalling;
  lastFrameFalling = Date.now();

  if (userInput.space.isDown) {
    wing.play();
    bird.rotation = 0;
    bird.setVelocity(0, -200);
    bird.rotation = -0.5;
    fallingTimer = 0;
  } else if (fallingTimer >= 800) {
    swoosh.play()
    bird.rotation += 0.05;
    if (bird.rotation >= 1.5) {
      bird.rotation = 1.5;
    }
  }

  pipeTimer += Date.now() - lastFrameShowingPipe;
  lastFrameShowingPipe = Date.now();

  if (pipeTimer > timeCondition) {
    createPipe(this);
    pipeTimer = 0;
  }

  if (nextPipe && bird.x >= nextPipe.x) {
      updateScore(this);
      nextPipe =
      Pipes.children.entries[Pipes.children.entries.indexOf(nextPipe) + 2];
  }

  Pipes.children.entries.forEach((pipe) => {
    if (pipe.x < -pipe.width / 2) {
      pipe.destroy();
    }
  });
}

function collisionHandler() {
    hit.play();
    game.scene.pause("default");
    gameOver();
    
} 

function gameOver(){
    game.scene.scenes[0].add.image(backGround.width/2, backGround.height/2 , "gameover");
    score = 0;
    document.addEventListener("keydown",(e)=>{ 
        if(e.keyCode === 32){
            game.scene.stop("default");
            game.scene.start("default");
        }
     },{
        once: true
     }) 
} 

function createPipe(scene) {
  Yoffset = Phaser.Math.Between(-120, 120);
  Min_Gap_Between_Pipes = Phaser.Math.Between(120, 150);

  DownPipe = scene.add.image(
    backGround.width,
    backGround.height -
      greenPipeImg.height / 2 +
      Yoffset +
      Min_Gap_Between_Pipes -
      groundImg.height / 3,
    "greenPipe"
  );
  UpPipe = scene.add.image(  
    backGround.width,
    -greenPipeImg.height / 2 + Yoffset + Min_Gap_Between_Pipes,
    "greenPipe"
  );
  UpPipe.flipY = true;

  Pipes.add(DownPipe);
  Pipes.add(UpPipe);

  Pipes.setVelocityX(speed);  
  if(score% 8  === 0 && score ){
      speed -= 20;
      timeCondition-= 220

  }

  if (nextPipe === null) {
    nextPipe = Pipes.children.entries[0];
  }
}

function updateScore(scene) {

  point.play();
  console.log();
  ScoreNumbers.clear(true, true);
  score++;
  scoreText = score.toString();
  number1 = scene.add.image(
    scene.textures.get(`number${scoreText[0]}`).getSourceImage().width * 2,
    scene.textures.get("number0").getSourceImage().height,
    `number${scoreText[0]}`
  );

  if (score >= 10) {
    number2 = scene.add.image(
      scene.textures.get(`number${scoreText[1]}`).getSourceImage().width * 4,
      scene.textures.get("number0").getSourceImage().height,
      `number${scoreText[1]}`
    );
  }
  
  ScoreNumbers.add(number1);
  if (number2) ScoreNumbers.add(number2);
  ScoreNumbers.setDepth(1);
}

let game = new Phaser.Game(config);
