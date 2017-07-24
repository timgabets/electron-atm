// Run this function after the page has loaded
$(function () {
  const electron = nodeRequire('electron')
  const ipc = electron.ipcRenderer

  // var crypto = nodeRequire('crypto') // https://nodejs.org/api/crypto.html
  var log = 'lorem ipsum'
  $('#log-output').text(log)
  
  $('#text-input').bind('input propertychange', function () {
    var text = this.value
  
    // SHA-512
    log = log + '\n' + this.value
    $('#log-output').text(log)
  
    var log_element = document.getElementById("log-output");
    log_element.scrollTop = log_element.scrollHeight;
  })
  
  // Focus input box
  $('#text-input').focus()
  
  $('#buttons-area').on('click', _ => {
    log += '\niddqd';
    $('#log-output').text(log)
  });

  $('#connect').on('click', _ => {
    ipc.send('connect-button-pressed', '127.0.0.1', 11032);
  });
})
