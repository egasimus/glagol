(function (frame, data) {

  console.log("UPDATE", frame, data)

  frame.put('root', data);

  console.log(frame.root());

})
