describe("States", function() {
  var States = require('../../src/states.js');
  var s;

  beforeEach(function() {
    s = new States();
  });

  describe("getEntry()", function(){
      it("should get entry 1", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 1)).toEqual('A');
      });

      it("should get entry 2", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 2)).toEqual('BCD');
      }) ;
      it("should get entry 3", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 3)).toEqual('EFG');
      });

      it("should get entry 4", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 4)).toEqual('HIJ');
      });

      it("should get entry 5", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 5)).toEqual('KLM');
      });

      it("should get entry 6", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 6)).toEqual('NOP');
      });

      it("should get entry 7", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 7)).toEqual('QRS');
      });

      it("should get entry 8", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 8)).toEqual('TUV');
      });

      it("should get entry 9", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 9)).toEqual('WXY');
      });

      it("should get entry 10", function() {
        expect(s.getEntry('000ABCDEFGHIJKLMNOPQRSTUVWXY', 10)).toEqual(null);
      });
  });  

  describe("parseState()", function(){
      it("should parse state A properly", function() {
        var parsed = { 
          number: '000', 
          type: 'A', 
          screen_number: '870', 
          good_read_next_state: '500', 
          error_screen_number: '128', 
          read_condition_1: '002', 
          read_condition_2: '002', 
          read_condition_3: '002', 
          card_return_flag: '001', 
          no_fit_match_next_state: '127' 
        };
        expect(s.parseState('000A870500128002002002001127')).toEqual(parsed);
      });

      it("should parse state B properly", function() {
        var parsed = { 
          number: '024', 
          type: 'B', 
          screen_number: '024', 
          timeout_next_state: '002', 
          cancel_next_state: '131', 
          local_pin_check_good_next_state: '026', 
          local_pin_check_max_bad_pins_next_state: '026', 
          local_pin_check_error_screen: '138', 
          remote_pin_check_next_screen: '026', 
          local_pin_check_max_retries: '003' 
        };
        expect(s.parseState('024B024002131026026138026003')).toEqual(parsed);
      });

      it("should parse state D properly", function() {
        var parsed ={ 
          number: '003', 
          type: 'D', 
          next_state: '024', 
          clear_mask: '000', 
          A_preset_mask: '128', 
          B_preset_mask: '000', 
          C_preset_mask: '000', 
          D_preset_mask: '000', 
          extension_state: '000' 
        };
        expect(s.parseState('003D024000128000000000000000')).toEqual(parsed);
      });

      it("should parse state F properly", function() {
        var parsed = { 
          number: '219', 
          type: 'F', 
          screen_number: '069', 
          timeout_next_state: '002', 
          cancel_next_state: '131', 
          FDK_A_next_state: '220', 
          FDK_B_next_state: '255', 
          FDK_C_next_state: '220', 
          FDK_D_next_state: '219', 
          amount_display_screen: '006' 
        };
        expect(s.parseState('219F069002131220255220219006')).toEqual(parsed);        
      });

      it("should parse state G properly", function() {
        var parsed = { 
          number: '073', 
          type: 'G', 
          amount_check_condition_true: '074', 
          amount_check_condition_false: '07T', 
          buffer_to_check: 'YUG', 
          integer_multiple_value: 'HJV', 
          decimal_places: 'BN3', 
          currency_type: 'QWE', 
          amount_check_condition: 'ASD' 
        };
        expect(s.parseState('073G07407TYUGHJVBN3QWEASDZXC')).toEqual(parsed);        
      });

      it("should parse state H properly", function() {
        var parsed = { 
          number: '089', 
          type: 'H', 
          screen_number: '564', 
          timeout_next_state: '002', 
          cancel_next_state: '131', 
          FDK_A_next_state: '090', 
          FDK_B_next_state: '255', 
          FDK_C_next_state: '090', 
          FDK_D_next_state: '089', 
          buffer_and_display_params: '003' 
        };
        expect(s.parseState('089H564002131090255090089003')).toEqual(parsed);        
      });

      it("should parse state I properly", function() {
        var parsed = {
          number: '027', 
          type: 'I', 
          screen_number: '025', 
          timeout_next_state: '146', 
          send_track2: '001', 
          send_track1_track3: '000', 
          send_operation_code: '001', 
          send_amount_data: '001', 
          send_pin_buffer: '001', 
          send_buffer_B_buffer_C: '003' 
        };
        expect(s.parseState('027I025146001000001001001003')).toEqual(parsed);        
      });

      it("should parse state J properly", function() {
        var parsed = { 
          number: '002', 
          type: 'J', 
          receipt_delivered_screen: '132', 
          next_state: '000', 
          no_receipt_delivered_screen: '132', 
          card_retained_screen_number: '136', 
          statement_delivered_screen_number: '132', 
          bna_notes_returned_screen: '081', 
          extension_state: '178' 
        };
        expect(s.parseState('002J132000132136132000081178')).toEqual(parsed);        
      });

      it("should parse state k properly", function() {
        var parsed = { 
          number: '515', 
          type: 'k', 
          good_read_next_state: '001', 
          card_return_flag: '001', 
          no_fit_match_next_state: '127' 
        };
        expect(s.parseState('515k000001000000000000001127')).toEqual(parsed);        
      });

      it("should parse state K properly", function() {
        var parsed = { 
          number: '001', 
          type: 'K', 
          states: [ '003', '004', '004', '127', '127', '127', '127', '127' ] 
        };
        expect(s.parseState('001K003004004127127127127127')).toEqual(parsed);        
      });

      it("should parse state W properly", function() {
        var parsed = { 
          number: '035', 
          type: 'W', 
          states: { 
            A: '181', 
            B: '037', 
            C: '255', 
            D: '127', 
            E: '031', 
            F: '034', 
            G: '250', 
            H: '186' 
          },
        }
        expect(s.parseState('035W181037255127031034250186')).toEqual(parsed);        
      });

      it("should parse state X properly", function() {
        var parsed = { 
          number: '037', 
          type: 'X', 
          screen_number: '037', 
          timeout_next_state: '002', 
          cancel_next_state: '131', 
          FDK_next_state: '038', 
          extension_state: '039', 
          buffer_id: '010', 
          FDK_active_mask: '255' 
        };
        expect(s.parseState('037X037002131038039010255000')).toEqual(parsed);        
      });

      it("should parse state Z properly", function() {
        var parsed = { 
          number: '037', 
          type: 'Z', 
          entries: [ '123', '456', '789', '0AB', 'CDE', 'FGH', 'IJK', 'LMN' ] 
        };
        expect(s.parseState('037Z1234567890ABCDEFGHIJKLMN')).toEqual(parsed);        
      });

      it("should parse state > properly", function() {
        var parsed = { 
          number: '037', 
          type: '>', 
          cancel_key_mask: '701', 
          deposit_key_mask: '928', 
          add_more_key_mask: '362', 
          refund_key_mask: '810', 
          extension_state_1: '280', 
          extension_state_2: '293', 
          extension_state_3: '751' 
        };
        expect(s.parseState('037>701928362810280293751745')).toEqual(parsed);        
      });

      it("should throw error if state data is invalid", function() {
        expect(s.parseState('000"8')).toEqual(null);
      });
  });

  describe("addState()", function(){
      it("should return false while passing empty data", function() {
        expect(s.addState('')).toEqual(false);
      });

      it("should add valid state", function() {
        var parsed = { 
          number: '000', 
          type: 'A', 
          screen_number: '870', 
          good_read_next_state: '500', 
          error_screen_number: '128', 
          read_condition_1: '002', 
          read_condition_2: '002', 
          read_condition_3: '002', 
          card_return_flag: '001', 
          no_fit_match_next_state: '127' 
        };

        expect(s.addState('000A870500128002002002001127')).toEqual(true);
        expect(s.getState('000')).toEqual(parsed);

      });
  });

  describe("addStates()", function(){
      it("should add states", function() {
        var states = ['000A870500128002002002001127', '001K003004004127127127127127', '002J132000132136132000081178', '003D024000128000000000000000', '004D024000000128000000000000'];
        expect(s.addStates(states)).toEqual(true);
      });
  });
});
