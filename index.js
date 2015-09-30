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
        window:   Number(l[4].slice(1)) || null,
        split:    null,
        children: []
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

function addLeftPane (layout, width) {
  return {
    width:    layout.width,
    height:   layout.height,
    offset:   layout.offset,
    wtf:      layout.wtf,
    split:    "vertical",
    children: [ { width:    width
                , height:   layout.height
                , offset:   0
                , wtf:      0
                , split:    "vertical"
                , children: []
                , window:   0 }
              , shrinkX(layout, width, -(width + 1)) ],
    window:   null
  }
  return shrinkX (layout, width);
}

function write (layout) {
  var output = layout.width + "x" + layout.height
          + "," + layout.offset + "," + layout.wtf;

  if (layout.children.length > 0) {
    if (layout.split === "vertical") {
      return output + "{" + layout.children.map(write).join(",") + "}";
    } else if (layout.split === "horizontal") {
      return output + "[" + layout.children.map(write).join(",") + "]";
    } else err("invalid layout split: " + layout.split + " in ");
  } else if (layout.window !== null) {
    return output + "," + layout.window
  } else {
    err("invalid layout tree: ");
  }

  function err (txt) {
    throw new Error(txt + JSON.stringify(layout))
  }
}

inputLayout  = "227x62,0,0{113x62,0,0,13,113x62,114,0,14}";
outputLayout = write(addLeftPane(parse(inputLayout), 30))

console.log(checksum(outputLayout) + "," + outputLayout);
