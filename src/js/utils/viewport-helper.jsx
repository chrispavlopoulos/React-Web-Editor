export function vw(v) {
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (v * w) / 100;
}

export function vh(v) {
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (v * h) / 100;
}

export function vmin(v) {
  return Math.min(vh(v), vw(v));
}

export function vmax(v) {
  return Math.max(vh(v), vw(v));
}

export function getvw(){
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

export function getvh(){
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}
