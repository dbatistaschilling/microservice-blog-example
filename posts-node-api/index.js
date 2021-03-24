const express = require('express')
const { randomBytes } = require('crypto')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const posts = {}

app.get('/posts', (req, res) => {
  res.status(200).send(posts)
})

app.post('/posts/create', async (req, res) => {
  try {
    const id = randomBytes(4).toString('hex')
    const { title } = req.body
    posts[id] = {
      id, title
    }
    await axios.post('http://event-bus-api-srv:4005/event-bus-api/send-events', {
      type: 'PostCreated',
      data: {
        id, title
      }
    })
    res.status(201).send(posts[id])
  } catch (error) {
    res.status(500).send(error)
  }
})

app.post('/posts-api/events', (req, res) => {
  console.log('Received event: ', req.body.type)
  res.send({})
})

app.listen(4000, () => {
  console.log('Listening on 4000')
})