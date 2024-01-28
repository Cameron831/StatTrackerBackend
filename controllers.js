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

getCurrentGames = async () => {
  try {
    const response = await axios.get('https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json')
    const responseGames = response.data.scoreboard.games
    let games = []
    responseGames.map(game => {
      games.push(game.gameId)
    })
    return responseGames
  } catch (error) {
    return error
  }
}

getGameId = async (playerId) => {
  const players = playersData.players
  const player = players.find(p => p.PERSON_ID == playerId)
  const teamId = player.TEAM_ID
  const games = await getCurrentGames()
  let gameId = null
  games.map(game => {
    if(game.homeTeam.teamId == teamId) {
      gameId = {
        gameId: game.gameId,
        homeGame: true
      }
    }     
  })
  return gameId
}

getGameBoxScore = async (game) => {
  try {
    const response = await axios.get('https://cdn.nba.com/static/json/liveData/boxscore/boxscore_'+game.gameId+'.json')
    var players = []
    if(game.homeGame) {
      players = response.data.game.homeTeam.players
    } else {
      players = response.data.game.awayTeam.players
    }
    return players
  } catch (error) {
    // Check if the error has a response object
    if (error.response) {
        // Check if the status code is 403
        if (error.response.status === 403) {
            return null;
        } else {
            // Return the other response status codes
            return error.response.status;
        }
    } else {
        // Handle errors that don't have a response (like network errors)
        return "Error: No response received. Error details: " + error;
    }
}
}

exports.getPlayerBox = async function (req, res) {
    try {
        var stats = {}
        const playerId = req.params.playerId

        const game = await getGameId(playerId)
        const box = await getGameBoxScore(game)

        if(box != null){
          box.map(player => {
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
        }
        res.status(200).send(stats);
    } catch (error) {
        console.log(error)
        res.status(500).send({message: 'An error occurred'});
    }
}