// NodeJS net module
const net = require('net');
// trace routines
const Trace = require('./trace');
// IPC 
const ipc = electron.ipcRenderer;

function Network() {
    /**
     * [getOutgoingMessageLength get the Message Header Length]
     * @param  {[type]} data [binary data]
     * @return {[type]}      [two-bytes length, e.g. '\x00\x0a' for 10-byte data]
     */
    this.getOutgoingMessageLength = function (data){
      return String.fromCharCode(data.length / 256) + String.fromCharCode(data.length % 256);
    };

    /**
     * [send description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    this.send = function (data){
      var binary_data = Buffer(this.getOutgoingMessageLength(data) + data, 'binary');
      this.client.write(binary_data);
      this.trace.trace(binary_data, '>> ' + binary_data.length + ' bytes sent:');
    };

    this.trace = new Trace();
    this.client = new net.Socket();

    this.client.on('data', function(data) {
      this.trace.trace(data, '<< ' + data.length + ' bytes received:');
      //ipc.send('host-message-received', data);
    });
}

/**
 * [connect description]
 * @param  {[type]} host [description]
 * @param  {[type]} port [description]
 * @return {[type]}      [description]
 */
Network.prototype.connect = function(host, port){
  this.client.connect(port, host, function() {
    console.log('Connected to ' + host + ':' + port);
  });
};

/**
 * [send description]
 * @param  {[type]} message [description]
 * @return {[type]}      [description]
 */
Network.prototype.send = function(message){
  this.send(message);
};

/**
 * [disconnect description]
 * @return {[type]} [description]
 */
Network.prototype.disconnect = function(){
  this.client.destroy();
  this.client.on('close', function() {
    console.log('Connection closed');
  });
};

module.exports = Network
