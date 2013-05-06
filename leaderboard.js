// ewall's customized leaderboard.js

// Done: make button to toggle sort method
// Done: make button to randomize the scores
// ToDo: add a way to add/remove scientists
// ToDo: try out Collection.Allow/Deny rules?

// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {

  Session.set("sort_toggle", 0);

  Template.leaderboard.players = function () {
    var sorting = (Session.equals("sort_toggle", 1)) ? {score: -1, name: 1} : {name: 1, score: -1};
    return Players.find({}, {sort: sorting});
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
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input.toggle': function () {
      Session.set("sort_toggle", (Session.equals("sort_toggle", 1)) ? 0 : 1 );
    },
    'click input.rescore': function () {
      Players.find().forEach( function (player) {
        Players.update( { _id: player['_id'] }, {$set: {score: Math.floor(Random.fraction()*10)*5}});
      })
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}