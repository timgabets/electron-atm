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
      fit_record = '<tr>';

      fit_record += '<td>'
      var scheme = cards.getPaymentScheme(fit.PFIID);
      if(scheme)
        fit_record += '<img id="scheme-logo" class="scheme-logo" src="img/schemes/' + scheme + '.png" title="' + scheme + ' Payment Scheme">';
      fit_record += '</td>'
      
      fit_record += '<td title="">' + fit.PIDDX + '</td>';
      fit_record += '<td title="">' + fit.PFIID + '</td>';
      fit_record += '<td title="PSTDX (Indirect Next State Index)">' + fit.PSTDX + '</td>';
      fit_record += '<td title="PAGDX (Algorithm/Bank ID Index)">' + fit.PAGDX + '</td>';
      fit_record += '<td title="PMXPN (Maximum PIN Digits Entered)">' + fit.PMXPN + '</td>';
      fit_record += '<td title="PCKLN (Maximum PIN Digits Checked)">' + fit.PCKLN + '</td>';
      fit_record += '<td title="PINPD (PIN Pad)">' + fit.PINPD + '</td>';
      fit_record += '<td title="PANDX (PAN Data Index)">' + fit.PANDX + '</td>';
      fit_record += '<td title="PANLN (PAN Data Length)">' + fit.PANLN + '</td>';
      fit_record += '<td title="PANPD (PAN Pad)">' + fit.PANPD + '</td>';
      fit_record += '<td title="PRCNT (Track 3 PIN retry count index)">' + fit.PRCNT + '</td>';
      fit_record += '<td title="POFDX (PIN offset ind)">' + fit.POFDX + '</td>';
      fit_record += '<td title="PDCTB (Decimalisation table)">' + fit.PDCTB + '</td>';
      fit_record += '<td title="PEKEY (Encrypted PIN key)">' + fit.PEKEY + '</td>';
      fit_record += '<td title="PINDX (Index reference point)">' + fit.PINDX + '</td>';
      fit_record += '<td title="PLNDX (Language code index)">' + fit.PLNDX + '</td>';
      fit_record += '<td title="PMMSR (CIM86 sensor flag) ">' + fit.PMMSR + '</td>';
      fit_record += '<td title="PBFMT (PIN Block format)">' + fit.PBFMT + '</td>';

      /*
      fit_record = '<a href="#" class="list-group-item"><div class="row">';
      
      fit_record += '<div class="col-xs-1">'
      fit_record += '</div>';

      fit_record += '<div class="col-xs-1" title="PIDDX (Insitution ID index)">' + fit.PIDDX + '</div>';
      fit_record += '<div class="col-xs-2" title="PFIID (Institution ID)">' + fit.PFIID + '</div>';
      fit_record += '<div class="col-xs-1" title="PSTDX (Indirect Next State Index)">' + fit.PSTDX + '</div>';
      fit_record += '<div class="col-xs-1" title="PAGDX (Algorithm/Bank ID Index)">' + fit.PAGDX + '</div>';
      fit_record += '<div class="col-xs-1" title="PMXPN (Maximum PIN Digits Entered)">' + fit.PMXPN + '</div>';

      fit_record += '</div></a>';
      */
      fit_record += '</tr>';
      $("#fits-table").append(fit_record);
    });
  };
  
  buildFITsList();
});