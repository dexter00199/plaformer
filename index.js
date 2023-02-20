var config = {
    type: Phaser.AUTO,
    width: '1000',
    height: '600',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 35 });
}

function create ()
{
    // фон для нашей игры
    this.add.image(400, 300, 'sky');

    //  Группа платформ , на которые мы можем запрыгнуть.
    platforms = this.physics.add.staticGroup();

    //  Здесь мы создаем землю.
    platforms.create(240, 560, 'ground').setScale(1.2).refreshBody();
    platforms.create(720, 560, 'ground').setScale(1.2).refreshBody();
    platforms.create(500, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(700, 220, 'ground');

    // игрок
    player = this.physics.add.sprite(100, 450, 'dude');

    // Физические свойства игрока. легкий отскок.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Анимации нашего игрока, повороты, ходьба влево и вправо.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Входные события
    cursors = this.input.keyboard.createCursorKeys();

    // Несколько звезд для сбора, всего 12, равномерно расположенных на расстоянии 70 пикселей друг от друга по оси x
    stars = this.physics.add.group({
        key: 'star',
        repeat: 10,
        setXY: { x: 50, y: 50, stepX: 70 }
    });
    
    stars.children.iterate(function (child) {

        // Придать каждой звезде отскок
        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.8));

    });

    bombs = this.physics.add.group();

    //  Очки
    scoreText = this.add.text(16, 16, 'Очки: 0', { fontSize: '32px', fill: '#fff', });

    // Сталкиваем игрока и звезды с платформами
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    // Проверяет, не пересекается ли игрок с какой-либо из звезд, вызывает ли он функцию collectStar
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-520);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(520);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-520);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    // Добавить и обновить счет
    score += 10;
    scoreText.setText('Очки: ' + score);

    if (stars.countActive(true) === 0)
    {
        // Новая партия звезд для сбора
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 46, 'bomb');
        bomb.setBounce(167);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
