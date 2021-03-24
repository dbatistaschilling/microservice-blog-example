const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

const events = []

app.post('/event-bus-api/send-events', (req, res) => {
  const event = req.body

  events.push(event)

  axios.post('http://posts-api-srv:4000/posts-api/events', event)
  axios.post('http://comments-api-srv:4001/comments-api/events', event)
  axios.post('http://query-api-srv:4002/query-api/events', event)
  axios.post('http://moderation-api-srv:4003/moderation-api/events', event)

  res.send({ status: 'OK' })
})

app.get('/event-bus-api/request-events', (req, res) => {
  res.send(events)
})

app.listen(4005, () => {
  console.log('Listening on 4005');
})