// DES ECB
var des = require('node-cardcrypto').des;

// Triple DES ECB
var plain = '00000000000000000000000000000000';
 
var deskey1 = '0000000000000000';
var deskey2 = '0000000000000000';
 
var deskey = deskey1 + deskey2;
 
var data = plain;
data = des.ecb_encrypt(deskey1, data);
data = des.ecb_decrypt(deskey2, data);
data = des.ecb_encrypt(deskey1, data);
 
result = des.ecb_encrypt(deskey, plain);
console.log(result)