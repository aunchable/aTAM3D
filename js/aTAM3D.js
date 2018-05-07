aTAM3D = function( ) {
  var self = this;
  this.tileset = {};
  this.bondStrengths = {};
  this.history = [];
  this.temperature = 2;
  this.currIdx = -1;
  this.seedAssembly = new Assembly();
  this.currAssembly = new Assembly();

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
  this.addTile = function(tile) {
    self.tiles.push(tile);
  }
}

TileType = function(name, bonds, color) {
  this.name = name;

  if (color === 'R') {
    this.color = 0xff0000;
  } else if (color === 'G') {
    this.color = 0x00ff00;
  } else if (color === 'B') {
    this.color = 0x0000ff;
  } else {
    this.color = 0xffffff;
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
