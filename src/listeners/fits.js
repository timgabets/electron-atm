/**
 * FITs listener passes requests to/from FITsService and handles jquery-stuff on a FITs page 
 */

const FITsService = nodeRequire('./src/services/fits.js');

let fits = new FITsService(settings, log);

$(function () {
  function buildFITsList(){
    fits.get().forEach( (fit) => {
      fit_record = '<a href="#" class="list-group-item"><div class="row">';
      fit_record += '<div class="col-xs-1"></div>';

      fit_record += '<div class="col-xs-1">' + fit.PIDDX + '</div>';
      fit_record += '<div class="col-xs-2">' + fit.PFIID + '</div>';
      fit_record += '<div class="col-xs-1">' + fit.PSTDX + '</div>';
      fit_record += '<div class="col-xs-1">' + fit.PAGDX + '</div>';
      fit_record += '<div class="col-xs-1">' + fit.PMXPN + '</div>';

      fit_record += '</div></a>';

      $("#fits-list").append(fit_record);
    });
  };
  
  buildFITsList();
});