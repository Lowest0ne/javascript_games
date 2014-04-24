function FifteenPuzzle( canvas )
{
  this.tiles = []
  this.current_idx  = undefined;

  this.canvas   = canvas;
  this.size     = this.canvas.width;
  this.sections = 4;

  this.context = this.canvas.getContext( '2d' );
  this.context.font = "bold 24px sans-serif";

  this.init();
}

FifteenPuzzle.prototype.init = function() {
  this.canvas.addEventListener( 'mousemove', this.mouseMove.bind( this ) );
  this.canvas.addEventListener( 'click', this.mouseClick.bind( this ) );
  this.canvas.addEventListener( 'mouseenter', this.mouseEnter.bind( this ) );
  this.canvas.addEventListener( 'mouseleave', this.mouseLeave.bind( this ) );

  for ( var i = 0; i < this.tileCount() - 1; ++i )
    this.tiles.push(  new Tile( i + 1 ) );
  this.tiles.push( undefined );

  for ( var i = 0; i < this.tiles.length; ++i )
  {
    var random = Math.floor( Math.random() * this.tiles.length );
    var temp = this.tiles[ random ];
    this.tiles[ random ] = this.tiles[ i ];
    this.tiles[ i ] = temp;
  }

  for ( var i = 0; i < this.tileCount(); ++i )
  {
    if ( this.tiles[i] !== undefined )
    {
      this.drawTile( i );
    }
    else
    {
      this.drawBlank( i );
    }
  }
  this.drawGrid();
}

FifteenPuzzle.prototype.tileSize = function()
{
  return this.size / this.sections;
}

FifteenPuzzle.prototype.tileCount = function()
{
  return this.sections * this.sections;
}

FifteenPuzzle.prototype.tileLocation = function( tile_idx )
{
  return {
    x: ( tile_idx % this.sections ) * this.tileSize(),
    y: ( Math.floor( tile_idx / this.sections ) * this.tileSize() )
  };
}

FifteenPuzzle.prototype.tileAt = function( tile_idx )
{
  return this.tiles[ tile_idx ];
}

FifteenPuzzle.prototype.currentTile = function()
{
  if ( this.current_idx === undefined ) return undefined;
  return this.tileAt( this.current_idx );
}

FifteenPuzzle.prototype.drawLine = function( x_from, y_from, x_to, y_to )
{
  this.context.moveTo( x_from, y_from );
  this.context.lineTo( x_to, y_to );
}

FifteenPuzzle.prototype.drawGrid = function(){
  for ( var i = 0.5; i < this.size; i += this.tileSize() )
  {
    this.drawLine( i, 0, i, this.size );
    this.drawLine( 0, i, this.size, i );
  }

  this.context.strokeStyle = '#eee';
  this.context.stroke();
}

FifteenPuzzle.prototype.normalize = function( pixel )
{
  return Math.floor( ( pixel / this.size ) * this.sections );
}

FifteenPuzzle.prototype.clickIdx = function( evt )
{
  var rect = this.canvas.getBoundingClientRect();

  var x = this.normalize( evt.clientX - rect.left );
  var y = this.normalize( evt.clientY - rect.top  );

  return x + ( y * this.sections );
}

FifteenPuzzle.prototype.drawRect = function( position, color )
{
  this.context.fillStyle = color;
  this.context.fillRect( position.x, position.y, this.tileSize(), this.tileSize() );
}

FifteenPuzzle.prototype.drawTile = function( tile_idx )
{
  if ( tile_idx === undefined ) return;

  var tile_loc = this.tileLocation( tile_idx );
  this.drawRect( tile_loc, this.tiles[ tile_idx ].color() );

  var text_offset = this.tileSize() / 2;
  this.context.fillStyle = 'black';
  this.context.fillText( this.tiles[ tile_idx ].value, tile_loc.x + text_offset, tile_loc.y + text_offset );
}

FifteenPuzzle.prototype.drawBlank = function( tile_idx )
{
  this.drawRect( this.tileLocation( tile_idx ), '#777');
}

FifteenPuzzle.prototype.updateCurrent = function ( selected )
{
  if ( this.currentTile() === undefined ) return;

  this.currentTile().selected = selected;
  this.drawTile( this.current_idx );
}

FifteenPuzzle.prototype.mouseMove = function( evt )
{
  if ( this.current_idx !== this.clickIdx( evt ) )
  {
    this.updateCurrent( false );
    this.current_idx = this.clickIdx( evt );
    this.updateCurrent( true );

    this.drawGrid();
  }
}

FifteenPuzzle.prototype.adjacentIdx = function( tile_idx, direction )
{
  if ( direction === 'north' )
  {
    if ( tile_idx < this.sections ) return undefined;
    return tile_idx - this.sections;
  }
  else if ( direction === 'east' )
  {
    if ( tile_idx % this.sections === this.sections - 1 ) return undefined;
    return tile_idx + 1;
  }
  else if ( direction === 'south' )
  {
    if ( tile_idx >= this.sections * ( this.sections - 1 ) ) return undefined;
    return tile_idx + this.sections;
  }
  else if ( direction === 'west' )
  {
    if ( tile_idx % this.sections === 0 ) return undefined;
    return tile_idx - 1;
  }

  return undefined;
}

FifteenPuzzle.prototype.mouseClick = function( evt )
{
  if ( this.currentTile() === undefined ) return;

  var directions = ( function()
  {
    var d = [ 'north', 'east', 'south', 'west' ];

    return function(){ return d; }
  })();

  for ( var i = 0; i < directions().length; ++i )
  {
    var adjacent_idx = this.adjacentIdx( this.current_idx, directions()[i] );
    if ( adjacent_idx === undefined ) continue;

    var possible_move = this.tiles[ adjacent_idx ];
    if ( possible_move === undefined )
    {
      this.tiles[ adjacent_idx ] = this.currentTile();
      this.tiles[ adjacent_idx ].selected = false;
      this.drawTile( adjacent_idx );
      this.tiles[ this.current_idx ] = undefined;
      this.drawBlank( this.current_idx );
      this.drawGrid();

      if ( this.checkWin() )
      {
        var header = document.createElement( 'h1' );
        header.innerHTML = 'You Win!';
        this.canvas.parentNode.appendChild( header );
      }
      return;
    }
  }
}

FifteenPuzzle.prototype.mouseEnter = function( evt )
{
  this.current_idx = this.clickIdx( evt );
  this.updateCurrent( true );
  this.drawGrid();
}

FifteenPuzzle.prototype.mouseLeave = function( evt )
{
  this.updateCurrent( false );
  this.current_idx = undefined;
  this.drawGrid();
}

FifteenPuzzle.prototype.checkWin = function()
{
  for ( var i = 0; i < this.tiles.length - 1; ++i )
  {
    if ( this.tiles[i] === undefined || this.tiles[i].value !== i + 1 )
      return false;
  }

  return true;
}
