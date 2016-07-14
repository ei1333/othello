$(function()
{
  new Othello("#othello");
});

var Othello = function(container)
{
  this.container = $(container);
  this.canvas    = this.container.find("canvas")[0];
  this.context   = this.canvas.getContext("2d");

  this.height    = this.canvas.height;
  this.width     = this.canvas.width;
  this.cellwidth = this.width / 8;  
  if(this.height != this.width) {
    alert("[Error] 縦幅と横幅が違う><");
    return;
  }
  
  this.backgroundcolor = "#00790C";
  this.linecolor       = "#FFFFFF";

  this.any   = 0; 
  this.white = 1;
  this.black = 2;
  this.ablewhite = (1 << 4);
  this.ableblack = (1 << 5);
  this.accent    = (1 << 6);

  this.board = [];
  this.vx = [-1, 0, 1, 1, 1, 0, -1, -1];
  this.vy = [-1, -1, -1, 0, 1, 1, 1, 0];

  this.message = this.container.find("#message");
  
  this.user = this.black;
  this.enemy = this.white;

  this.ableclick = true;
  
  this.Inisialize();
  this.AllPutable();
  this.Paint();
 
  var self = this;
  this.container.find("canvas").on("click", function(event)
  {
    if(!self.ableclick) return;
    x = event.originalEvent.pageX - $(this).offset().left;
    y = event.originalEvent.pageY - $(this).offset().top;
    self.Attach(x / self.cellwidth | 0, y / self.cellwidth | 0, self.user);
  });
};

Othello.prototype.Inisialize = function()
{
  for(var i = 0; i < 8; i++) {
    this.board[i] = [];
    for(var j = 0; j < 8; j++) {
      this.board[i][j] = this.any;
    }
  }
  this.board[3][4] = this.board[4][3] = this.black;
  this.board[3][3] = this.board[4][4] = this.white;
};

Othello.prototype.Paint = function()
{
  var object = this.context;

  object.fillStyle = this.backgroundcolor;
  object.fillRect(0, 0, this.width, this.width);

  object.strokeStyle = this.linecolor;
  object.beginPath();
  for(var i = 0; i < 8; i++) {
    object.moveTo(0, i * this.cellwidth);
    object.lineTo(this.width, i * this.cellwidth);
    object.moveTo(i * this.cellwidth, 0);
    object.lineTo(i * this.cellwidth, this.width);
  }
  object.closePath();
  object.stroke();

  for(var i = 0; i < 8; i++) {
    for(var j = 0; j < 8; j++) {
      if(this.board[i][j] == this.white || this.board[i][j] == this.black) {
        //object.save();
        object.beginPath();
        object.fillStyle = this.board[i][j] == this.white ? "#FFFFFF" : "#000000";
        object.arc(this.cellwidth / 2 + j * this.cellwidth,
                   this.cellwidth / 2 + i * this.cellwidth,
                   this.cellwidth * 0.45, 0, Math.PI * 2, true);
        
        object.fill();
        //object.restore();
      }
      if((this.board[i][j] & this.accent) || (this.board[i][j] & this.ablewhite && this.user == this.white) || (this.board[i][j] & this.ableblack && this.user == this.black && this.ableclick)) {
        object.beginPath();
        
        object.fillStyle = object.strokeStyle = (this.board[i][j] & this.accent ? "#33FFFF" : "#FFFFFF");
        
        object.arc(this.cellwidth / 2 + j * this.cellwidth,
                   this.cellwidth / 2 + i * this.cellwidth,
                   this.cellwidth * 0.3, 0, Math.PI * 2, true);
        if(this.accent & this.board[i][j]) object.fill();
        else object.stroke();
      }
    }
  }
};

Othello.prototype.Countputable = function(color)
{
  var bits = (color == this.white ? this.ablewhite : this.ableblack);
  var count = 0;
  for(var i = 0; i < 8; i++) {
    for(var j = 0; j < 8; j++) {
      if(this.board[i][j] & bits) count += 1;
    }
  }
  return(count);
};
Othello.prototype.Countcolor = function(color)
{
  var count = 0;
  for(var i = 0; i < 8; i++ ){
    for(var j = 0; j < 8; j++) {
      if(this.board[i][j] == color) count += 1;
    }
  }
  return(count);
};


Othello.prototype.Exit = function()
{
};

Othello.prototype.playCPU = function(color)
{ 
  var bits = (color == this.white ? this.ablewhite : this.ableblack);
  var think = [];
  for(var i = 0; i < 8; i++) {
    for(var j = 0; j < 8; j++) {
      if(this.board[i][j] & bits) think.push([j, i]);
    }
  }
  var poyo = Math.floor(Math.random() * think.length);
  this.Attach(think[poyo][0], think[poyo][1], color);
};

// ターンチェンジ
Othello.prototype.changeTurn = function(color)
{
  this.message.text("黒: " + this.Countcolor(this.black) + ", 白: " + this.Countcolor(this.white));

  if(color == this.user) {
    if(this.Countputable(this.enemy) > 0) {
      var self = this;
      setTimeout(function() {
        self.playCPU(self.enemy);
      }, 300);
    } else if(this.Countputable(this.user) > 0) {
      this.ableclick = true;
      this.Paint();
    } else {
      this.Exit();
    }
  } else {
    if(this.Countputable(this.user) > 0) {
      this.ableclick = true;
      this.Paint();
    } else if(this.Countputable(this.enemy) > 0) {
      var self = this;
      setTimeout(function() {
        self.playCPU(self.enemy);
      }, 300); 
    } else {
      this.Exit();
    }
  }
};

// クリックされた
Othello.prototype.Attach = function(x, y, color)
{
  if((color == this.white && !(this.board[y][x] & this.ablewhite)) ||
     (color == this.black && !(this.board[y][x] & this.ableblack))) {
    this.message.text("そのセルにはおけません><");
    return;
  }
  this.ableclick = false;
  this.message.text("(" + x + " ," + y + ")");

  var self = this;
  this.board[y][x] = this.accent;
  this.Paint();
  setTimeout(function()
  {
    self.Cellput(x, y, color);
    setTimeout(function() {
      self.Paint();
      self.changeTurn(color);
    }, 200);
  }, 100);
};

Othello.prototype.AllPutable = function()
{
  for(var i = 0; i < 8; i++) {
    for(var j = 0; j < 8; j++) {
      if(this.board[i][j] != this.white && this.board[i][j] != this.black) {
        this.board[i][j] = 0;
        if(this.CellPutable(j, i, this.white)) {
          this.board[i][j] |= this.ablewhite;
        }
        if(this.CellPutable(j, i, this.black)) {
          this.board[i][j] |= this.ableblack;
        }
      }
    }
  }
};

Othello.prototype.isout = function(x, y)
{
  return(x < 0 || y < 0 || x >= 8 || y >= 8);
};

Othello.prototype.CellPutable = function(x, y, color)
{
  if(this.board[y][x] == this.white) return(false);
  if(this.board[y][x] == this.black) return(false);

  var enemy = color == this.white ? this.black : this.white;

  for(var i = 0; i < this.vy.length; i++) {
    var nx = x + this.vx[i], ny = y + this.vy[i];
    if(this.isout(nx, ny)) {
      continue;
    }
    if(this.board[ny][nx] == enemy) {
      while(!this.isout(nx, ny) && this.board[ny][nx] == enemy) {
        nx += this.vx[i];
        ny += this.vy[i];
      }
      if(!this.isout(nx, ny) && this.board[ny][nx] == color) {
        return(true);
      }
    }
  }
  return(false); 
};

Othello.prototype.Cellput = function(x, y, color)
{
  var enemy = color == this.white ? this.black : this.white;
  for(var i = 0; i < this.vy.length; i++) {
    var nx = x + this.vx[i], ny = y + this.vy[i];
    if(this.isout(nx, ny)) {
      continue;
    }
    if(this.board[ny][nx] == enemy) {
      while(!this.isout(nx, ny) && this.board[ny][nx] == enemy) {
        nx += this.vx[i];
        ny += this.vy[i];
      }
      if(!this.isout(nx, ny) && this.board[ny][nx] == color) {
        nx = x + this.vx[i], ny = y + this.vy[i];
        while(!this.isout(nx, ny) && this.board[ny][nx] != color) {
          this.board[ny][nx] = color;
          nx += this.vx[i];
          ny += this.vy[i];
        }
      }
    }
  }
  this.board[y][x] = color;
  this.AllPutable();
};
