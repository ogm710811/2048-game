
//**********************************************************************
// FUNCTIONS
//**********************************************************************

//**********************************************************************
// loadSounds
// preloads the snap and tap sounds. Specify the path where our sounds 
// are served as well as the volume. 
// sounds are ready to be played when desired.
//**********************************************************************

// function loadSounds () {
//   ion.sound({
//     sounds: [{name: "snap"}, {name: "tap"}],
  
//     path: "../ion.sound-3.0.7/sounds/",
//     preload: true,
//     volume: 1.0
//   });
// }

//**********************************************************************
// renderTiles
// renders the tiles to initialize a game and show the current 
// status of the board on the screen. 
//**********************************************************************

function renderTiles () {
  game.board.forEach(function(row, rowIndex){
    row.forEach(function (cell, cellIndex) {
      if (cell) {
        var tileContainer = document.getElementById("tile-container");
        var newTile       = document.createElement("div");
        // console.log(newTile);

        newTile.classList  = "tile val-" + cell;
        newTile.classList += " tile-position-" + rowIndex + "-" + cellIndex;
        newTile.innerHTML  = (cell);

        tileContainer.appendChild(newTile);
        // console.log(tileContainer);
      }
    });
  });
}

//**********************************************************************
// resetTiles
// reset the tiles
// Before we render the status of the board, we have to reset it.
//**********************************************************************

function resetTiles () {
  // This method doesn’t return an array, it returns a NodeCollection element. 
  // We use the method Array.prototype.slice.call to transform this NodeCollection
  // into an Array, so we can use the foreach method to iterate over the elements.
  var tilesContainer = document.getElementById("tile-container");
  var tiles          = tilesContainer.getElementsByClassName("tile");
  
  Array.prototype.slice.call(tiles).forEach(function (tile) {
    tilesContainer.removeChild(tile);
  });
}

//**********************************************************************
// updateScore
// update the score every time we merge two tiles.
// this function just need to update the value on the screen after each move. 
//**********************************************************************

function updateScore () {
  var score          = game.score;
  var scoreContainer = document.getElementsByClassName("js-score");

  Array.prototype.slice.call(scoreContainer).forEach(function (span) {
    span.innerHTML = score;
  });
}

//**********************************************************************
// gameStatus
// function that will be called after each movement too, 
// that will check the game status. If the game has finished 
// (with victory or defeat), we will have to show the user a message.
//**********************************************************************

function gameStatus () {
  if (game.won) {
    console.log('YOU WON!');
    document.getElementById("game-over").classList = "show-won";
    document.getElementById("game-over").innerHTML = "YOU WON";
  } else if (game.lost) {
    console.log('YOU LOST, WOMP');
    document.getElementById("game-over").classList = "show-lost";
    document.getElementById("game-over").innerHTML = "YOU LOST";
  }
}

//**********************************************************************
// moveListeners
// create an event listener that will be waiting a keydown event, 
// and depending on the pressed key, it will generate one move or another
//**********************************************************************

function moveListeners (event) {
  var keys = [37, 38, 39, 40];

  if (keys.indexOf(event.keyCode) < 0)
    return;
  // event.keyCode returns us the ASCII code of the pressed key
  switch (event.keyCode) {
    case 37: game._move("left");  break;
    case 38: game._move("up");    break;
    case 39: game._move("right"); break;
    case 40: game._move("down");  break;
  }
  // Reset the Tiles
  resetTiles();
  // Render Tiles with the update
  renderTiles();
  // Update the score on every valid keyboard event.
  updateScore();
  // Update the game status on every keyboard event.
  gameStatus();
}

document.addEventListener("keydown", moveListeners);


// create a new game when the page loads.
// use the window.onload event to generate the new game. 
// the game will be defined as a global variable, so that we 
// can access it from everywhere in the application file:

var game;

// Interaction Logic
$(document).ready(function(){
  game = new Game2048();
  //loadSounds();
  // render the tiles to the DOM
  renderTiles();
});