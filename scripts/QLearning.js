
var Q_model = function() {
    this.actions = []; // the full set of actions
    this.explored = 0; // how many states have been explored
    this.last_state = [0, 0]; // the last state predicted
    this.learning_rate = 1;
    this.random = 1;

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

}

var brain = new Q_model();

//autoload brain from localstorage
// if(store.has('brain')) {
//   var storedBrain = store.get('brain');
//   brain.actions = storedBrain.actions;
//   brain.explored = storedBrain.explored;
//   //brain.last_state = storedBrain.last_state;
//   console.log('Brain has been loaded');
//   console.log('States explored:' + brain.explored);
// }

const ydivision = 10, // round the y distance to the nearest ydivision
    xdivision = 10;
var previous_score = 0;
var previous_collision = -1; // how does this happen sometimes // the genie did it se c LLEOMLME L OLA DLOL OLOLOLOL

var target_platform = -2;
var base_score = 0;

function get_states() {
    state = [];
    platforms.forEach(function(p) {
        var pp = (1 * (p.state || (p.type == 3)) + 2 * (p.type == 2));
        state.push([pp,
                    Math.round((p.y - player.y) / ydivision) * ydivision,
                    Math.abs(Math.round( (p.x - player.x) / xdivision))*xdivision]);
    });
    return state;
}

// Control gamespped
function setGamespeed(val){
  gamespeed = val;
  document.getElementById("gamespeedVal").value = val;
  document.getElementById("gamespeed").value = val;
}

var states;
var previous_player_height = 0;
var scale_reward_pos = 1/75; // scale down reward because height difference is too high
var scale_death;
var previous_collision2 = -3;

function decide() {
    // Give reward for curren state
    if (target_platform >= 0 && previous_collision >= 0 ) {
        if (player.isDead) {
        	let scale_death = 1 + score/2000;
            brain.reward(-100*scale_death);
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

    // predict next action
    previous_score = score;
    states = get_states();
    predictions = [];
    maxRewardIdx = 0;
    for (st = 0; st < states.length; st++) {
            predictions[st] = brain.predict(states[st]);
            platforms[st].reward = predictions[st];
            if(predictions[st] > predictions[maxRewardIdx])
            	maxRewardIdx = st;
            
    }
    target_platform = maxRewardIdx;

    brain.predict(states[target_platform]);
    platforms.forEach(function(p, index) { p.target = 0; });
    platforms[target_platform].target = 1;

    
    previous_player_height = player.height;
    previous_collision2 = previous_collision;	
}

// Determine the direction to move to get to platform p (left/right)
function direction(n) {
    p = platforms[n];
    dir = "none";
    try {
        if (p.x + 25< player.x)
            dir = "left";
        else if (player.x < p.x + 15)
            dir = "right";
    } catch (e) {}

    return dir;
}
