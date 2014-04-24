function Tile( value )
{
  this.value = value;

  this.selected_color = '#78a'
  this.unselected_color = '#569';
  this.selected = false;
}

Tile.prototype.color = function()
{
  return this.selected ? this.selected_color : this.unselected_color;
}
