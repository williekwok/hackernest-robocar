// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Moves = new Meteor.Collection("moves");
Instruction = new Meteor.Collection("instruction");


if (Meteor.isClient) {

  Meteor.startup(function () {
        setInterval(function () {
            Meteor.call("getTime", function (error, result) {
                Session.set("time", result);
            });
        }, 1000);
  });

  Template.main.time = function () {
    return Session.get("time");
  };

  Template.progress.time = function () {
    return ((Session.get("time")*10)/20)*100;
  };

  Template.leaderboard.players = function () {
    return Players.find({});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      //Players.update(Session.get("selected_player"), {$inc: {score: 1}});
    }
  });

  Template.player.events({
    
    'click': function () {
      if( /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        //alert("im in here");
      } else{
        Session.set("selected_player", this._id);
        Players.update(Session.get("selected_player"), {$inc: {score: 1}});
      }
    },
    'touchend' : function () {
       Session.set("selected_player", this._id);
      Players.update(Session.get("selected_player"), {$inc: {score: 1}});
    }
  });

Template.move.helpers({
  item: function(){ 
    return Moves.find({}, {sort: {date_created: -1}});
    //return Moves.findOne()
  }
});

Template.moveName.helpers({
  item: function(){ 
    return Moves.findOne({}, {sort: {date_created: -1}});
    //return Moves.findOne()
  }
});

Template.moveScore.helpers({
  item: function(){ 
    return Moves.findOne({}, {sort: {date_created: -1}});
    //return Moves.findOne()
  }
});

Template.moveTime.helpers({
  item: function(){ 
    return Moves.findOne({}, {sort: {date_created: -1}});
    //return Moves.findOne()
  }
});

 Template.moveList.moves = function () {
      if( /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return false
      } else{
        return Moves.find({}, {sort: {date_created: -1}, limit: 10});
      }
  };

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Forward",
                   "Backward",
                   "Turn Left",
                   "Turn Right"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: 0});
    }

    Instruction.insert({tag: "1", move: 0, go: false});

    collectionApi = new CollectionAPI({ authToken: '97f0ad9e24ca5e0408a269748d7fe0a0' });
    collectionApi.addCollection(Instruction, 'instruction');
    collectionApi.start();

  });

  function moveCar(move){
    console.log("Move called");
    HTTP.call("GET", "http://30e0f157.ngrok.com/"+(move+10));
  }

  Meteor.setInterval(function(){
    //Update Latest Move
    //Moves.update

    topPlayer = Players.findOne({}, {sort: {score: -1, name: 1}})
    console.log(topPlayer);
    if (topPlayer.score == 0){
      Instruction.update( {}, {move: 0, go: true});
      Meteor.setTimeout(function(){
          Instruction.update( {}, {move: 0, go: false});     
      }, 250);  
      moveCar(0);
    }
    else if (topPlayer.name == "Backward"){
      Instruction.update( {}, {move: 1, go: true});
      moveCar(1);
      Meteor.setTimeout(function(){
          Instruction.update( {}, {move: 1, go: false});     
      }, 250);         
    }
    else if (topPlayer.name == "Forward"){
      Instruction.update( {}, {move: 2, go: true}); 
      moveCar(2);
      Meteor.setTimeout(function(){
         Instruction.update( {}, {move: 2, go: false});     
      }, 250);    
    }
    else if (topPlayer.name == "Turn Left"){
      Instruction.update( {}, {move: 3, go: true});
      moveCar(3);
      Meteor.setTimeout(function(){
          Instruction.update( {}, {move: 3, go: false});     
      }, 250);     
    }
    else if (topPlayer.name == "Turn Right"){
      Instruction.update( {}, {move: 4, go: true});
      moveCar(4);
      Meteor.setTimeout(function(){
          Instruction.update( {}, {move: 4, go: false});     
      }, 250);    
    }

    topName = topPlayer.name
    if (topPlayer.score == 0){
      topName = "None"
    }
    topScore = topPlayer.score
    var currentdate = new Date(); 
    Moves.insert({name: topName, score: topScore, date_created: Date.now(), timestamp: currentdate})
    Players.update({},{$set: {score: 0}}, {multi:true});
    console.log(Moves.find().count())


    if (Moves.find().count() > 10){
      lastMove = Moves.findOne({}, {sort: {date_created: 1}})
      Moves.remove({date_created: lastMove.date_created})
    }
  }, 3000);

  var clock = 2;
  Meteor.setInterval(function () {
      clock -= 1;
      // end of game
      console.log(clock);
      if (clock === -1) {
        // stop the clock
        clock = 2;
      }

    }, 1000);

   Meteor.methods({
        getTime: function () {
            return clock;
        }
    });
}
