const axios = require('axios').default;
const playersData = require('./players.json');

/*
exports.addComment = async function(req, res) {
    var newComment = new Comment(req.body);
    try {
      const savedComment = await newComment.save();
      res.status(201).json(savedComment);
    } catch (err) {
      console.log(err)
      res.status(500).send({message: 'An error occurred while adding the comment.'});
    }
};
*/

exports.test = async function (req, res) {
    try {
        const players = playersData.players
        const player = players.find(p => p.PLAYER_LAST_NAME.toLowerCase() === 'doncic');
        if (player) {
            console.log('Player found:', player);
        } else {
            console.log('Player not found');
        }
        res.status(200).send({ message: 'Success' });
      } catch (err) {
        console.log(err)
        res.status(500).send({message: 'An error occurred'});
      }
}

exports.getPlayerBox = async function (req, res) {
    try {
        const response = await axios.get('https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022000181.json');
        const players = [...response.data.game.homeTeam.players, ...response.data.game.awayTeam.players]
        const playerId = req.params.playerId

        var stats = {}
        
        players.map(player => {
          if(player.personId == playerId) {
            stats = {
              "PTS": player.statistics.points,
              "REB": player.statistics.reboundsTotal,
              "AST": player.statistics.assists,
              "3PM": player.statistics.threePointersMade,
              "BLK": player.statistics.blocks,
              "STL": player.statistics.steals
            }
          }
        })
        res.status(200).send(stats);
    } catch (error) {
        console.log(error)
        res.status(500).send({message: 'An error occurred'});
    }
}