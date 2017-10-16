$(function(){
  console.log('From settings');
  
  var master_key;
  setInterval(function(){
    if(master_key !== $('#settings-master-key').val()){
      master_key = $('#settings-master-key').val();

      if(master_key.length === 32){
        $('#settings-master-key-cv').val(crypto.getKeyCheckValue(master_key));
        $('#settings-master-key').val(master_key.toUpperCase());
      }
    }
  }, 300);

  var comms_key;
  setInterval(function(){
    if(comms_key !== $('#settings-comms-key').val()){
      comms_key = $('#settings-comms-key').val();

      if(comms_key.length === 32){
        $('#settings-comms-key-cv').val(crypto.getKeyCheckValue(comms_key));
        $('#settings-comms-key').val(comms_key.toUpperCase());
      }
    }
  }, 300);
});