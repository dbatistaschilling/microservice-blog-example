const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

const handleEvent = async (type, data) => {
  if (type === 'CommentCreated') {
    const { id, content, postId } = data
    const status = data.content.includes('orange') ? 'rejected' : 'approved'
    await axios.post('http://event-bus-api-srv:4005/event-bus-api/send-events', {
      type: 'CommentModerated',
      data: {
        id, postId, content, status
      }
    })
  }
}

app.post('/moderation-api/events', async (req, res) => {
  const { type, data } = req.body
  handleEvent(type, data )
  res.send({})
})

app.listen(4003, async () => {
  console.log('Listening on port 4003')
  const response = await axios.get('http://event-bus-api-srv:4005/event-bus-api/request-events')
  for (let event of response.data) {
    console.log('Processing event: ', event.type);
    handleEvent(event.type, event.data)
  }
})