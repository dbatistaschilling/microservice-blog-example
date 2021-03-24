const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const posts = {}

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data
    posts[data.id] = {
      id, title, comments: []
    }
  } else if (type === 'CommentCreated') {
    const { postId, id, content, status } = data
    posts[postId].comments.push({ id, content, status })
  } else if (type === 'CommentUpdated') {
    const { postId, id, content, status } = data
    const comment = posts[postId].comments.find(comment => comment.id === id)
    comment.content = content
    comment.status = status
  }
}

app.get('/posts/query', (req, res) => {
  res.send(posts)
})

app.post('/query-api/events', (req, res) => {
  const { type, data } = req.body
  handleEvent(type, data)
  res.send({})
})

app.listen(4002, async () => {
  console.log('Listening on 4002')
  const response = await axios.get('http://event-bus-api-srv:4005/event-bus-api/request-events')
  for (let event of response.data) {
    console.log('Processing event: ', event.type);
    handleEvent(event.type, event.data)
  }
})