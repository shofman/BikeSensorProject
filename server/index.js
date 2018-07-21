const express = require('express');
const fs = require('fs');
const app = express();

let onTimer
let offTimer

let runningAverageRpm
let isAboveThreshold
let isShowingTV // TODO - DETERMINE IF THIS WILL BREAK IF THE TV IS OFF WHEN THIS STARTS
let timerDelay

const setDefaults = () => {
  runningAverageRpm = 0
  isAboveThreshold = true
  isShowingTV = true
  timerDelay = 10
  onTimer = undefined
  offTimer = undefined
}

setDefaults()

const calculateMovingAverage = newValue => {
  if (runningAverageRpm === 0) {
    console.log('we are here')
    runningAverageRpm = newValue
    return
  }

  const numberOfValuesToAverage = 5
  let newAverage = runningAverageRpm - (runningAverageRpm / numberOfValuesToAverage)
  newAverage += newValue / numberOfValuesToAverage
  runningAverageRpm = newAverage
}

const turnOffTv = () => {
  isShowingTV = false
}
const turnOnTv = () => {
  isShowingTV = true
}

const hasOffTimer = () => offTimer !== undefined
const cancelOffTimer = () => {
  if (hasOffTimer()) {
    clearTimeout(offTimer)
    offTimer = undefined
  }
}
const startOffTimer = () => {
  offTimer = setTimeout(turnOffTv, timerDelay * 1000)
}

const hasOnTimer = () => onTimer !== undefined
const cancelOnTimer = () => {
  if (hasOnTimer()) {
    clearTimeout(onTimer)
    onTimer = undefined
  }
}
const startOnTimer = () => {
  onTimer = setTimeout(turnOnTv, timerDelay * 1000)
}


app.post('/', function(req, res){
    console.log('POST /')
    console.log('isShowingTV', isShowingTV)

    timerDelay = req.query.delay

    if (req.query.currentRpm >= 0) {
      calculateMovingAverage(req.query.currentRpm)
    }

    isAboveThreshold = runningAverageRpm >= parseInt(req.query.desiredRpm)
    isBelowThreshold = !isAboveThreshold

    if (isShowingTV && isAboveThreshold && hasOffTimer()) {
      // We have risen above the threshold. Cancel the TV off timer
      cancelOffTimer()
    } else if (isShowingTV && isBelowThreshold && !hasOffTimer()) {
      startOffTimer()
    } else if (!isShowingTV && isAboveThreshold && !hasOnTimer()) {
      startOnTimer()
    } else if (!isShowingTV && isBelowThreshold && hasOnTimer()) {
      cancelOnTimer()
    }


    res.status(200);
    res.json({ isShowingTV });
});

app.get('/', function(req, res){
    console.log('GET /')
    const html = 'we are working'
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.post('/clear', function(req, res) {
  console.log('POST /clear')
  setDefaults()
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end('done');
});

const port = 3000;
app.listen(port);
console.log('Listening at http://localhost:' + port)