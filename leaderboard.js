// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Moves = new Meteor.Collection("moves");
Instruction = new Meteor.Collection("instruction");


if (Meteor.isClient) {
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
      Players.update(Session.get("selected_player"), {$inc: {score: 1}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

Template.move.helpers({
  item: function(){ 
    return Moves.findOne({}, {sort: {date_created: -1}});
    //return Moves.findOne()
  }
});

 Template.moveList.moves = function () {
    return Moves.find({}, {sort: {date_created: -1}, limit: 10});
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

    Instruction.insert({move: 0});

    collectionApi = new CollectionAPI({ authToken: '97f0ad9e24ca5e0408a269748d7fe0a0' });
    collectionApi.addCollection(Instruction, 'instruction');
    collectionApi.start();

  });
  Meteor.setInterval(function(){
    //Update Latest Move
    //Moves.update
    topPlayer = Players.findOne({}, {sort: {score: -1, name: 1}})
    console.log(topPlayer);
    if (topPlayer.name == "Backward"){
      Instruction.update( {}, {move: 1});     
    }
    else if (topPlayer.name == "Forward"){
      Instruction.update( {}, {move: 2});     
    }
    else if (topPlayer.name == "Turn Left"){
      Instruction.update( {}, {move: 3});     
    }
    else if (topPlayer.name == "Turn Right"){
      Instruction.update( {}, {move: 4});     
    }
    topName = topPlayer.name
    topScore = topPlayer.score
    var currentdate = new Date(); 
    Moves.insert({name: topName, score: topScore, date_created: Date.now(), timestamp: currentdate})
    Players.update({},{$set: {score: 0}}, {multi:true});
  }, 10000);
}
