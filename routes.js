const express = require('express')
const router = express.Router()
var controller = require('./controllers.js');
  
router.route("/player/box-score/:playerId")
.get(controller.getPlayerBox)

router.route("/player/season-average/:playerId")
.get(controller.getPlayerSeasonAvg)

router.route("/user")
.post(controller.addUser)

router.route("/user/:_id")
.get(controller.getUser)

router.route("/user/login")
.post(controller.verifyLogin)

router.route("/user/tracking/:_id")
.get(controller.getUserTracking)

router.route("/user/tracking")
.post(controller.addTracking)
.delete(controller.deleteTracking)
.put(controller.updateTracking)

router.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
});


module.exports = router