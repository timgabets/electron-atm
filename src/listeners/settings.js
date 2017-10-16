var dialog = nodeRequire('electron').remote.dialog

$(function(){
  var host = settings.get('host');

  if(host){
    $('#settings-atm-host').val(host.ip);
    $('#settings-atm-port').val(host.port);
    $('#settings-luno').val(host.luno);
  }

  var master_key = settings.get('master_key');
  if(master_key){
    $('#settings-master-key').val(master_key);
    $('#settings-master-key-cv').val(crypto.getKeyCheckValue(master_key));
  }

  setInterval(function(){
    if(master_key !== $('#settings-master-key').val()){
      master_key = $('#settings-master-key').val();

      if(master_key.length === 32){
        $('#settings-master-key-cv').val(crypto.getKeyCheckValue(master_key));
        $('#settings-master-key').val(master_key.toUpperCase());
      } else {
        $('#settings-master-key-cv').val('');
      }
    }
  }, 300);

  var comms_key = settings.get('pin_key');
  //var comms_key = settings.get('comms_key');
  if(comms_key){
    $('#settings-comms-key').val(comms_key);
    $('#settings-comms-key-cv').val(crypto.getKeyCheckValue(comms_key));
  }

  setInterval(function(){
    if(comms_key !== $('#settings-comms-key').val()){
      comms_key = $('#settings-comms-key').val();

      if(comms_key.length === 32){
        $('#settings-comms-key-cv').val(crypto.getKeyCheckValue(comms_key));
        $('#settings-comms-key').val(comms_key.toUpperCase());
      } else {
        $('#settings-comms-key-cv').val('');
      }
    }
  }, 300);

  // Image path
  image_path = settings.get('image_path');
  $('#images-path').val(image_path);

  $('#open-file-manager').on('click', function(e){
    e.preventDefault();
    var selected_image_path = dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if(selected_image_path){
      $('#images-path').val(selected_image_path[0]);
      $('#images-path').val(selected_image_path);
      settings.set('image_path', selected_image_path);
    }
  })

  // Form validation
  setInterval(function(){
    if($('#settings-form').valid() )
      $('#settings-submit-button').attr('disabled', false)
    else
      $('#settings-submit-button').attr('disabled', true)

  }, 300);

  $('#settings-form').submit(function(e) {
    e.preventDefault();

    // Saving host settings
    var host = {
      ip: $('#settings-atm-host').val(),
      port: $('#settings-atm-port').val(),
      luno: $('#settings-luno').val()
    };
    settings.set('host', host);

    // Saving keys
    settings.set('master_key', $('#settings-master-key').val());
    settings.set('pin_key', $('#settings-comms-key').val());

    // TODO: handle it properly (move to window.js maybe)
    $('#settings-page').hide();
    $('#navbar').show();
    $('#atm-button-menu').click();
    ipc.send('settings-entered-network-connect', host);
  });
});