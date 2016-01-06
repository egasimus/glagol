var g = require('.')

d1 = g.Directory('d1')
d2 = d1.nodes['d2'] = g.Directory('d2')
d3 = d2.nodes['d3'] = g.Directory('d3')

console.log(d1.tree())
console.log(d1.tree().$)
console.log(d1.tree().__)

console.log(d2.tree())
console.log(d2.tree().$)
console.log(d2.tree().__)

console.log(d3.tree())
console.log(d3.tree().$)
console.log(d3.tree().__)
