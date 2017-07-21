function Builder(luno) {
  if (luno)
    this.luno = luno;
  else
    this.luno = '000';
}

Builder.prototype.build = function(object){
  var message = '';

  if (!object)
    return message;

  switch(object.message_class){
    case 'Solicited':
      message += 2;

      switch(object.message_subclass){
        case 'Status':
          message += '2\x1C' + this.luno + '\x1C\x1C';
          switch(object.status_descriptor){
            case 'Ready':
              message += '9';
              break;
            case 'Command Reject':
              message += 'A';
              break;
            case 'Specific Command Reject':
              message += 'C';
              break;
            default:
              message += 'A';
          }
          break;
        default:
            break;
                }

    default:
      break;
  }
  return message;
};

module.exports = Builder
