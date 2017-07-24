function Log(){
  this.log = function(data){
    $( _ => {
      $('#log-output').append(data);

      var log_element = $("#log-output");
      log_element.scrollTop = log_element.scrollHeight;
    })
  }
}

module.exports = Log;
