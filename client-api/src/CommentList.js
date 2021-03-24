import React from 'react'

export default ({ commentsByPostId }) => {

  const renderedCommentsByPostId = commentsByPostId.map(comment => {

    let content = comment.status === 'approved' ? comment.content :
    comment.status === 'pending' ? 'This comment is awaiting moderation' :
    comment.status === 'rejected' ? 'This comment has been rejected' : null

  return <li key={comment.id}>{content}</li>
  })

  return <ul>
    {renderedCommentsByPostId}
  </ul>
}