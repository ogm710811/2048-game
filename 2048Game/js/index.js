function Game2048 () {
  this.board = [
    [null,null,null,null],
    [null,null,null,null],
    [null,null,null,null],
    [null,null,null,null]
  ];
	
  this.score = 0;
  this.won   = false;
  this.lost  = false;

  // generate two random tiles in the class initialization
  this._generateTile();
  this._generateTile();
  
}

//**********************************************************************
// PRIVATE METHODS
//**********************************************************************

//**********************************************************************
// _generateTile
// Inserts the tile in a random position inside the 
// board.
//**********************************************************************

Game2048.prototype._generateTile = function () {

  // use a random value (that generate a number between 0 and 1)
  // to decide the value we will give to the tile. 
  // This value has an 80% chance to be 2, and just a 20% chance
  // to be 4.
  var initialValue = (Math.random() < 0.8) ? 2 : 4;
  var emptyTile = this._getAvailablePosition();

  if (emptyTile) {
    this.board[emptyTile.x][emptyTile.y] = initialValue;
  }
};

//**********************************************************************
// _getAvailablePosition
// Checks the board for available positions. 
// This method will iterate over the board, get 
// the available positions, and return a random 
// vailable position.
//**********************************************************************

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

//**********************************************************************
// _renderBoard
// Prints the game board, to be able to see how the game 
// is going. We just have to iterate over the board rows 
// and print the full array that we have in each row.
//**********************************************************************

Game2048.prototype._renderBoard = function () {
  this.board.forEach(function(row){ console.log(row); });
  console.log('Score: ' + this.score);
};

//**********************************************************************
// Moving tiles
//**********************************************************************

//**********************************************************************
// _moveLeft 
// do two different actions at the same time: move left 
// and merge (if necessary). Create a new board where we are going to 
// insert the tiles already merged if it’s necessary. We will use 
// both the new and the old board to figure out if the tiles have to 
// be merged or stay with the same value.
//**********************************************************************

Game2048.prototype._moveLeft = function () {
  var newBoard = [];
  var that = this;
  var boardChanged = false;

  // Create a new row without the null values. 
  // Ignore the null values to merge the tiles.
  this.board.forEach (function (row) {
    var newRow = row.filter(function (i) {
      return i !== null;
    });

    // iterate over the new row values from left to right, 
    // to merge the tiles on this direction. This way, the result 
    // for three tiles with values “2, 2, 2” will be “4, 2” instead of “2, 4”.
    for(i = 0; i < newRow.length - 1; i++) {
      if (newRow[i+1] === newRow[i]) {
        newRow[i]   = newRow[i] * 2;
        newRow[i+1] = null;

        // call method to update score
        that._updateScore(newRow[i]);
      }
    }

    // Filter from new row those that are not null.
    // Once we have finished the iteration, adds null values until the row has a length of 4. 
    // This is to avoid having rows with different sizes on the board.
    var merged = newRow.filter(function (i) {
      return i !== null;
    });
		
    while(merged.length < 4) {
      merged.push(null);
    }
    
    // check new board and old one have same length;
    if (newRow.length !== row.length)
      boardChanged = true;

    newBoard.push(merged);
  });

  // assign to the matrix the new board, so we have the matrix 
  // updated with the result of the move.
  this.board = newBoard;
  return boardChanged;
};

//**********************************************************************
// _moveRight 
// this method will be exactly the same as the moveLeft function,
// but we’ll change the direction of the iterations.
//**********************************************************************

Game2048.prototype._moveRight = function () {
  var newBoard = [];
  var that = this;
  var boardChanged = false;

  this.board.forEach (function (row) {
    var newRow = row.filter(function (i) {
      return i !== null;
    });

    for (i=newRow.length - 1; i>0; i--) {
      if (newRow[i-1] === newRow[i]) {
        newRow[i]   = newRow[i] * 2;
        newRow[i-1] = null;

        // call method to update score
        that._updateScore(newRow[i]);
      }
          
      if (newRow.length !== row.length) boardChanged = true;
    }

    var merged = newRow.filter(function (i) {
      return i !== null;
    });
		
    // while merged lenght < 4 => add a null to the front of
    // the array
    while(merged.length < 4) {
      merged.unshift(null);
    }
    
    if (newRow.length !== row.length)
      boardChanged = true;

    newBoard.push(merged);
  });

  this.board = newBoard;
  return boardChanged;
};

//**********************************************************************
// _transposeMatrix
// transpose the bidimensional array. rotate the board game 90 degree
//**********************************************************************

Game2048.prototype._transposeMatrix = function () {
  for (var row = 0; row < this.board.length; row++) {
    for (var column = row+1; column < this.board.length; column++) {
      var temp = this.board[row][column];
      this.board[row][column] = this.board[column][row];
      this.board[column][row] = temp;
    }
  }
};

//**********************************************************************
// _moveUp
// this method will be exactly the same as the moveLeft function,
// but we’ll change the direction of the iterations.
//**********************************************************************

Game2048.prototype._moveUp = function () {
  this._transposeMatrix();
  var boardChanged = this._moveLeft();
  this._transposeMatrix();
  return boardChanged;
};

//**********************************************************************
// _moveDown
// same code than the moveUp function, but we will have
// to move the tiles to the right instead of moving them to the left.
//**********************************************************************

Game2048.prototype._moveDown = function () {
  this._transposeMatrix();
  var boardChanged = this._moveRight();
  this._transposeMatrix();
  return boardChanged;
};

//**********************************************************************
// _move
// receives as a parameter the direction of the move.
// call different functions
//**********************************************************************

Game2048.prototype._move = function (direction) {
  if (!this._gameFinished()) {
    switch (direction) {
      case "up":    boardChanged = this._moveUp();    break;
      case "down":  boardChanged = this._moveDown();  break;
      case "left":  boardChanged = this._moveLeft();  break;
      case "right": boardChanged = this._moveRight(); break;
    }

    if (boardChanged) {
      this._generateTile();
      // check out if the game is finished. The game will be over if 
      // all the positions are filled with a tile, and no movements can be done. 
      // After each move, if the move has changed the board, we will have 
      // to check if the game is lost.
      this._isGameLost();
    }
  }
};

//**********************************************************************
// _updateScore
// The score of the game is very easy to understand and implement.
// When two tiles are merged into one, the value of the new tile is 
// added to the current score.
//**********************************************************************

Game2048.prototype._updateScore = function (value) {
  this.score += value;
   // win
   if (value === 2048) {
    this.won = true;
  }
};

//**********************************************************************
// _gameFinished
// This function will just return the value of lost variable.
//**********************************************************************

Game2048.prototype._gameFinished = function() {
  return this.lost;
};

//**********************************************************************
// _win
// This function will just return the value of win variable.
//**********************************************************************

Game2048.prototype._win = function () {
  return this.won;
};

//**********************************************************************
// _isGameLost
// Checks to see if the game is lost
//**********************************************************************

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

//**********************************************************************
// INTERACTION LOGIC
//**********************************************************************

$(document).ready(function(){

  var game = new Game2048();
  console.log('Initial Board');
  game._renderBoard();

  console.log('===move up===');
  game._move("up");
  game._renderBoard();

  console.log('===move down===');
  game._move("down");
  game._renderBoard();

  console.log('===move left===');
  game._move("left");
  game._renderBoard();

  console.log('===move right===');
  game._move("right");
  game._renderBoard();

  console.log('Game is ready');

});
