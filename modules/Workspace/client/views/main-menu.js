module.exports = function (state) {
  return h('.Taskbar_MainMenu', module.exports.items.map(renderItem));
}

module.exports.items =
  [ [ '&Open...', open ]
  , [ '&Run...',  run  ]
  ];

function renderItem (item) {
  var label = item[0].split('&').map(function (fragment, i) {
    return (i === 1) ? [ h('strong', fragment[0]), fragment.slice(1) ] : fragment
  })
  return h('.Taskbar_MainMenu_Item', { onclick: item[1] }, label);
}

function open () {}

function run () {}
