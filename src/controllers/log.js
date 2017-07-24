function Log(){
  this.log = function(data){
    $( _ => {
      $('#log-output').append('\n' + data);

      var log_element = $("#log-output");
      log_element.scrollTop = log_element.scrollHeight;
    })
  }
}

module.exports = Log;
