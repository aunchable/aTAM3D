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

  this.generateBondRules = funtion() {
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
              self.seedAssembly.addTile(tile);
              self.currAssembly.addTile(tile);
            }
          }
          self.generateBondRules();
        }
      }
    }

    for (var i in Object.keys(self.tileset)) {
      alert(Object.keys(self.tileset)[i]);
    }
    request.send();
  };

  this.take_step = function() {

  };

}

Assembly = function() {
  var self = this;
  this.tiles = [];

  // Key is 'x_y_z', Value is [tiletype name] + boolean * 6 to say if tile
  // exists adjacent in corresponding direction
  this.position_tiles = {};

  this.addTile = function(tile) {
    self.tiles.push(tile);

    var position = [tile.x, tile.y, tile.z];
    var position_string = position.map(String).join('_');

    if (!(position_string in self.position_tiles)) {
        self.position_tiles[position_string] = [tile.tiletype.name, false, false, false, false, false, false];

        var unit_vecs = [[0,1,0],[1,0,0],[0,-1,0],[-1,0,0],[0,0,1],[0,0,-1]];
        for (var j in unit_vecs) {
          var adj = [];
          for(var i = 0; i < 3; i++) {
            adj.push(unit_vecs[j][i] + position[i]);
          }
          var adj_string = adj.map(String).join('_');
          if (adj_string in self.position_tiles) {
              if (j === 0) { // Check if tile is on north side
                  self.position_tiles[position_string][1] = true;
                  self.position_tiles[adj_string][3] = true;
              } else if (j === 1) { // Check if tile is on east side
                  self.position_tiles[position_string][2] = true;
                  self.position_tiles[adj_string][4] = true;
              } else if (j === 2) { // Check if tile is on south side
                  self.position_tiles[position_string][3] = true;
                  self.position_tiles[adj_string][1] = true;
              } else if (j === 3) { // Check if tile is on west side
                  self.position_tiles[position_string][4] = true;
                  self.position_tiles[adj_string][2] = true;
              } else if (j === 4) { // Check if tile is on up side
                  self.position_tiles[position_string][5] = true;
                  self.position_tiles[adj_string][6] = true;
              } else if (j === 5) { // Check if tile is on down side
                  self.position_tiles[position_string][6] = true;
                  self.position_tiles[adj_string][5] = true;
              }
          }
        }
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
  } else {
    this.color = '#ffffff';
  }

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
