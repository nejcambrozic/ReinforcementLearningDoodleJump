// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

// As required by Doodle Jump
const width = 422,
    height = 552;

canvas.width = width;
canvas.height = height;

// Define global variables
var saveStore = false, // do save brain automaticly?
    baseHeight = 0,
    gameSpeed = 1, // default gamespeed
    draw_flag = true, // do draw doodle?
    currIter = 1; // Used to define current iteration for graphing library
    platforms = [], // Variables for game
    image = document.getElementById("sprite"), // background image
    player, // player
    platformCount = 10, // number of platforms on screen
    position = 0, //
    gravity = 0.2, // define gravity
    animloop = 0,
    flag = 0,
    menuloop = null,
    broken = 0,
    dir = 0,
    score = 0,
    firstRun = true,
    scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Global scores used for calculating average of last 10 runs

/**
 * Class definitions
 */
//Base class
var Base = function() {
    this.height = 5;
    this.width = width;

    //Sprite clipping
    this.cx = 0;
    this.cy = 614;
    this.cwidth = 100;
    this.cheight = 5;

    this.moved = 0;

    this.x = 0;
    this.y = height - this.height;

    this.draw = function() {
        try {
            if (draw_flag)
                ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
        } catch (e) {}
    };
};
//Player class
var Player = function() {
    this.vy = 11;
    this.vx = 0;

    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isDead = false;

    this.width = 55;
    this.height = 40;

    //Sprite clipping
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 110;
    this.cheight = 80;

    this.dir = "left";

    this.x = width / 2 - this.width / 2;
    this.y = height;

    // draw player
    this.draw = function() {
        try {
            if (this.dir == "right") this.cy = 121;
            else if (this.dir == "left") this.cy = 201;
            else if (this.dir == "right_land") this.cy = 289;
            else if (this.dir == "left_land") this.cy = 371;

            if (draw_flag){
              ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
            }
        } catch (e) {}
    };

    this.jump = function() {
        this.vy = -8;
    };

    this.jumpHigh = function() {
        this.vy = -16;
    };
};
// Platform class
function Platform() {
    this.width = 70;
    this.height = 17;

    this.x = Math.random() * (width - this.width);
    this.y = position;

    position += (height / platformCount);

    this.flag = 0;
    this.state = 0;

    //Sprite clipping
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 105;
    this.cheight = 31;

    this.reward = 0;
    this.target = 0;
    //Function to draw it
    this.draw = function() {
        try {

            if (this.type == 1) this.cy = 0;
            else if (this.type == 2) this.cy = 61;
            else if (this.type == 3 && this.flag === 0) this.cy = 31;
            else if (this.type == 3 && this.flag == 1) this.cy = 1000;
            else if (this.type == 4 && this.state === 0) this.cy = 90;
            else if (this.type == 4 && this.state == 1) this.cy = 1000;

            if (draw_flag){
                ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
                ctx.fillText(this.reward, this.x + 30, this.y + 13);

                // napiše rewarde za posamezno platformo..napiše katera je target
                if(this.target){
                    ctx.fillText(direction(platforms.indexOf(this)).toUpperCase(), this.x + 20, this.y);
                }
                // nariše črto do TARGET platforme
                //ctx.lineTo(player.x + player.width/2, player.y + player.height/2);
              }
        } catch (e) {}
    };

    //Platform types
    //1: Normal
    //2: Moving
    //3: Breakable (Go through)
    //4: Vanishable
    //Setting the probability of which type of platforms should be shown at what score
    if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 2000 && score < 5000) this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 1000 && score < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
    else if (score >= 500 && score < 1000) this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
    else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
    else this.types = [1];

    // Selet random type
    this.type = this.types[Math.floor(Math.random() * this.types.length)];

    // We can't have two breakable platforms in a row or it is impossible to go forward
    if (this.type == 3 && broken < 1) {
        broken++;
    } else if (this.type == 3 && broken >= 1) {
        this.type = Math.random()<0.5? 1 : 2;
        broken = 0;
    }

    this.moved = 0;
    this.vx = 1;
};
//Broken platform object
var Platform_broken_substitute = function() {
    this.height = 30;
    this.width = 70;

    this.x = 0;
    this.y = 0;

    //Sprite clipping
    this.cx = 0;
    this.cy = 554;
    this.cwidth = 105;
    this.cheight = 60;

    this.appearance = false;

    this.draw = function() {
        try {
            if (draw_flag)
                if (this.appearance === true) ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
                else return;
        } catch (e) {}
    };
};
// Spring Class (jumping)
var spring = function() {
    this.x = 0;
    this.y = 0;

    this.width = 26;
    this.height = 30;

    //Sprite clipping
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 45;
    this.cheight = 53;

    this.state = 0;

    this.draw = function() {
        try {
            if (this.state === 0) this.cy = 445;
            else if (this.state == 1) this.cy = 501;

            if (draw_flag)
                ctx.drawImage(image, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
        } catch (e) {}
    };
};
// ---- End Class definitions


// Crete instances; need to be global
var player = new Player();
var base = new Base();
// Create first platforms
for (var i = 0; i < platformCount; i++) {
    platforms.push(new Platform());
}
var platform_broken_substitute = new Platform_broken_substitute();
var Spring = new spring();

// Start the game
function init() {
    //Variables for the game
    var dir = "left",
        jumpCount = 0;
        firstRun = false;

    // Clear canvas in each consecutive frame
    function paintCanvas() {
        ctx.clearRect(0, 0, width, height);
    }

    decision = -39; // the point at which a prediction is made
    function playerCalc() {
        // When the player is almost at the top of the arc, decide where to go
        if (Math.round(player.vy * 5) == decision) // scale to reduce number of calls to one per jump
            decide();

        // face the direction of target platform
        if (direction(target_platform) == "left") {
            player.dir = "left";
            if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
        } else if (direction(target_platform) == "right") {
            player.dir = "right";
            if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
        }

        // move towards target platform
        if (direction(target_platform) == "left") {
            player.x += player.vx;
            player.vx -= 0.15;
        } else {
            player.x += player.vx;
            if (player.vx < 0) player.vx += 0.1;
        }
        
        if (direction(target_platform) == "right") {
            player.x += player.vx;
            player.vx += 0.15;
        } else {
            player.x += player.vx;
            if (player.vx > 0) player.vx -= 0.1;
        }

        // Accelerations produces when the user hold the keys
    
        player.x += player.vx;
        if (player.vx < 0) player.vx += 0.1;
        else if (player.vx > 0) player.vx -= 0.1;
        

        // Speed limits!
        // if (player.vx > 8)
        //     player.vx = 8;
        // else if (player.vx < -8)
        //     player.vx = -8;

        //Jump the player when it hits the base
        if ((player.y + player.height) > base.y && base.y < height)
            player.jump();

        //Gameover if it hits the bottom
        if (base.y > height && (player.y + player.height) > height && player.isDead != "inFirstTry")
            player.isDead = true;

        //Make the player move through walls
        if (player.x > width) player.x = 0 - player.width;
        else if (player.x < 0 - player.width) player.x = width;

        //Movement of player affected by gravity
        if (player.y >= (height / 2) - (player.height / 2)) {
            player.y += player.vy;
            player.vy += gravity;
        }

        //When the player reaches half height, move the platforms to create the illusion of scrolling and recreate the platforms that are out of viewport...
        else {
            platforms.forEach(function(p, i) {
              
                if (player.vy < 0) 
                    p.y -= player.vy;
                
                if (p.y > height) {
                    platforms[i] = new Platform();
                    platforms[i].y = p.y - height;
                }
            });

            base.y -= player.vy;
            player.vy += gravity;

            if (player.vy >= 0) {
                player.y += player.vy;
                player.vy += gravity;
            }

            if (base.y > baseHeight)
                score++;
            
            baseHeight = Math.max(base.y, baseHeight);
        }

        //Make the player jump when it collides with platforms
        collides();

        if (player.isDead === true) gameOver();
    }

    //Spring algorithms

    function springCalc() {
        var s = Spring;
        var p = platforms[0];

        if (p.type == 1 || p.type == 2) {
            s.x = p.x + p.width / 2 - s.width / 2;
            s.y = p.y - p.height - 10;

            if (s.y > height / 1.1)
                s.state = 0;

            s.draw();
        } else {
            s.x = 0 - s.width;
            s.y = 0 - s.height;
        }
    }

    // Platform's horizontal movement and falling algorithm
    function platformCalc() {
        var subs = platform_broken_substitute;

        platforms.forEach(function(p, i) {
            if (p.type == 2) {
                if (p.x < 0 || p.x + p.width > width)
                    p.vx *= -1;
                p.x += p.vx;
            }

            if (p.flag == 1 && subs.appearance === false && jumpCount === 0) {
                subs.x = p.x;
                subs.y = p.y;
                subs.appearance = true;
                jumpCount++;
            }

            p.draw();
        });

        if (subs.appearance === true) {
            subs.draw();
            subs.y += 8;
        }

        if (subs.y > height)
            subs.appearance = false;
    }

    function collides() {
        
        platforms.forEach(function(p, i) {
            if (player.vy > 0 && p.state === 0 && 
                (player.x + 15 < p.x + p.width) && (player.x + player.width - 15 > p.x) &&
                (player.y + player.height > p.y) && (player.y + player.height < p.y + p.height)) {

                if (p.type == 3 && p.flag === 0) {
                    previous_collision = i;
                    p.flag = 1;
                    jumpCount = 0;
                    return;
                } else if (p.type == 4 && p.state === 0) {
                    previous_collision = i;
                    player.jump();
                    p.state = 1;
                } else if (p.flag == 1){
                    previous_collision = i;
                    return;
                }
                else {
                    previous_collision = i;
                    player.jump();
                }
            }
        });

        // Springs
        var s = Spring;
        if (player.vy > 0 && (s.state === 0) &&
            (player.x + 15 < s.x + s.width) && (player.x + player.width - 15 > s.x) && 
            (player.y + player.height > s.y) && (player.y + player.height < s.y + s.height)) {
            s.state = 1;
            previous_collision = 0;
            player.jumpHigh();
        }
    }

    function updateScore() {
        if (draw_flag) {
            var scoreText = document.getElementById("score");
            scoreText.innerHTML = score;
        }
    }

    function gameOver() {
        decide();
        platforms.forEach(function(p, i) {
            p.y -= 12;
        });

        if (player.y > height / 2 && flag === 0) {
            player.y -= 8;
            player.vy = 0;
        } else if (player.y < height / 2) flag = 1;
        else if (player.y + player.height > height) {
            showGoMenu();
            hideScore();
            player.isDead = "inFirstTry";
        }
    }

    //Function to update everything
    function update() {
        paintCanvas();
        // Calculations
        platformCalc();
        springCalc();
        playerCalc();
        // Drawing
        base.draw();
        player.draw();
        
        updateScore();
    }

    menuLoop = function() {
        return;
    };
    animloop = function() {
        for (i = 0; i < gameSpeed; i++)
            update();
        requestAnimFrame(animloop);
    };

    animloop();

    hideMenu();
    if(draw_flag) showScore();
    else hideScore();
}

// Jump the player and paint new position
function playerJump() {

    player.y += player.vy;
    player.vy += gravity;

    if (dir == "left") {
        player.dir = "left";
        if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
    } else if (dir == "right") {
        player.dir = "right";
        if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
    }

    //Jump the player when it hits the base
    if ((player.y + player.height) > base.y && base.y < height) player.jump();

    //Make the player move through walls
    if (player.x > width) player.x = 0 - player.width;
    else if (player.x < 0 - player.width) player.x = width;

    player.draw();
}


// Reset game and start over
function reset() {
    // record iteration and score for graphing library
    scores[currIter % 11] = score;

    var sum = 0;
    scores.forEach(function(scr){
        sum += scr;
    });
    var avg = sum/scores.length;
    //if (currIter % 10 == 0) {
          ScorePerLifeChartDPS.push({
            x: currIter,
            y: avg
        });
        ExploredStatesDPS.push({
            x: currIter,
            y: brain.explored
        });
        renderCharts();
        if(saveStore) store.set('brain', brain);
    //}
    // Reset game variables
    player.isDead = false;
    flag = 0;
    position = 0;
    score = base_score;
    baseHeight = 0;
    currIter++;

    base = new Base();
    player = new Player();
    Spring = new spring();
    platform_broken_substitute = new Platform_broken_substitute();

    platforms = [];
    for (var i = 0; i < platformCount; i++) {
        platforms.push(new Platform());
    }
}

/**
 * Helper functions
 */

// Hides the menu
function hideMenu() {
    var menu = document.getElementById("mainMenu");
    menu.style.zIndex = -1;
}

// Shows the game over menu
function showGoMenu() {
    var menu = document.getElementById("gameOverMenu");
    menu.style.zIndex = 1;
    menu.style.visibility = "visible";

    var scoreText = document.getElementById("go_score");
    scoreText.innerHTML = "You scored " + score + " points!";
}

// Show ScoreBoard
function showScore() {
    var menu = document.getElementById("scoreBoard");
    menu.style.zIndex = 1;
}

// Hide ScoreBoard
function hideScore() {
    var menu = document.getElementById("scoreBoard");
    menu.style.zIndex = -1;
}

// Update canvas
function update() {
    ctx.clearRect(0, 0, width, height);
    playerJump();
}

menuLoop = function() {
    update();
    requestAnimFrame(menuLoop);
};

menuLoop();

window.onbeforeunload = function (event) {
    //save the master brain to localStorage before exiting
    if(saveStore) store.set('brain', brain);

    if (typeof event == 'undefined') 
      event = window.event;
    else if (event) 
      event.returnValue = "";
    return;
};

// Saves current brain
function saveBrain(){
    store.set('brain', brain);
    console.log("Brained stored with "+brain.explored+" explored states");
}

// Toogle drawing of the game
function toggleDraw(){
    draw_flag = !draw_flag;
    if(!draw_flag) hideScore();
    else showScore();
}
