'use strict';

function dump(data){
	var dump = '';
	var hex_line = '';
	var ascii_line = '';
	var padding  = '        ';

	for (var i in data) {
		var charcode = data.charCodeAt(i);
		(charcode >= 16) ? (hex_line += charcode.toString(16) + ' ') : (hex_line += '0' + charcode.toString(16) + ' ');
		(charcode >= 32 && charcode <= 126) ? (ascii_line += data[i]) : (ascii_line += '.');

		if(i % 16 === 15){	
			dump = dump + '\t' + hex_line + padding + ascii_line + '\n';
			hex_line = '';
			ascii_line = '';
		}
	};

	if (hex_line){
		for (i = 0; i < (16 - ascii_line.length); i++)
			padding += '   ';
		dump = dump + '\t' + hex_line + padding + ascii_line;
	}

	return dump;
};


function getTimestamp(){
	var t = new Date();
	var timestamp = '';

	(t.getHours() > 9) ? (timestamp += t.getHours() + ':') : (timestamp += '0' + t.getHours() + ':');
	(t.getMinutes() > 9) ? (timestamp += t.getMinutes() + ':') : (timestamp += '0' + t.getMinutes() + ':');
	(t.getSeconds() > 9) ? (timestamp += t.getSeconds() + '.') : (timestamp += '0' + t.getSeconds() + '.');

	if(t.getMilliseconds() > 99)
		timestamp += t.getMilliseconds();
	else if(t.getMilliseconds() > 9)
		timestamp += '0' + t.getMilliseconds();
	else
		timestamp += '00' + t.getMilliseconds();

	return timestamp;
}

exports.trace = function trace(data, title){
	if (title)
		console.log(getTimestamp() + ' ' + title + '\n' + dump(data.toString('binary')));
	else
		console.log(getTimestamp() + '\n' + dump(data.toString('binary')));
};
