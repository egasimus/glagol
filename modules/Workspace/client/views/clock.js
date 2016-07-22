module.exports = function () {
 var now  = new Date()
   , date = now.getFullYear() + '-' + now.getMonth()   + '-' + now.getDate()
   , time = now.getHours()    + ':' + now.getMinutes() + ':' + now.getSeconds();
 return h('button.Taskbar_Clock', [ date, h('br'), time ])
}
