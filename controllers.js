const axios = require('axios').default;
const playersData = require('./players.json');
var ObjectID = require('mongodb').ObjectID
User = require('./models/user')
Player = require('./models/player')

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

exports.getPlayerSeasonAvg = async (req, res) => {
  try {
    const playerId = req.params.playerId
    stats = {}
  
    const players = playersData.players
    const player = players.find(p => p.PERSON_ID == playerId);
  
    if(player) {
      stats = {
        "PTS": player.PTS,
        "REB": player.REB,
        "AST": player.AST,
      }
    }
    
    res.status(200).send(stats);
  } catch (error) {
    res.status(500).send({message: 'An error occurred'});
  }
}

exports.addUser = async (req, res) => {
  var newUser = new User(req.body)
  try {
    const savedUser = await newUser.save()
    res.status(201).json(savedUser)
  } catch (error) {
    res.status(500).send({message: 'An error occurred while adding the user: ' + error})
  }
}

exports.getUserTracking = async (req, res) => {
  try {
    const userId = req.params._id
    const players = await Player.find({ user: userId })
    res.json(players)
  } catch (error) {
    res.status(500).send({message: 'An error occurred while getting the user: ' + error})
  }
}

exports.addTracking = async (req, res) => {
  var newTracking = new Player(req.body)
  try {
    const savedTracking = await newTracking.save()
    res.status(201).json(savedTracking)
  } catch (error) {
    res.status(500).send({message: 'An error occurred while adding the tracking: ' + error})
  }
}

exports.deleteTracking = async (req, res) => {
  try {
    const userId = req.body.userId
    const playerId = req.body.playerId
    const deletedTracking = await Player.deleteMany({ user: userId, playerId: playerId})
    res.status(200).json(deletedTracking)
  } catch (error) {
    res.status(500).send({message: 'An error occurred while deleting the tracking: ' + error})
  }
}

exports.updateTracking = async (req, res) => {

}