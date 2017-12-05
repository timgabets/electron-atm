
class StatesHistory{
  constructor(size){
    this.states = [];
    if(size)
      this.max_size = size;
    else
      this.max_size = 10;
  }

  add(state){
    if(this.states.length >= this.max_size )
      this.states.shift();
    this.states.push(state);
    
    return true;
  }

  get(){
    return this.states;
  }
}

module.exports = StatesHistory;
