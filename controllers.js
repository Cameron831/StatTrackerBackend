const axios = require('axios').default;
const playersData = require('./players.json');
var ObjectID = require('mongodb').ObjectID
User = require('./models/user')
Player = require('./models/player')

getCurrentGames = async () => {
  try {
    const response = await axios.get('https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json')
    const responseGames = response.data.scoreboard.games
    //console.log(responseGames)
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
  let gameId = {}
  games.map(game => {
    if(game.homeTeam.teamId == teamId) {
      gameId = {
        gameId: game.gameId,
        homeGame: true,
        period: game.period,
        gameClock: game.gameClock
      }
    } else if(game.awayTeam.teamId == teamId) {
      gameId = {
        gameId: game.gameId,
        homeGame: false,
        period: game.period,
        gameClock: game.gameClock
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
    //console.log("players", players)
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

function formatGameClock(clock) {
  if(clock == '' || clock == null) {
    return "00:00"
  }
    const min = clock.substring(2,4)
    const sec = clock.substring(5, 7)
    return min + ":" + sec
}

function formatDuration(duration) {


  // Match minutes and seconds in the duration string
  const matches = duration.match(/PT(\d+)M(\d+)(?:\.\d+)?S/);
  if (!matches) {
      return null;
  }

  // Extract minutes and seconds from the matches
  const minutes = matches[1];
  const seconds = matches[2].padStart(2, '0'); // Ensure two digits for seconds

  return `${minutes}:${seconds}`;
}

exports.getPlayerBox = async function (req, res) {
    try {
        var stats = {
          "PTS": 0,
          "REB": 0,
          "AST": 0,
          "TPM": 0,
          "BLK": 0,
          "STL": 0,
          "period" : 0,
          "gameClock" : "00:00"
        }
        const playerId = req.params.playerId

        const game = await getGameId(playerId)
        const box = await getGameBoxScore(game)

        if(box != null){
          game.gameClock = formatGameClock(game.gameClock)
          box.map(player => {
            if(player.personId == playerId) {
              stats = {
                "PTS": player.statistics.points,
                "REB": player.statistics.reboundsTotal,
                "AST": player.statistics.assists,
                "TPM": player.statistics.threePointersMade,
                "BLK": player.statistics.blocks,
                "STL": player.statistics.steals,
                "period" : game.period,
                "gameClock" : game.gameClock
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
  var newTracking = new Player(req.body);
  try {
    const savedTracking = await newTracking.save();
    res.status(201).json(savedTracking);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).send({ message: 'Duplicate tracking data: ' + error }); // 409 Conflict
    } else {
      res.status(500).send({ message: 'An error occurred while adding the tracking: ' + error });
    }
  }
};


exports.deleteTracking = async (req, res) => {
  try {
    const userId = req.body.userId
    const playerId = req.body.playerId
    const deletedTracking = await Player.deleteOne({ user: userId, player: playerId})
    res.status(200).json(deletedTracking)
  } catch (error) {
    res.status(500).send({message: 'An error occurred while deleting the tracking: ' + error})
  }
}

exports.updateTracking = async (req, res) => {
  try {
    const filter = {user: req.body.user, player: req.body.player}
    const player = await Player.findOneAndUpdate(filter, req.body, {new:true})
    res.status(200).json(player)
  } catch (error) {
    res.status(500).send({message: 'An error occurred while updating the tracking: ' + error})
  }
}