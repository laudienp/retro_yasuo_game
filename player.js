var player;
var playerSprite;
var shieldSprite;
var jumpSound;
var jumpSound2;
var jumpSound3;
var jumpSound4;
var deathSound;
var hitSound;
var attackSound;
var attackSound2;
var attackSound3;
var lameSound;
var regenShieldSound;

var grounded = false;
var jump = false;
var extendJumpTimer = 0;
var extendJumpTime = 100;
var vy = 0;
var xdep;
var moving = false;
var playerHealth;
var playerHealthMax = 2;
var immortalDelay = 1000;
var immortalTimer = 0;

var attackDelay = 1000;
var attackTimer = 0;
var isAttacking = false;

var moveDstCount = 0;
var regenShieldDst = 35;

var lastposx = 0;
var trueXDeplacement = 0;


function createPlayer(scene)
{
    //player entity
    player = BABYLON.MeshBuilder.CreatePlane("player", {width: 1, height: 1}, scene);
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.20, 0.5, 0.5); // collision "box"
    player.isVisible = false;

    //player sprite
    var spriteManagerPlayer = new BABYLON.SpriteManager("playerManager", "resources/yasuo_animation.png", 2, 64, scene, 0.01, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    playerSprite = new BABYLON.Sprite("pp", spriteManagerPlayer);
    playerSprite.playAnimation(1, 5, true, 100);

    var spriteManagerShield = new BABYLON.SpriteManager("shieldManager", "resources/wind_shield.png", 2, 64, scene, 0.01, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    shieldSprite = new BABYLON.Sprite("sh", spriteManagerShield);
    shieldSprite.playAnimation(0, 5, true, 100);

    jumpSound = new BABYLON.Sound("jump", "resources/soundEffects/yasuo_jump.mp3", scene);
    jumpSound2 = new BABYLON.Sound("jump", "resources/soundEffects/yasuo_jump2.mp3", scene);
    jumpSound3 = new BABYLON.Sound("jump", "resources/soundEffects/yasuo_jump3.mp3", scene);
    jumpSound4 = new BABYLON.Sound("jump", "resources/soundEffects/yasuo_jump4.mp3", scene);
    deathSound = new BABYLON.Sound("death1", "resources/soundEffects/yasuo_death1.mp3", scene);
    hitSound = new BABYLON.Sound("hit1", "resources/soundEffects/shield_break.mp3", scene);
    attackSound = new BABYLON.Sound("attack", "resources/soundEffects/yasuo_q.mp3", scene);
    attackSound2 = new BABYLON.Sound("attack", "resources/soundEffects/yasuo_q2.mp3", scene);
    attackSound3 = new BABYLON.Sound("attack", "resources/soundEffects/yasuo_q3.mp3", scene);
    lameSound = new BABYLON.Sound("attacklame", "resources/soundEffects/swing_lame1.mp3", scene);
    regenShieldSound = new BABYLON.Sound("regenShieldSound", "resources/soundEffects/regen_shield.mp3", scene);

    playerHealth = playerHealthMax;
    playerSetPosition(new BABYLON.Vector3(0, 4, 0));
}

function updatePlayer(map, scene, spawnPosition, poros, altBehaviour = false, force = -0.0025)
{
    //x deplacement
    xdep = 0;
    var speed = 0.004;
    var gravity = -0.00002;
    var jumpHeight = 2;

    lastposx = player.position.x;

    if((map["q"] || map["Q"] || map["ArrowLeft"]))
    {
        xdep = -speed;
        playerSprite.invertU = true;
        shieldSprite.invertU = true;
    };
    if((map["d"] || map["D"] || map["ArrowRight"]))
    {
        xdep = speed;
        playerSprite.invertU = false;
        shieldSprite.invertU = false;
    };

    //jump
    if((map["Z"] || map["z"] || map["ArrowUp"]) && (grounded || (extendJumpTimer + extendJumpTime > Date.now() )) && !jump)
    {
        vy = Math.sqrt(0 - 2*gravity*jumpHeight);
        playRandomJumpSound();
        jump = true;
    };

    //attack
    if((map[" "] || map[" "]) && grounded && Date.now()>attackTimer)
    {
        attack(scene, poros);
        attackTimer = Date.now() + attackDelay;
    }

    //collision on x axis
    grounded = false;

    //update player position
    var deltatime = engine.getDeltaTime();

    var finalDstX = xdep*deltatime;

    if(altBehaviour == true)
    {
        finalDstX = (xdep*2 + force)*deltatime;

        var rayPosRight = new BABYLON.Vector3(player.position.x, player.position.y-0.10, player.position.z);
        var rayRight = new BABYLON.Ray(rayPosRight, new BABYLON.Vector3(1,0,0),0.5);
        var hitRight = scene.pickWithRay(rayRight);

        var rayPosRight2 = new BABYLON.Vector3(player.position.x, player.position.y-0.40, player.position.z);
        var rayRight2 = new BABYLON.Ray(rayPosRight2, new BABYLON.Vector3(1,0,0), 0.5);
        var hitRight2 = scene.pickWithRay(rayRight2);
        
        var rayPosRight3 = new BABYLON.Vector3(player.position.x, player.position.y+0.30, player.position.z);
        var rayRight3 = new BABYLON.Ray(rayPosRight3, new BABYLON.Vector3(1,0,0), 0.5);
        var hitRight3 = scene.pickWithRay(rayRight3);

        if((hitRight.pickedMesh!=null && xdep>0) || (hitRight2.pickedMesh!=null && xdep>0) || (hitRight3.pickedMesh!=null && xdep>0))
            finalDstX = force*deltatime;
    }
    
    player.moveWithCollisions(new BABYLON.Vector3(finalDstX,vy*deltatime,0));

    trueXDeplacement = player.position.x - lastposx;

    moveDstCount += Math.abs(finalDstX);
    if(moveDstCount > regenShieldDst)
    {
        moveDstCount = 0;
        regenShield();
    }
    //sprite follow player
    playerSprite.position = player.position;
    shieldSprite.position = player.position;

    //2 ray for more accuracy in the detection of the ground
    var raypos1 = new BABYLON.Vector3(player.position.x+0.1, player.position.y-0.5, player.position.z);
    var ray1 = new BABYLON.Ray(raypos1, new BABYLON.Vector3(0, -1, 0), 0.01);
    var hit1 = scene.pickWithRay(ray1);

    var raypos2 = new BABYLON.Vector3(player.position.x-0.1, player.position.y-0.5, player.position.z);
    var ray2 = new BABYLON.Ray(raypos2, new BABYLON.Vector3(0, -1, 0), 0.01);
    var hit2 = scene.pickWithRay(ray2);

    if(hit1.pickedMesh!=null || hit2.pickedMesh!=null)
    {
        vy = 0;
        grounded = true;
        extendJumpTimer = Date.now();
        jump = false;
    }
    else
    {
        vy += gravity*deltatime;
    }

    //animation update
    if(xdep !=0 && !moving && !isAttacking)
    {
        playerSprite.playAnimation(16, 23, true, 100);
        moving = true;
    }
    else if(xdep == 0 && moving && !isAttacking)
    {
        playerSprite.playAnimation(1, 5, true, 100);
        moving = false;
    }
        

    //death check (if player fall out of the map)
    if(player.position.y < -10)
    {
        respawn(spawnPosition);
    }

    //if not imortal anymore reset the good color
    if(playerSprite.color.a != 1 && immortalTimer<Date.now())
    {
        playerSprite.color = new BABYLON.Color4(1,1,1,1);
    }
}

function hitPlayer(spawnPosition)
{
    if(immortalTimer<Date.now())
    {
        playerHealth--;
        shieldSprite.isVisible = false;
        playerSprite.color = new BABYLON.Color4(1,1,1,0.5);
        if(playerHealth<=0)
        {
            respawn(spawnPosition)
        }
        else
        {
            hitSound.play();
            console.log("hit!");
        }
        immortalTimer = Date.now() + immortalDelay;
    }
    
}

function respawn(spawnPosition)
{
    playerSetPosition(spawnPosition);
    console.log("dead!");
    console.log(spawnPosition);
    console.log(player.position);
    deathSound.play();
    regenShield();
    moveDstCount = 0;
    isAttacking = false;
    playerSprite.color = new BABYLON.Color4(1,1,1,1);
}

function regenShield()
{
    playerHealth = 2;
    shieldSprite.isVisible = true;
    regenShieldSound.play();
}

function attack(scene, poros)
{
    var raypos1 = new BABYLON.Vector3(player.position.x, player.position.y, player.position.z);
    var rayDir = new BABYLON.Vector3(1, 0, 0);

    isAttacking = true;
    playerSprite.playAnimation(8, 14, false, 30, 
        function(){
            //animation update
            playerSprite.playAnimation(1, 5, true, 100);
            moving = false;
            isAttacking = false;
        });

    if(playerSprite.invertU)
        rayDir = new BABYLON.Vector3(-1, 0, 0);

    
    var ray1 = new BABYLON.Ray(raypos1, rayDir, 0.75);

    console.log("attack");
    playRandomQSound();
    lameSound.play();

    for(let i=0;i<poros.length;i++)
    {
        if(ray1.intersectsMesh(poros[i].poroHitbox).hit)
        {
            poros[i].kill();
        }
    }
}

function playRandomJumpSound()
{
    let value = getRandomInt(4);
    switch(value)
    {
        case 0:
            jumpSound.play();
            break;
        case 1:
            jumpSound2.play();
            break;
        case 2:
            jumpSound3.play();
            break;
        default:
            jumpSound4.play();
    }
}

function playRandomQSound()
{
    let value = getRandomInt(4);
    switch(value)
    {
        case 0:
            attackSound.play();
            break;
        case 1:
            attackSound2.play();
            break;
        default:
            attackSound3.play();
    }
}

function getRandomInt(max)
{
    return Math.floor(Math.random() * Math.floor(max));
}

function playerSetPosition(pos)
{
    player.position.x = pos.x;
    player.position.y = pos.y;
    player.position.z = pos.z;

    playerSprite.position.x = pos.x;
    playerSprite.position.y = pos.y;
    playerSprite.position.z = pos.z;

    shieldSprite.position.x = pos.x;
    shieldSprite.position.y = pos.y;
    shieldSprite.position.z = pos.z;
}