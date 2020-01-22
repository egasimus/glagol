(function () {
  var choices = Object.keys(_.choices)
  var choice = choices[Math.floor(Math.random() * choices.length)];
  console.log(_.choices[choice]);
})
