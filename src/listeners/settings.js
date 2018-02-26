var dialog = nodeRequire('electron').remote.dialog

$(function(){
  var host = settings.get('host');

  if(host){
    $('#settings-atm-host').val(host.ip);
    $('#settings-atm-port').val(host.port);
    $('#settings-luno').val(host.luno);
    $('#settings-header').val(host.header);
  }

  let keys = {};
  ['master', 'pin'].forEach( (type) => {
    keys[type] = settings.get(type + '_key');
    if(keys[type]){
      $('#settings-' + type + '-key').val(keys[type]);
      $('#settings-' + type + '-key-cv').val(crypto.getKeyCheckValue(keys[type]));
    }

    setInterval(function(){
     if(keys[type] !== $('#settings-' + type + '-key').val()){
       keys[type] = $('#settings-' + type + '-key').val();

       keys[type] = keys[type].replace(/[^a-fA-F0-9]/g,'');
       $('#settings-' + type + '-key').val(keys[type].toUpperCase());

       if(keys[type].length === 32){
         $('#settings-' + type + '-key-cv').val(crypto.getKeyCheckValue(keys[type]));
       } else {
         $('#settings-' + type + '-key-cv').val('');
       }
     }
   }, 300);
  });

  $('#profile-name').val(settings.get('profile'))

  // Image path
  function setImagePath(){
    var selected_image_path = dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if(selected_image_path){
      $('#images-path').val(selected_image_path[0]);
      $('#images-path').val(selected_image_path);
      settings.set('image_path', selected_image_path);
    }
  }

  image_path = settings.get('image_path');
  $('#images-path').val(image_path);

  $('#open-file-manager').on('click', function(e){
    e.preventDefault();
    setImagePath();
  });

  $('#images-path').on('click', function(){
    setImagePath();
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
      luno: $('#settings-luno').val(),
      header: $('#settings-header').val()
    };
    settings.set('host', host);

    // Saving keys
    ['master', 'pin'].forEach( (type) => {
      settings.set(type + '_key', $('#settings-' + type + '-key').val());
    });

    // Saving profile name
    settings.set('profile', $('#profile-name').val());
    
    // TODO: handle it properly (move to window.js maybe)
    $('#settings-page').hide();
    $('#navbar').show();
    $('#atm-button-menu').click();
    ipc.send('settings-entered-network-connect', host);
  });
});
