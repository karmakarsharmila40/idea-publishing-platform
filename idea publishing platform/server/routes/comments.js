const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Idea = require('../models/Idea');

// @route   POST api/comments/:ideaId
// @desc    Add a comment to an idea
// @access  Private
router.post('/:ideaId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    const idea = await Idea.findById(req.params.ideaId);
    
    if (!idea) {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    
    // Add comment to idea
    idea.comments.unshift({
      user: req.user.id,
      text
    });
    
    await idea.save();
    
    // Return the updated idea with populated comments
    const updatedIdea = await Idea.findById(req.params.ideaId)
      .populate('comments.user', 'username profilePicture');
    
    res.json(updatedIdea.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/comments/:ideaId/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:ideaId/:commentId', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId);
    
    if (!idea) {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    
    // Find the comment
    const comment = idea.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if user is the comment author
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Remove comment
    const commentIndex = idea.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );
    
    idea.comments.splice(commentIndex, 1);
    await idea.save();
    
    res.json(idea.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;