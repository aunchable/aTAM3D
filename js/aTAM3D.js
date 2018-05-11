aTAM3D = function( ) {
  var self = this;
  this.tileset = {};
  this.bondStrengths = {};
  this.bondRules = {};
  this.history = [];
  this.temperature = 2;
  this.currIdx = -1;
  this.seedAssembly = new Assembly();
  this.currAssembly = new Assembly();
  var unitVecs = [[0,1,0],[1,0,0],[0,-1,0],[-1,0,0],[0,0,1],[0,0,-1]];

  this.generateBondRules = function() {
    Object.keys(self.tileset).forEach(function(key1) {
      var tile1 = self.tileset[key1];
      self.bondRules[key1] = {};
      for (var j = 0; j < 6; j++) {
        self.bondRules[key1][String(j)] = {};
        Object.keys(self.tileset).forEach(function(key2) {
          var tile1_bond;
          var tile2_bond;
          if (j === 0) { // Tile 2 north of Tile 1
            tile1_bond = tile1.north;
            tile2_bond = self.tileset[key2].south;
          } else if (j === 1) { // Tile 2 east of Tile 1
            tile1_bond = tile1.east;
            tile2_bond = self.tileset[key2].west;
          } else if (j === 2) { // Tile 2 south of Tile 1
            tile1_bond = tile1.south;
            tile2_bond = self.tileset[key2].north;
          } else if (j === 3) { // Tile 2 west of Tile 1
            tile1_bond = tile1.west;
            tile2_bond = self.tileset[key2].east;
          } else if (j === 4) { // Tile 2 above of Tile 1
            tile1_bond = tile1.up;
            tile2_bond = self.tileset[key2].down;
          } else if (j === 5) { // Tile 2 below of Tile 1
            tile1_bond = tile1.down;
            tile2_bond = self.tileset[key2].up;
          }
          if ((tile1_bond in self.bondStrengths) && (tile2_bond in self.bondStrengths[tile1_bond])) {
            self.bondRules[key1][String(j)][key2] = self.bondStrengths[tile1_bond][tile2_bond];
          }
        });
      }
    });
  }

  this.load = function(path) {
    var request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200 || request.status == 0) {
          var allText = request.responseText.split("\n");
          var success = true;
          for (var i in allText) {
            if (allText[i][0] === 'T') {
              // Add tile
              var tileInfo = allText[i].split(' ');
              var tile = new TileType(tileInfo[1], tileInfo.slice(3), tileInfo[2]);
              self.tileset[tileInfo[1]] = tile;
            }
            else if (allText[i][0] === 'B') {
              // Add bond
              var bondInfo = allText[i].split(' ');
              if (!(bondInfo[1] in self.bondStrengths)) {
                self.bondStrengths[bondInfo[1]] = {};
              }
              self.bondStrengths[bondInfo[1]][bondInfo[2]] = Number(bondInfo[3]);
              if (!(bondInfo[2] in self.bondStrengths)) {
                self.bondStrengths[bondInfo[2]] = {};
              }
              self.bondStrengths[bondInfo[2]][bondInfo[1]] = Number(bondInfo[3]);
            }
            else if (allText[i][0] === 'S') {
              // Add seed tile
              var seedTileInfo = allText[i].split(' ');
              var tiletype = self.tileset[seedTileInfo[1]];
              var tile = new Tile(
                tiletype,
                Number(seedTileInfo[2]),
                Number(seedTileInfo[3]),
                Number(seedTileInfo[4])
              );
              var add_success = self.seedAssembly.addTile(tile);
              self.currAssembly.addTile(tile);
              if (!add_success) {
                  success = false;
              }
            }
          }
          self.generateBondRules();
          if (!success) {
              alert('At least two seed tiles have same specified position!');
          }
        }
      }
    }
    request.send();
  };

  this.take_step = function() {
    var success = false;
    var counter = 0;
    while ((!success) && (counter < 2 * self.currAssembly.numTiles)) {
      counter = counter + 1;
      var currTileIdx = Math.floor(Math.random() * self.currAssembly.numTiles);
      var currTile = self.currAssembly.tiles[currTileIdx];
      var position = [currTile.x, currTile.y, currTile.z];
      var positionString = position.map(String).join('_');

      var posIndexes = shuffle([0, 1, 2, 3, 4, 5]);
      for (var j = 0; j < 6; j++) {
        // If space in direction is open
        if ((!success) && (self.currAssembly.positionTiles[positionString][posIndexes[j] + 1] === false)) {
          var newPosition = [];
          var unitVec = unitVecs[posIndexes[j]];
          for (var k = 0; k < 3; k++) {
            newPosition.push(unitVec[k] + position[k]);
          }
          var newPositionString = newPosition.map(String).join('_');

          var possibleTiles = Object.keys(self.bondRules[currTile.tiletype.name][String(posIndexes[j])]);
          var posTilesIndexes = [];
          for (var cnt = 0; cnt < possibleTiles.length; cnt++) {
            posTilesIndexes.push(cnt);
          }
          posTilesIndexes = shuffle(posTilesIndexes);

          for (var idx = 0; idx < posTilesIndexes.length; idx++) {
            if (!success) {
              var newTileName = possibleTiles[posTilesIndexes[idx]];
              var strength = 0;
              for (var i = 0; i < 6; i++) {
                neighborPosition = [];
                for (k = 0; k < 3; k++) {
                  neighborPosition.push(unitVecs[i][k] + newPosition[k]);
                }
                var neighborPositionString = neighborPosition.map(String).join('_');
                if (neighborPositionString in self.currAssembly.positionTiles) {
                  var neighborTileName = self.currAssembly.positionTiles[neighborPositionString][0];
                  if (neighborTileName in self.bondRules[newTileName][String(i)]) {
                    strength = strength + self.bondRules[newTileName][String(i)][neighborTileName];
                  }
                }
              }
              if (strength >= self.temperature) {
                var newTile = new Tile(self.tileset[newTileName], newPosition[0], newPosition[1], newPosition[2]);
                self.currAssembly.addTile(newTile);
                self.history.push(newTile);
                self.currIdx = self.currIdx + 1;
                success = true;
              }
            }
          }
        }
      }
    }
  };

  this.bondRulesToString = function() {
    var messages = [];
    Object.keys(self.bondRules).forEach(function(key1) {
      Object.keys(self.bondRules[key1]).forEach(function(key2) {
        Object.keys(self.bondRules[key1][key2]).forEach(function(key3) {
          var messageArray = [key1, key2, key3, String(self.bondRules[key1][key2][key3])];
          var message = messageArray.join('_');
          messages.push(message);
        });
      });
    });
    return messages.join('\n');
  };

  this.currAssemblyToString = function() {
    var messages = [];
    for (var i in self.currAssembly.tiles) {
      var tile = self.currAssembly.tiles[i];
      var positionMessageArray = [tile.x, tile.y, tile.z];
      var positionMessage = positionMessageArray.map(String).join('_');
      var neighborMessage = self.currAssembly.positionTiles[positionMessage].slice(1).map(String).join(',');
      var messageArray = [tile.tiletype.name, positionMessage, neighborMessage];
      var message = messageArray.join(' ');
      messages.push(message);
    }
    return messages.join('\n');
  };

}

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

Assembly = function() {
  var self = this;
  this.tiles = [];
  this.closedPositions = [];
  this.numTiles = 0;
  var unitVecs = [[0,1,0],[1,0,0],[0,-1,0],[-1,0,0],[0,0,1],[0,0,-1]];

  // Key is 'x_y_z', Value is [tiletype name] + boolean * 6 to say if tile
  // exists adjacent in corresponding direction
  this.positionTiles = {};

  this.addTile = function(tile) {
    self.tiles.push(tile);

    var position = [tile.x, tile.y, tile.z];
    var position_string = position.map(String).join('_');

    if (!(position_string in self.positionTiles)) {
      self.positionTiles[position_string] = [tile.tiletype.name, false, false, false, false, false, false];

      for(var j = 0; j < 6; j++) {
        var adj = [];
        for(var i = 0; i < 3; i++) {
          adj.push(unitVecs[j][i] + position[i]);
        }
        var adj_string = adj.map(String).join('_');
        if (adj_string in self.positionTiles) {
          if (j === 0) { // Check if tile is on north side
            self.positionTiles[position_string][1] = true;
            self.positionTiles[adj_string][3] = true;
          } else if (j === 1) { // Check if tile is on east side
            self.positionTiles[position_string][2] = true;
            self.positionTiles[adj_string][4] = true;
          } else if (j === 2) { // Check if tile is on south side
            self.positionTiles[position_string][3] = true;
            self.positionTiles[adj_string][1] = true;
          } else if (j === 3) { // Check if tile is on west side
            self.positionTiles[position_string][4] = true;
            self.positionTiles[adj_string][2] = true;
          } else if (j === 4) { // Check if tile is on up side
            self.positionTiles[position_string][5] = true;
            self.positionTiles[adj_string][6] = true;
          } else if (j === 5) { // Check if tile is on down side
            self.positionTiles[position_string][6] = true;
            self.positionTiles[adj_string][5] = true;
          }
        }
      }
      self.numTiles = self.numTiles + 1;
      return(true);
    } else {
      return(false);
    }
  }
}

TileType = function(name, bonds, color) {
  this.name = name;

  if (color === 'R') {
    this.color = '#ff0000';
  } else if (color === 'G') {
    this.color = '#00ff00';
  } else if (color === 'B') {
    this.color = '#0000ff';
  } else if (color === 'Y') {
    this.color = '#ffff00';
  } else if (color === 'gray') {
    this.color = '#666666';
  }

  this.bonds = bonds;

  this.north = bonds[0];
  this.east = bonds[1];
  this.south = bonds[2];
  this.west = bonds[3];
  this.up = bonds[4];
  this.down = bonds[5];
}

Tile = function(tiletype, x, y, z) {
  this.tiletype = tiletype
  this.x = x
  this.y = y
  this.z = z
}
// Assembly = function () {
//   tiles: [],
// }
