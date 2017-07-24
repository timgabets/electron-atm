// Run this function after the page has loaded
$(function () {
  // var crypto = nodeRequire('crypto') // https://nodejs.org/api/crypto.html
  var log = 'lorem ipsum'
  $('#sha512-output').text(log)
  
  $('#text-input').bind('input propertychange', function () {
    var text = this.value
  
    // SHA-512
    log = log + '\n' + this.value
    $('#sha512-output').text(log)
  
    var log_element = document.getElementById("sha512-output");
    log_element.scrollTop = log_element.scrollHeight
  })
  
  // Focus input box
  $('#text-input').focus()
  
  $('#buttons-area').on('click', _ => {
    $('#sha512-output').text('iddqd')
  });
})
