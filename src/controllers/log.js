function Log(){
  this.log = function(data){
    $( _ => {
      $('#log-output').append('\n' + data);
    })
  }
}

module.exports = Log;
