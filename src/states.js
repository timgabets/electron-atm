function States(){
    this.states = {};

    /**
     * [getEntry get the state entry, e.g. state entry 3 is a substring of original state string from position 7 to position10 ]
     * @param  {[type]} data  [state data to parse]
     * @param  {[type]} entry [state entry to get]
     * @return {[type]}       [3-bytes long state entry on success, null otherwise]
     */
    this.getEntry = function(data, entry){
        if(entry > 0 && entry < 2)
            return data.substring(3, 4);
        else if (entry < 10)            
            return data.substring(1 + 3 * (entry - 1), 4 + 3 * (entry - 1));

        return null;
    }

    /**
     * [parseState description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    this.parseState = function(data){
        var parsed = {};
        parsed.number = data.substring(0, 3)
        parsed.type = this.getEntry(data, 1);
        
        switch(parsed.type){
            // Card read state
            case 'A':
                parsed.screen_number = this.getEntry(data, 2);
                parsed.good_read_next_state = this.getEntry(data, 3);
                parsed.error_screen_number = this.getEntry(data, 4);
                parsed.read_condition_1 = this.getEntry(data, 5);
                parsed.read_condition_2 = this.getEntry(data, 6);
                parsed.read_condition_3 = this.getEntry(data, 7);
                parsed.card_return_flag = this.getEntry(data, 8);
                parsed.no_fit_match_next_state = this.getEntry(data, 9);
                break;

            // PIN Entry
            case 'B':
                parsed.screen_number = this.getEntry(data, 2);
                parsed.timeout_next_state = this.getEntry(data, 3);
                parsed.cancel_next_state = this.getEntry(data, 4);
                parsed.local_pin_check_good_next_state = this.getEntry(data, 5);
                parsed.local_pin_check_max_bad_pins_next_state = this.getEntry(data, 6);
                parsed.local_pin_check_error_screen = this.getEntry(data, 7);
                parsed.remote_pin_check_next_screen = this.getEntry(data, 8);
                parsed.local_pin_check_max_retries = this.getEntry(data, 9);
                break;

            // PreSet Operation Code Buffer
            case 'D':
                parsed.next_state = this.getEntry(data, 2);
                parsed.clear_mask = this.getEntry(data, 3);
                parsed.A_preset_mask = this.getEntry(data, 4);
                parsed.B_preset_mask = this.getEntry(data, 5);
                parsed.C_preset_mask = this.getEntry(data, 6);
                parsed.D_preset_mask = this.getEntry(data, 7);

                parsed.extension_state = this.getEntry(data, 9);
                break;

            // Amount entry state
            case 'F':
                parsed.screen_number = this.getEntry(data, 2);
                parsed.timeout_next_state = this.getEntry(data, 3);
                parsed.cancel_next_state = this.getEntry(data, 4);
                parsed.FDK_A_next_state = this.getEntry(data, 5);
                parsed.FDK_B_next_state = this.getEntry(data, 6);
                parsed.FDK_C_next_state = this.getEntry(data, 7);
                parsed.FDK_D_next_state = this.getEntry(data, 8);
                parsed.amount_display_screen = this.getEntry(data, 9);
                break;

            // Amount check state
            case 'G':
                parsed.amount_check_condition_true = this.getEntry(data, 2);
                parsed.amount_check_condition_false = this.getEntry(data, 3);
                parsed.buffer_to_check = this.getEntry(data, 4);
                parsed.integer_multiple_value = this.getEntry(data, 5);
                parsed.decimal_places = this.getEntry(data, 6);
                parsed.currency_type = this.getEntry(data, 7);
                parsed.amount_check_condition = this.getEntry(data, 8);
                break;

            // information Entry State
            case 'H':
                parsed.screen_number = this.getEntry(data, 2);
                parsed.timeout_next_state = this.getEntry(data, 3);
                parsed.cancel_next_state = this.getEntry(data, 4);
                parsed.FDK_A_next_state = this.getEntry(data, 5);
                parsed.FDK_B_next_state = this.getEntry(data, 6);
                parsed.FDK_C_next_state = this.getEntry(data, 7);
                parsed.FDK_D_next_state = this.getEntry(data, 8);
                parsed.buffer_and_display_params = this.getEntry(data, 9);
                break;

            // Transaction request
            case 'I':
                parsed.screen_number = this.getEntry(data, 2);
                parsed.timeout_next_state = this.getEntry(data, 3);
                parsed.send_track2 = this.getEntry(data, 4);
                parsed.send_track1_track3 = this.getEntry(data, 5);
                parsed.send_operation_code = this.getEntry(data, 6);
                parsed.send_amount_data = this.getEntry(data, 7);
                parsed.send_pin_buffer = this.getEntry(data, 8);
                parsed.send_buffer_B_buffer_C = this.getEntry(data, 9);
                break;

            // Close state
            case 'J':
                parsed.receipt_delivered_screen = this.getEntry(data, 2);
                parsed.next_state = this.getEntry(data, 3);
                parsed.no_receipt_delivered_screen = this.getEntry(data, 4);
                parsed.card_retained_screen_number = this.getEntry(data, 5);
                parsed.statement_delivered_screen_number = this.getEntry(data, 6);

                parsed.bna_notes_returned_screen = this.getEntry(data, 8);
                parsed.extension_state = this.getEntry(data, 9);
                break;


            // Smart FIT check state
            case 'k':
                parsed.good_read_next_state = this.getEntry(data, 3);
                parsed.card_return_flag = this.getEntry(data, 8);
                parsed.no_fit_match_next_state = this.getEntry(data, 9);
                break;

            // FIT Switch state
            case 'K':
                parsed.states = [];
                var i = 2;
                while(i < 10){
                    parsed.states.push(this.getEntry(data, i));
                    i++;
                }
                break;

            // FDK switch
            case 'W':
                parsed.states = {};
                ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach( (element, index) => {
                    parsed.states[element] = this.getEntry(data, index + 2)
                });
                break;

            // Extension state
            case 'Z':
                parsed.entries = [];
                for(var i = 2; i < 10; i++)
                    parsed.entries.push(this.getEntry(data, i))
                break;


            // FDK information entry state
            case 'X':
                parsed.screen_number = this.getEntry(data, 2);
                parsed.timeout_next_state = this.getEntry(data, 3);
                parsed.cancel_next_state = this.getEntry(data, 4);
                parsed.FDK_next_state = this.getEntry(data, 5);
                parsed.extension_state = this.getEntry(data, 6);
                parsed.buffer_id = this.getEntry(data, 7);
                parsed.FDK_active_mask = this.getEntry(data, 8);
                break;

            default:
                return null;
        }

        return parsed;
    }
}

/**
 * [getState description]
 * @param  {[type]} state_number [description]
 * @return {[type]}              [description]
 */
States.prototype.getState = function(state_number){
    return this.states[state_number];
};

/**
 * [addState description]
 * @param {[type]} state [description]
 * @return {boolean}     [true if state was successfully added, false otherwise]
 */
States.prototype.addState = function(state){
    var parsed = this.parseState(state);
    if(parsed){
        this.states[parsed.number] = parsed;
        return true;
    }
    else
        return false;
};

/**
 * [addStates description]
 * @param {[type]} states [array of states to add]
 * @return {boolean}     [true if states were successfully added, false otherwise]
 */
States.prototype.addStates = function(states){
    for (var i = 0; i < states.length; i++){
        if(!this.addState(states[i]))
            return false;
    }
    return true;
};

module.exports = States
