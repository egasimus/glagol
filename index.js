function checksum (layout) {
  var csum = 0;
  layout.split('').map(function (a) {
    csum = (csum >> 1) + ((csum & 1) << 15);
    csum += a.charCodeAt(0);
  });
  return csum.toString(16);
}

function splitChildren (children) {
  var re1 = /(\d+x\d+),(\d),(\d)(,\d+|{[\dx,\[\]\{\}]+})?/
    , re2 = /,?(.+?,.+?,.+?,[\d\{}]+)/g
    , ch  = []
    , c   = null;
  while ((c = re2.exec(children)) !== null) {
    ch.push(c[1]);
  }
  return ch;
}

function parse (layout) {
  var re   = /(\d+x\d+),(\d+),(\d+)(,\d+|{[\dx,\[\]\{\}]+})/
    , l    = re.exec(layout)
    , node = {
        width:    Number(l[1].split('x')[0]),
        height:   Number(l[1].split('x')[1]),
        offset:   Number(l[2]),
        wtf:      Number(l[3]),
        split:    null,
        children: [],
        window:   null
      };

  if (isNaN(Number(l[4]))) {
    if (l[4][0] === "{") {
      node.split = "vertical";
    } else if (l[4][0] === "[") {
      node.split = "horizontal";
    }
    node.children = splitChildren(l[4].slice(1,-1)).map(parse);
  } else {
    node.window = l[4];
  }

  return node;
}

function shrinkX (layout, amount, offset) {
  return {
    width:    layout.width - amount,
    height:   layout.height,
    offset:   layout.offset - (offset || 0),
    wtf:      layout.wtf,
    split:    layout.split,
    children: layout.children.map(shrinkChild),
    window:   layout.window
  };

  function shrinkChild (c, i) {
    var amt = Math.floor(amount / layout.children.length);
    return shrinkX(c, amt, amt * i)
  }
}

layout = "227x62,0,0{113x62,0,0,13,113x62,114,0,14}";

console.log(shrinkX(parse(layout), 10));
