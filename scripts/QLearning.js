const ydivision = 10, // round the y distance to the nearest ydivision
    xdivision = 40;

var previous_score = 0,
    previous_collision = -1,
    target_platform = -1,
    base_score = 0,
    states,
    previous_player_height = 0,
    scale_reward_pos = 1/75, // scale down reward because height difference is too high
    scale_death,
    previous_collision2 = -3;

// Model for Q learning class
var Qmodel = function() {
    this.actions = []; // the full set of actions
    this.explored = 0; // how many states have been explored
    this.last_state = [0, 0]; // the last state predicted
    this.learning_rate = 1;
    
    this.predict = function(state) {
        this.last_state = state;
        i = state[0]; // type of platform
        j = state[1]; // ydistance to platform
        k = state[2]; // xdist
        
        if (act = this.actions[i]) {// if this type of platform has been seen
            if (dst = act[j]){ // if this distance has been seen
                if(pred = dst[k])
                    return pred; // prediction
                else{
                    this.actions[i][j][k] = Math.round(Math.random()*100); // random
                    this.explored++;
                    return this.actions[i][j][k];
                }
            }else { // if this is a new distance
                this.actions[i][j] = []; // add it to the array
                this.actions[i][j][k] = Math.round(Math.random()*100); // random 
                this.explored++; // new state discovered
                return this.actions[i][j][k];
            }
        } else { // this type of platform has not been seen
            this.actions[i] = []; // add the platform type
            this.actions[i][j] = [];
            this.actions[i][j][k] = Math.round(Math.random()*100); // add the distance
            this.explored++; // new state discovered
            return this.actions[i][j][k];
        }

    };

    this.reward = function(amount) {
        positive = false;
       
        i = this.last_state[0];
        j = this.last_state[1];
        k = this.last_state[2];
        if(this.actions[i][j][k] > 0)
            positive = true;
        this.actions[i][j][k] += this.learning_rate*amount;
        if(this.actions[i][j][k] == 0 && positive)
            this.actions[i][j][k] -= 1; 
    }; 
};

var brain = new Qmodel();

// Load brain from localstorage
// if(store.has('brain')) {
//   var storedBrain = store.get('brain');
//   brain.actions = storedBrain.actions;
//   brain.explored = storedBrain.explored;
//   console.log('Brain retrivied. States explored:' + brain.explored);
// }

// Give rewards + decide where to next
function decide() {
    // Give reward for curren state
    if (target_platform >= 0 && previous_collision >= 0 ) {
        if (player.isDead) {
        	let scale_death = 1 + score/2000;
            brain.reward(-100/*scale_death*/);
            reset();
        }else{
            if(previous_collision != target_platform){
            	if(states[target_platform][1] < states[previous_collision][1])
                	brain.reward(-20);
                else
                	brain.reward(-10);
            }
            brain.predict(states[previous_collision]);
            r = score-previous_score-20;
            brain.reward(r);
        }
    }

    // predict for  next action
    previous_score = score;
    states = get_states();
    
    maxRewardIdx = 0;
    var maxReward = -999999;
    states.forEach(function(st, index){
        platforms[index].reward = brain.predict(st);
        if(platforms[index].reward > maxReward){
            maxReward = platforms[index].reward;
            maxRewardIdx = index;
        }
    });

    target_platform = maxRewardIdx;


    brain.predict(states[target_platform]);
    platforms.forEach(function(p, index) {
        index==target_platform? p.target= 1 : p.target = 0; 
    });
}

// Returns current state
function get_states() {
    let state = [];
    platforms.forEach(function(p) {
        state.push([p.type,
            Math.round((p.y - player.y) / ydivision) * ydivision,
            Math.abs(Math.round( (p.x - player.x) / xdivision))*xdivision]);
    });
    return state;
}

// Control gamespped
function setGamespeed(val){
  gameSpeed = val;
  document.getElementById("gamespeedVal").value = val;
  document.getElementById("gamespeed").value = val;
}

// Determine the direction to move to get to platform p (left/right)
function direction(n) {
    p = platforms[n];
    //dir = "none";
    try {
        if (p.x + 25< player.x)
            return "left";
        else if (player.x < p.x + 15)
            return "right";
    } catch (e) {}
    
    return "none";
}
