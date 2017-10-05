/**
 * FITs listener passes requests to/from FITsService and handles jquery-stuff on a FITs page 
 */

const FITsService = nodeRequire('./src/services/fits.js');
const CardsService = nodeRequire('./src/services/cards.js');

let cards = new CardsService(settings, log);
let fits = new FITsService(settings, log);

$(function () {
  function buildFITsList(){
    fits.get().forEach( (fit) => {
      fit_record = '<a href="#" class="list-group-item"><div class="row">';
      
      fit_record += '<div class="col-xs-1">'
      var scheme = cards.getPaymentScheme(fit.PFIID);
      if(scheme)
        fit_record += '<img id="scheme-logo" class="scheme-logo" src="img/schemes/' + scheme + '.png" title="' + scheme + ' Payment Scheme">';
      fit_record += '</div>';

      fit_record += '<div class="col-xs-1" title="PIDDX (Insitution ID index)">' + fit.PIDDX + '</div>';
      fit_record += '<div class="col-xs-2" title="PFIID (Institution ID)">' + fit.PFIID + '</div>';
      fit_record += '<div class="col-xs-1" title="PSTDX (Indirect Next State Index)">' + fit.PSTDX + '</div>';
      fit_record += '<div class="col-xs-1" title="PAGDX (Algorithm/Bank ID Index)">' + fit.PAGDX + '</div>';
      fit_record += '<div class="col-xs-1" title="PMXPN (Maximum PIN Digits Entered)">' + fit.PMXPN + '</div>';

      fit_record += '</div></a>';

      $("#fits-list").append(fit_record);
    });
  };
  
  buildFITsList();
});