const express = require('express')
const { randomBytes } = require('crypto')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {}

const handleEvent = async (type, data) => {
  if (type === 'CommentModerated') {
    const { id, postId, content, status } = data
    if (commentsByPostId[postId]) {
      const comment = commentsByPostId[postId].find(comment => comment.id === id)
      comment.status = status
      await axios.post('http://event-bus-api-srv:4005/event-bus-api/send-events', {
        type: 'CommentUpdated',
        data: {
          id, postId, content, status
        }
      })
    }
  }
}

app.get('/posts/:id/comments', (req, res) => {
  res.status(200).send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments/create', async (req, res) => {
  const commentId = randomBytes(4).toString('hex')
  const { content } = req.body
  if (commentsByPostId[req.params.id]) {
    commentsByPostId[req.params.id].push({ id: commentId, content, status: 'pending' })
  } else {
    const comments = []
    comments.push({ id: commentId, content, status: 'pending' })
    commentsByPostId[req.params.id] = comments
  }
  await axios.post('http://event-bus-api-srv:4005/event-bus-api/send-events', {
    type: 'CommentCreated',
    data: {
      id: commentId, content, postId: req.params.id, status: 'pending'
    }
  })
  res.status(201).send(commentsByPostId[req.params.id][commentId])
})

app.post('/comments-api/events', (req, res) => {
  const { type, data } = req.body
  handleEvent(type, data)
  res.send({})
})

app.listen(4001, async () => {
  console.log('Listening on 4001')
  const response = await axios.get('http://event-bus-api-srv:4005/event-bus-api/request-events')
  if (response) {
    for (let event of response.data) {
      console.log('Processing event: ', event.type);
      handleEvent(event.type, event.data)
    }
  }
})