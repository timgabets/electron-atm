/**
 * FITs listener passes requests to/from FITsService and handles jquery-stuff on a FITs page 
 */

const FITsService = nodeRequire('./src/services/fits.js');

let fits = new FITsService(settings, log);

$(function () {
  function buildFITsList(){
    fits.get().forEach( (fit) => {
      
    });
  };
  
  buildFITsList();
});