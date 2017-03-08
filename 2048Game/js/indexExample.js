// Load sounds from ion.sound.min.js
function loadSounds () {
  ion.sound({
    // Installing snap, and tap
    sounds: [{name: "snap"}, {name: "tap"}],

    path: "../ion.sound-3.0.7/sounds/",
    // path: "lib/sounds/",
    preload: true,
    volume: 1.0
  });
}

// 2048 Game Model Logic
function Game2048() {
  this.board = [
    [null,null,null,null],
    [null,null,null,null],
    [null,null,null,null],
    [null,null,null,null]
  ];

  this.score = 0;
  this.won   = false;
  this.lost  = false;
  // Place the first tile with a random 2 or 4
  this._generateTile();
  // Place the second tile with a random 2 or 4
  this._generateTile();
}

// Private Method to generate a tile
Game2048.prototype._generateTile = function () {
  // intitial Value is equal to Random Number < .8
  var initialValue = (Math.random() < 0.8) ? 2 : 4;

  // Call private method _getAvailablePosition()
  var emptyTile = this._getAvailablePosition();

  // If we have a emptyTile
  if (emptyTile) {
    // Update the board with the found position
    this.board[emptyTile.x][emptyTile.y] = initialValue;
  }
};

Game2048.prototype._getAvailablePosition = function () {
  var emptyTiles = [];

  this.board.forEach(function(row, rowIndex){
    row.forEach(function(elem, colIndex){
      if (!elem) emptyTiles.push({ x: rowIndex, y: colIndex });
    });
  });

  if (emptyTiles.length === 0)
    return false;

  var randomPosition = Math.floor(Math.random() * emptyTiles.length);
  return emptyTiles[randomPosition];
};

// Render the Board
Game2048.prototype._renderBoard = function () {
  // For each row in the board, console.log the row.
  this.board.forEach(function(row){ console.log(row); });
  console.log('Score: ' + this.score);
};

// Move Left
Game2048.prototype._moveLeft = function () {
  var newBoard = [];
  var that = this;
  var boardChanged = false;

  this.board.forEach (function (row) {
    var newRow = row.filter(function (i) {
      return i !== null;
    });

    // Loop through the newRow until length
    for(i = 0; i < newRow.length - 1; i++) {
      // If the next element equals the current element
      if (newRow[i+1] === newRow[i]) {
        ion.sound.play("tap");
        // Current index equals new Row multiplied by 2
        newRow[i]   = newRow[i] * 2;
        // Set next element to null.
        newRow[i+1] = null;
        // Update the score with the new valued tile.
        that._updateScore(newRow[i]);
      }
    }

    var merged = newRow.filter(function (i) {
      return i !== null;
    });

    while(merged.length < 4) {
      // Adding item to the end of the array.
      merged.push(null);
    }

    if (newRow.length !== row.length)
      boardChanged = true;

    newBoard.push(merged);
  });

  this.board = newBoard;
  return boardChanged;
};

// Move Right
Game2048.prototype._moveRight = function () {
  //  Create new empty board, to push values to
  var newBoard = [];
  var that = this;
  // Initial flag to for board change.
  var boardChanged = false;

  // For each row in the board
  this.board.forEach (function (row) {
    // newRow equals the row filtered for an empty element
    var newRow = row.filter(function (i) {
      return i !== null;
    });

    // Loop through newRow, with index starting at newRow.length
    // Start at the end of the row.
    // while i greater than 0, decerement i
    for (i=newRow.length - 1; i>0; i--) {
      // If previous element eqauls current element
      if (newRow[i-1] === newRow[i]) {
        ion.sound.play("tap");
        // Set the current index to the multiple of itself by 2
        newRow[i]   = newRow[i] * 2;
        // Emtpy the previous index contents
        newRow[i-1] = null;
        // Update the score with the new valued tile.
        that._updateScore(newRow[i]);
      }

      // If the length of the new row does not equal current row length
      if (newRow.length !== row.length) boardChanged = true; // Board Changed
    }

    // Merged equals the filtered new roww where i is not null
    var merged = newRow.filter(function (i) {
      return i !== null;
    });

    // While merged length is less than 4
    while(merged.length < 4) {
      // Adding item to the front of the array.
      merged.unshift(null);
    }

    newBoard.push(merged);
  });

  this.board = newBoard;
  return boardChanged;
};

// Moving up
Game2048.prototype._moveUp = function () {
  // Flip and rotate the board
  this._transposeMatrix();
  // Move left, which is moving up on the flipped board
  var boardChanged = this._moveLeft();
  // Flip and rotate the board back
  this._transposeMatrix();
  // Return the updated board
  return boardChanged;
};

// Moving down
Game2048.prototype._moveDown = function () {
  this._transposeMatrix();
  var boardChanged = this._moveRight();
  this._transposeMatrix();
  return boardChanged;
};

// Transpose the 4x4 board. (turn it 90 degrees essentially)
Game2048.prototype._transposeMatrix = function () {
  for (var row = 0; row < this.board.length; row++) {
    for (var column = row+1; column < this.board.length; column++) {
      var temp = this.board[row][column];
      this.board[row][column] = this.board[column][row];
      this.board[column][row] = temp;
    }
  }
};

Game2048.prototype.move = function (direction) {
  if (!this._gameFinished()) {
    switch (direction) {
      case "up":    boardChanged = this._moveUp();    break;
      case "down":  boardChanged = this._moveDown();  break;
      case "left":  boardChanged = this._moveLeft();  break;
      case "right": boardChanged = this._moveRight(); break;
    }

    if (boardChanged) {
      this._generateTile();
      this._isGameLost();
    }
  }
};

Game2048.prototype._updateScore = function(value) {
  this.score += value;
};

Game2048.prototype._gameFinished = function() {
  return this.lost;
};

// Checks to see if the game is lost
Game2048.prototype._isGameLost = function () {
  // If there is a position available, then return.
  if (this._getAvailablePosition())
    return;

  var that   = this;
  var isLost = true;

  // For each row in the board
  this.board.forEach(function (row, rowIndex) {
    // For each cell in the row
    row.forEach(function (cell, cellIndex) {
      // Current is equal to position at board[r][c].
      var current = that.board[rowIndex][cellIndex];
      // Create empty movement variables.
      var top, bottom, left, right;

      // If the element to the left exists
      if (that.board[rowIndex][cellIndex - 1]) {
        // Assign left to that element
        left  = that.board[rowIndex][cellIndex - 1];
      }
      // If the element to the right exist
      if (that.board[rowIndex][cellIndex + 1]) {
        // Assign right to the found element
        right = that.board[rowIndex][cellIndex + 1];
      }
      // If the element at the top exist
      if (that.board[rowIndex - 1]) {
        // Assign top to the found element
        top    = that.board[rowIndex - 1][cellIndex];
      }
      // If the element on the bottom exist
      if (that.board[rowIndex + 1]) {
        bottom = that.board[rowIndex + 1][cellIndex];
      }

      if (current === top || current === bottom || current === left || current === right)
        isLost = false;
    });
  });

  this.lost = isLost;
};

// ------------------------------------------------
// View Logic
// ------------------------------------------------

function renderTiles () {
  // For each row on the board
  game.board.forEach(function(row, rowIndex){
    // For each cell in the row
    row.forEach(function (cell, cellIndex) {
      // If there is cell
      if (cell) {
        // Assign titleContainer to element with id of tile-container
        var tileContainer = document.getElementById("tile-container");
        // Assign newTile to created div.
        var newTile       = document.createElement("div");

        // Update the class with dynamic data for behavior
        newTile.classList  = "tile val-" + cell;
        newTile.classList += " tile-position-" + rowIndex + "-" + cellIndex;
        newTile.innerHTML  = (cell);

        //Append new Tile to the tile container
        tileContainer.appendChild(newTile);
      }
    });
  });
}

// Updates the score
function updateScore () {
  // Stores the current game score
  var score          = game.score;
  // Grabs elements by js-score class name
  var scoreContainer = document.getElementsByClassName("js-score");
  // Convert the scoreContainer to an array,
  // For each span in the score container
  Array.prototype.slice.call(scoreContainer).forEach(function (span) {
    // Update the span with scrore.
    span.innerHTML = score;
  });
}

// Check the game status
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

// Keyboard move listener
function moveListeners (event) {
  ion.sound.play("snap");
  // keys that represent movement
  var keys = [37, 38, 39, 40];

  // If there is no keyCode on this event, then return nothing
  if (keys.indexOf(event.keyCode) < 0)
    return;

  // Based on the keyCode recieved, execute move accordingly.
  switch (event.keyCode) {
    case 37: game.move("left");  break;
    case 38: game.move("up");    break;
    case 39: game.move("right"); break;
    case 40: game.move("down");  break;
  }
  console.log("Rendering the current board: ");
  game._renderBoard();
  // Reset the Tiles
  resetTiles();
  // Render Tiles with the update
  renderTiles();
  // Update the score on every valid keyboard event.
  updateScore();
  // Update the game status on every keyboard event.
  gameStatus();
}

// Reset Tiles
function resetTiles () {
  // Target the tiles container based on id.
  var tilesContainer = document.getElementById("tile-container");

  // Grab all the tiles off the tilesContainer.
  var tiles          = tilesContainer.getElementsByClassName("tile");

  //Convert the node collection into an Array so that we can iterate.
  Array.prototype.slice.call(tiles).forEach(function (tile) {
    // Remove the child from the tiles container.
    tilesContainer.removeChild(tile);
  });
}

document.addEventListener("keydown", moveListeners);

// Interaction Logic
$(document).ready(function(){
  game = new Game2048();
  loadSounds();
  // render the tiles to the DOM
  renderTiles();
});
