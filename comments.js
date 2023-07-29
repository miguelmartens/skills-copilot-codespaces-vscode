// Create web server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create comments object
const commentsByPostId = {};

// Create function to handle events
const handleEvent = (type, data) => {
  // If event type is comment created
  if (type === 'CommentCreated') {
    // Get comment id and post id
    const { id, content, postId, status } = data;

    // Get comments for post id
    const comments = commentsByPostId[postId] || [];

    // Push comment to comments array
    comments.push({ id, content, status });

    // Set comments array to post id
    commentsByPostId[postId] = comments;
  }

  // If event type is comment updated
  if (type === 'CommentUpdated') {
    // Get comment id and post id
    const { id, content, postId, status } = data;

    // Get comments for post id
    const comments = commentsByPostId[postId];

    // Find comment in comments array
    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    // Update comment content
    comment.content = content;
    comment.status = status;
  }
};

// Route to handle event
app.post('/events', (req, res) => {
  // Get type and data from request body
  const { type, data } = req.body;

  // Handle event
  handleEvent(type, data);

  // Send back response
  res.send({});
});

// Route to get comments
app.get('/posts/:id/comments', (req, res) => {
  // Get comments for post id
  const comments = commentsByPostId[req.params.id] || [];

  // Send back comments
  res.send(comments);
});

// Start server
app.listen(4001, async () => {
  console.log('Listening on 4001');

  // Get all events
  const res = await axios.get('http://event-bus-srv:4005/events');

  // For each event
  for (let event of res.data) {
    console.log('Processing event:', event.type);

    // Handle event
    handleEvent(event.type, event.data);
  }
});