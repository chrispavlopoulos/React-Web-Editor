
export function findTarget(children, x, y){
  var child;
  for (var i = 0; i < children.length; i++) {
    child = children[i];
    if(child.dataset && (child.dataset.edit || child.dataset.dragger) && inRange(child, x, y)){
      return child;
    }else if(child.children){
      child = findTarget(child.children, x, y);
      if(child)
        return child;
      else
        continue;
    }
  }
  return null;
}

function inRange(target, x, y){
  let minX, minY, maxX, maxY;
  //var targetRect = target.getBoundingClientRect();
  minX = target.offsetLeft;
  minY = target.offsetTop;
  maxX = minX + target.offsetWidth;
  maxY = minY + target.offsetHeight;
  let difX, difY;
  difX = x - minX;
  difY = y - minY;
  var inRange = (x > minX && x < maxX)
      && (y > minY && y < maxY);
  return inRange;
}
