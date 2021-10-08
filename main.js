/*
TODO Make stars bigger with overlayed rainbow colors
TODO Make a deck with exercises like 12 - 4 = 8 -> Gegenaufgabe 8 + 4 = 12 or maybe 12 - 4 and then 4 + ? = 10 something to improve this ability in matilda
*/
// get canvas-object as canvas and canvas-context-object as ctx
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// sets the loop to run inside gameloop. Options are "testing", "playing", "finished" and "menu" so far
// gamestate can be set in game with t, p, f and m
var gamestate = "menu";

// adds the sprite for the "finished"-screen and adds eventlistener for when the sprite is loaded
var myImage = new Image();
myImage.src = "./goku-clapping-sprite.png";
myImage.addEventListener("load", imageLoaded, false);

var yellowStar = new Image();
yellowStar.src = "./stars/yellow-star.png";

var playButtonImg = new Image();
playButtonImg.src = "./assets/play-button.png";
var libraryButtonImg = new Image();
libraryButtonImg.src = "./assets/library-button.png";
var titleImg = new Image();
titleImg.src = "./assets/menu-title.png";

// variables for the sprite animation function

//bulmas values
// var shift = 0;
// var frameWidth = 211;
// var frameHeight = 310;
// var totalFrames = 104;
// var currentFrame = 0;
// let fps = 36;

//gokus values
var shift = 0;
var frameWidth = 498;
var frameHeight = 373;
var totalFrames = 4;
var currentFrame = 0;
let fps = 12;
let scaleFactor = 0.8;

// sets whether stars should be shown or not
var setStars = true;

// not used at this point
var operatorList = ["+", "-", "*", "/"];

// make a deck for addition from 11 to 20
var matildasAdditionUnder20 = new Deck("+", 20, 20);
matildasAdditionUnder20.make();
matildasAdditionUnder20.upperLimit = 20;
matildasAdditionUnder20.lowerLimit = 11;
matildasAdditionUnder20.kickByLimit();
matildasAdditionUnder20.kickNum(1);
matildasAdditionUnder20.kickNum(10);
matildasAdditionUnder20.shuffle()

// make a deck for subtraction under 20
var matildasSubtractionUnder20 = new Deck("-", 20, 10);
matildasSubtractionUnder20.make();
matildasSubtractionUnder20.blacklist = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
matildasSubtractionUnder20.applyBlacklist("left");
matildasSubtractionUnder20.blacklist = [1, 10];
matildasSubtractionUnder20.applyBlacklist("right")
matildasSubtractionUnder20.kickSolution(10);
matildasSubtractionUnder20.shuffle();

// deck for training subtraction with only 8 and 9 as numbers close to 10
var minusSpezial_8_9 = new Deck("-", 20, 10);
minusSpezial_8_9.make();
minusSpezial_8_9.blacklist = [1, 2, 3, 4, 5, 6, 7, 8, 9];
minusSpezial_8_9.applyBlacklist("left");
minusSpezial_8_9.blacklist = [1, 2, 3, 4, 5, 6, 7, 10];
minusSpezial_8_9.applyBlacklist("right");
minusSpezial_8_9.shuffle();

var minusSpezial_6_7 = new Deck("-", 20, 10);
minusSpezial_6_7.make();
minusSpezial_6_7.blacklist = [1, 2, 3, 4, 5, 6, 7, 10];
minusSpezial_6_7.applyBlacklist("left");
minusSpezial_6_7.blacklist = [1, 2, 3, 4, 5, 8, 9, 10];
minusSpezial_6_7.applyBlacklist("right");
minusSpezial_6_7.shuffle();



// deck for testing
var testDeck = new Deck("+", 4, 1);
testDeck.make();

// set the deck to use in "playing"-loop
var current = matildasSubtractionUnder20;


// sets the background color
function drawBackground() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFBB";
    ctx.fill();
    ctx.closePath();
}

// starts the gameLoop when the image data has been loaded
function imageLoaded(e) {
    gameLoop();
}

// exercise card generator function takes an operator, and two numbers to make an exercise
// provides the methods:
// .draw() = draws the exercise to the canvas
// .solution() = returns the solution to the exercise as num
// .checkAnswer() = takes a num and compares it to the solution of the exercise and returns bool accordingly.
function Exercise(operator, firstNum, secondNum) {

    this.fstNum = firstNum;
    this.operator = operator;
    this.sndNum = secondNum;
    this.graveyard = false;
    this.rating = 0;
    this.draw = function () {
        ctx.fillStyle = "#000000";
        ctx.font = "40px Ubuntu";
        ctx.fillText(this.fstNum + " " + this.operator + " " + this.sndNum + " =", canvas.width / 4 - 60, canvas.height / 2);
    }
    this.solution = function () {// does not need to be a function could be a variable or an object with a check answer method
        return eval(this.fstNum.toString() + this.operator + this.sndNum.toString());
    };
    this.checkAnswer = function (answer) {
        if (this.solution() == answer) {
            return true;
        } else {
            return false;
        }
    };
}

// training deck generator function --- takes an operator and two nums.
// Is used to generate training decks with those inputs and its various methods.
// basic use of function is give it the operator you want training exercises with and
// the upper limit of what number you want to use for the exercises as left
// operand and as right operand. You can also set lower limit with .fstMin and .sndMin variables.
// Then use .make() to create a deck with all possible exercise combinations and kick not wanted
// exercises from the deck with one of the Deck's methods:
// .kickNum(num) kicks all exercises with a certain num . To kick only left operand set
// .kickNum(num, "left") and to kick right .kickNum(num, "right")
// .applyBlacklist() makes use of kickNum on all nums on list in .blacklist variable --
// "left" and "right" can be specified as input otherwise function will kick for both operands
// .kickByLimit() kicks all exercises which solution exceeds the limits given by .upperLimit and
// .lowerLimit variables
// .kickSolution(num) kicks only thos exercises which have num as solution
// finally the deck needs to be shuffled with .shuffle() method
// be aware that the deck is not deckname, but deckname.deck as deckname is actually the object
// used to create and manipulate the deck
//-----------------
//TODO use kickSolution in kickByLimit as this would save alot of code
//TODO organize the star counting stuff away from this function as it has nothing to do with deck building
// maybe make an object called HUD and put it there
function Deck(operator = "+", fstMax = 1, sndMax = 1) {
    this.deck = [];
    this.index = 0;
    this.operator = operator;
    this.fstMax = fstMax;
    this.sndMax = sndMax;
    this.fstMin = 1;
    this.sndMin = 1;
    this.numWhitelist = [];
    this.numBlacklist = [];
    this.sumBlacklist = [];
    this.upperLimit = NaN;
    this.lowerLimit = NaN;
    // TODO put stars into HUD object
    this.stars = 0;
    this.fromDecks = function (deck1, deck2) {
        this.deck = deck1.deck.concat(deck2.deck);
    }
    this.setStars = function () {
        setStars = !setStars;
    }
    this.drawStars = function () {
        if (setStars == true) {
            ctx.fillStyle = "#000000";
            ctx.font = "25px Ubuntu";
            ctx.fillText("⭐ x " + this.stars, 8, 25);
            ctx.font = "27px Ubuntu";
        }
    }
    // shuffle shuffles the deck into a pseudo random order with the fisher-yates algorythm
    this.shuffle = function () {
        var m = this.deck.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = this.deck[m];
            this.deck[m] = this.deck[i];
            this.deck[i] = t;
        }

        return this.deck;
    };
    // kickNum kicks exercise cards from deck. By default [num] makes kickNum kick all exercise cards which
    // have [num] either as the left operand or the right operand. If you only want to kick exercises that
    // have either [num] as the left operand or the right operand then specify kickOnly = "left" or respectively
    // kickOnly = "right"
    this.kickNum = function (num, kickOnly = "") {
        if (kickOnly == "left") {
            for (i = 0; i < this.deck.length; i++) {
                if (this.deck[i].fstNum == num) {
                    if (i == 0) {
                        this.deck.shift(1)
                        i = -1;
                        continue; this
                    } else {
                        this.deck.splice(i, 1);
                        i -= 1;
                        continue;
                    };
                };
            };
        } else if (kickOnly == "right") {
            for (i = 0; i < this.deck.length; i++) {
                if (this.deck[i].sndNum == num) {
                    if (i == 0) {
                        this.deck.shift(1)
                        i = -1;
                        continue; this
                    } else {
                        this.deck.splice(i, 1);
                        i -= 1;
                        continue;
                    };
                };
            };
        } else if (kickOnly == "") {
            for (i = 0; i < this.deck.length; i++) {
                if (this.deck[i].fstNum == num || this.deck[i].sndNum == num) {
                    if (i == 0) {
                        this.deck.shift(1)
                        i = -1;
                        continue; this
                    } else {
                        this.deck.splice(i, 1);
                        i -= 1;
                        continue;
                    };
                };
            };
        };
    };
    this.kickByLimit = function () {
        if (this.upperLimit != NaN) {
            for (i = 0; i < this.deck.length; i++) {
                if (this.deck[i].solution() >= this.upperLimit) {
                    if (i == 0) {
                        this.deck.shift(1)
                        i = -1;
                        continue; this
                    } else {
                        this.deck.splice(i, 1);
                        i -= 1;
                        continue;
                    };
                }
            }
        }
        if (this.lowerLimit != NaN) {
            for (i = 0; i < this.deck.length; i++) {
                if (this.deck[i].solution() <= this.lowerLimit) {
                    if (i == 0) {
                        this.deck.shift(1)
                        i = -1;
                        continue; this
                    } else {
                        this.deck.splice(i, 1);
                        i -= 1;
                        continue;
                    };
                }
            }
        };
    };
    // applyBlacklist uses kickNum for every entry in blacklist. Set kickOnly accordingly
    // to make applyBlacklist kick only exercise cards wich have the numbers in the left
    // operand or right operand. See kickNum for more details.
    this.applyBlacklist = function (kickOnly = "") {
        for (k = 0; k < this.blacklist.length; k++) {
            this.kickNum(this.blacklist[k], kickOnly);
        }
    };
    this.kickSolution = function (num) {
        for (i = 0; i < this.deck.length; i++) {
            if (this.deck[i].solution() == num) {
                if (i == 0) {
                    this.deck.shift(1)
                    i = -1;
                    continue;
                } else {
                    this.deck.splice(i, 1);
                    i -= 1;
                    continue;
                };
            }
        }
    };
    this.make = function () {
        this.deck = [];
        var index = 0;
        for (i = this.sndMin; i <= this.fstMax; i++) {
            for (j = this.sndMin; j <= this.sndMax; j++) {
                this.deck[index] = new Exercise(this.operator, i, j);
                index += 1;
            }
        }
    };
};


//input and output

var io = {
    usrInput: [],

    init: function () {
        document.addEventListener("keyup", this.keyUpInput);
    },
    add2usrInput: function (key) {
        if (this.usrInput.length == 0) {
            this.usrInput[0] = key;
        }
        else if (this.usrInput.length > 0) {
            this.usrInput[this.usrInput.length] = key;
        }
    },

    generateUsrOutput: function (arrayOfStrings) {
        return arrayOfStrings.join("");
    },

    clearInput: function () {
        //feedbackLight = 0;
        io.usrInput = [];
    },

    drawAnswer: function () {
        ctx.fillStyle = "#000000";
        ctx.font = "40px Ubuntu";
        ctx.fillText(io.generateUsrOutput(io.usrInput), canvas.width / 4 + 94, canvas.height / 2);
    },

    keyUpInput: function (keyEvent) {
        if (keyEvent.key >= '0' && keyEvent.key <= '9' && io.usrInput.length < 2) {
            io.add2usrInput(keyEvent.key);
        } else if (keyEvent.code == "Backspace") {
            io.usrInput.pop();
        } else if (keyEvent.key == "Enter") {
            if (io.generateUsrOutput(io.usrInput) == current.deck[current.index].solution()) {
                current.index += 1;
                current.stars += 1;
                console.log("Position in stack is at ", current.index, " of ", current.deck.length);
                io.clearInput();
                if (current.stars == current.deck.length) {
                    gamestate = "finished";
                }
            } else if (io.usrInput != current.deck[current.index].solution()) {
                io.clearInput();
                console.log("wrong turn!")
            }
        } else if (keyEvent.key == "m") {
            gamestate = "menu";
        } else if (keyEvent.key == "l") {
            gamestate = "library";
        } else if (keyEvent.key == "t") {
            gamestate = "testing";
        } else if (keyEvent.key == "p") {
            gamestate = "playing";
        } else if (keyEvent.key == "f") {
            gamestate = "finished";
        }
    }
}

function showVictoryScreen() {
    setTimeout(function () {
        requestAnimationFrame(gameLoop);

        // animating/drawing code goes here
        ctx.clearRect(120, 25, 300, 300);
        drawBackground();
        current.drawStars();

        //draw each frame + place them in the middle
        ctx.drawImage(myImage, shift, 0, frameWidth, frameHeight,
            canvas.width - frameWidth * scaleFactor - (canvas.height - frameHeight * scaleFactor) / 2, (canvas.height - frameHeight * scaleFactor) / 2, frameWidth * scaleFactor, frameHeight * scaleFactor);

        shift += frameWidth;

        /*
          Start at the beginning once you've reached the
          end of your sprite!
        */
        if (currentFrame == totalFrames) {
            shift = 0;
            currentFrame = 0;
        }

        currentFrame++;

    }, 1000 / fps);
}

function updateGameScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    current.drawStars();
    current.deck[current.index].draw();
    io.drawAnswer();
    requestAnimationFrame(gameLoop);
}

// var menu = {
//     pickDeckButton: function() {

//     }
//     playButton
//     deckEditorButton
//     optionsButton
//     creditsButton
// }

function drawButton(string) {
    ctx.beginPath();
    ctx.strokeRect(canvas.width / 2 - 60, canvas.height / 2 - 40, 100, 50);
    ctx.rect(canvas.width / 2 - 60, canvas.height / 2 - 40, 100, 50);
    ctx.fillStyle = "#FFAAAA";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "#000000";
    ctx.font = "25px Ubuntu";
    ctx.fillText(string, canvas.width / 2 - 45, canvas.height / 2 - 8);
}

function Button(x, y, onClickState, width , height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.onClickState = onClickState;
    //this.strokeColor = color;
    this.draw = NaN;
    this.registerButtonHandler = function () {
        canvas.addEventListener('click', this.handler);
    };
    this.handler = function (mouseEvent) {
        if (gamestate == "menu") {
            var mousePos = getMousePos(canvas, mouseEvent);
            var rect = {
                x: x,
                y: y,
                width: width,
                height: height
            };
            if (isInside(mousePos, rect)) {
                gamestate = onClickState;
                gameLoop();
            };
        };
    };
}
//-------------------------------------------------------------------------------------------------
var menuButtonScaling = 0.7;

var playButtonVals = {
    x: canvas.width / 2 - playButtonImg.width * 0.7 / 2,
    y: canvas.height / 3
}

var playButton = new Button(playButtonVals.x, playButtonVals.y, "playing", playButtonImg.width * menuButtonScaling, playButtonImg.height * menuButtonScaling);
playButton.registerButtonHandler();
playButton.draw = function() {
    ctx.drawImage(playButtonImg, playButtonVals.x, playButtonVals.y, playButtonImg.width * menuButtonScaling, playButtonImg.height * menuButtonScaling);
}


var libraryButtonVals = {
    x: playButtonVals.x,
    y: canvas.height / 3 + libraryButtonImg.height
}

var libraryButton = new Button(libraryButtonVals.x, libraryButtonVals.y,"library", libraryButtonImg.width * menuButtonScaling, libraryButtonImg.height * menuButtonScaling);
libraryButton.registerButtonHandler();
libraryButton.draw = function() {
    ctx.drawImage(libraryButtonImg, libraryButtonVals.x, libraryButtonVals.y, libraryButtonImg.width * menuButtonScaling, libraryButtonImg.height * menuButtonScaling);
}

function drawTitle() {
    ctx.drawImage(titleImg, 0, 20, titleImg.width * 0.6, titleImg.height * 0.6);
}



function menumode() {
    ctx.clearRect(0, 0, canvas.width, canvas.height, 15, 15);
    drawBackground();
    playButton.draw();
    libraryButton.draw();
    drawTitle();
    requestAnimationFrame(gameLoop);
}


var yellowStar = new Image();
yellowStar.src = "./stars/yellow-star.png";
var orangeStar = new Image();
orangeStar.src = "./stars/orange-star.png";
var redStar = new Image();
redStar.src = "./stars/red-star.png";
var pinkStar = new Image();
pinkStar.src = "./stars/pink-star.png";
var skyblueStar = new Image();
skyblueStar.src = "./stars/skyblue-star.png"
var marineblueStar = new Image();
marineblueStar.src = "./stars/marineblue-star.png"
var greenStar = new Image();
greenStar.src = "./stars/green-star.png"


var horOffset = (orangeStar.width * 0.12 - yellowStar.width * 0.09) / 2;
var verOffset = (orangeStar.height * 0.12 - yellowStar.height * 0.09) / 2;
var dist = 25;

function findDrawPos (width, height, x, y) {
    var drawPos = {
                    x: x - width / 2,
                    y: y - height / 2
                };
    return drawPos;
}

var drawStarPos = {
    x: 40,
    y: 40
}

var delayInMilliseconds = 1000; //1 second

setTimeout(function() {
  //your code to be executed after 1 second
}, delayInMilliseconds);

function drawDeckInLibrary() {
    ctx.beginPath();
    ctx.rect(50, 90, 100, 162);
    ctx.fillStyle = "#FFAAAA";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.rect(230, 90, 100, 162);
    ctx.fillStyle = "#FFAAAA";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.rect(410, 90, 100, 162);
    ctx.fillStyle = "#FFAAAA";
    ctx.fill();
    ctx.closePath();
}
function drawDeckDescription() {
    ctx.font = "14px Fira Code";
    ctx.fillStyle = "#000000";
    ctx.fillText("Deck: Testdeck \n operator: +", 20, 300);
}

function showLibrary() {
    ctx.clearRect(0, 0, canvas.width, canvas.height, 15, 15);
    drawBackground();
    drawDeckInLibrary();
    drawDeckDescription();
    requestAnimationFrame(gameLoop);
}

function testScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height, 15, 15);
    drawBackground();
    ctx.drawImage(playButtonImg, canvas.width / 2 - playButtonImg.width * 0.7 / 2, canvas.height / 3 - playButtonImg.height * 0.7 / 2, playButtonImg.width * 0.7, playButtonImg.height * 0.7);
    requestAnimationFrame(gameLoop);
}
    // if(current.stars < 10) {
    //     var yellowstarPos = findDrawPos(yellowStar.width * baseSize, yellowStar.height * baseSize, drawStarPos.x, drawStarPos.y);
    //     ctx.drawImage(yellowStar, yellowstarPos.x, yellowstarPos.y, yellowStar.width * baseSize, yellowStar.height * baseSize);
    // } else if(current.stars >= 10 && current.stars < 20) {

    //}
    var redstarPos = findDrawPos(redStar.width * 0.21, redStar.height * 0.21, drawStarPos.x, drawStarPos.y);
    var orangestarPos = findDrawPos(orangeStar.width * 0.18, orangeStar.height * 0.18, drawStarPos.x, drawStarPos.y);
    var yellowstarPos = findDrawPos(yellowStar.width * 0.15, yellowStar.height * 0.15, drawStarPos.x, drawStarPos.y);
    var greenstarPos = findDrawPos(greenStar.width * 0.12, greenStar.height * 0.12, drawStarPos.x, drawStarPos.y);
    var skybluestarPos = findDrawPos(skyblueStar.width * 0.09, skyblueStar.height * 0.09, drawStarPos.x, drawStarPos.y);
    var marinestarPos = findDrawPos(marineblueStar.width * 0.06, marineblueStar.height * 0.06, drawStarPos.x, drawStarPos.y);
    var pinkstarPos = findDrawPos(pinkStar.width * 0.03, pinkStar.height * 0.03, drawStarPos.x, drawStarPos.y);


//     ctx.drawImage(pinkStar, pinkstarPos.x, pinkstarPos.y, pinkStar.width * 0.03, pinkStar.height * 0.03);
//     setTimeout(function() {
//         ctx.drawImage(marineblueStar, marinestarPos.x, marinestarPos.y, marineblueStar.width * 0.06, marineblueStar.height * 0.06);
//     }, delayInMilliseconds);
//     setTimeout(function() {
//         ctx.drawImage(skyblueStar, skybluestarPos.x, skybluestarPos.y, skyblueStar.width * 0.09, skyblueStar.height * 0.09);
//     }, delayInMilliseconds);
//     setTimeout(function() {
//     ctx.drawImage(greenStar, greenstarPos.x, greenstarPos.y, greenStar.width * 0.12, greenStar.height * 0.12);
// }, delayInMilliseconds);
// setTimeout(function() {
//     ctx.drawImage(yellowStar, yellowstarPos.x, yellowstarPos.y, yellowStar.width * 0.15, yellowStar.height * 0.15);
// }, delayInMilliseconds);
// setTimeout(function() {
//     ctx.drawImage(orangeStar, orangestarPos.x, orangestarPos.y, orangeStar.width * 0.18, orangeStar.height * 0.18);
// }, delayInMilliseconds);
// setTimeout(function() {
//     ctx.drawImage(redStar, redstarPos.x, redstarPos.y, redStar.width * 0.21, redStar.height * 0.21);
// }, delayInMilliseconds);
// requestAnimationFrame(gameLoop);
// }

// mouse handling
//Function to get the mouse position
function getMousePos(canvas, mouseEvent) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}
//Function to check whether a point is inside a rectangle
function isInside(pos, rect) {
    return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}

// var canvas = document.getElementById('myCanvas');
// var context = canvas.getContext('2d');
// //The rectangle should have x,y,width,height properties
// var rect = {
//     x:canvas.width/2 - 60,
//     y:canvas.height/2 -40,
//     width:100,
//     height:50
// };
// //Binding the click event on the canvas
// canvas.addEventListener('click', function(evt) {
//     var mousePos = getMousePos(canvas, evt);

//     if (isInside(mousePos,rect)) {
//         alert('clicked inside rect');
//     }else{
//         alert('clicked outside rect');
//     }   
// }, false);

// initialize keyboard event handlers
io.init();
//Main Loop
function gameLoop() {
    if (gamestate == "testing") {
        testScreen();
    }
    if (gamestate == "menu") {
        menumode();
    }
    if (gamestate == "library") {
        showLibrary();
    }
    if (gamestate == "finished") {
        showVictoryScreen();
    }
    if (gamestate == "playing") {
        updateGameScreen();
    }
}

//gameLoop();