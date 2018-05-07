function aTAM3D( ) {
  this.tileset = {};
  this.bondStrengths = {};
  this.history = [];
  this.temperature = 2;
  this.currIdx = -1;

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
              //alert('T');
            }
            else if (allText[i][0] === 'B') {
              // Add bond
              //alert('B');
            }
            else if (allText[i][0] === 'S') {
              // Add seed
              //alert('S');
            }
          }
        }
      }
    }
    request.send();
  };

  this.take_step = function() {

  };

}

function Assembly() {
  this.tile_positions = [];
}

function Tile(name, bonds, color) {
  this.name = name;
  this.color = color;

  this.north = bonds[0];
  this.east = bonds[1];
  this.south = bonds[2];
  this.west = bonds[3];
  this.up = bonds[4];
  this.down = bonds[5];
}
// Assembly = function () {
//   tiles: [],
// }
