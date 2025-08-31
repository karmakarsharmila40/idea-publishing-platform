const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Idea = require('../models/Idea');
const User = require('../models/User');

// @route   POST api/ideas
// @desc    Create a new idea
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const newIdea = new Idea({
      title,
      description,
      category,
      user: req.user.id
    });

    const idea = await newIdea.save();
    res.json(idea);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/ideas
// @desc    Get all ideas with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt', order = 'desc', user } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (user) {
      filter.user = user;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const ideas = await Idea.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username profilePicture')
      .exec();
    
    // Get total count
    const count = await Idea.countDocuments(filter);
    
    res.json({
      ideas,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/ideas/:id
// @desc    Get idea by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    if (!idea) {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    
    // Increment view count
    idea.views += 1;
    await idea.save();
    
    res.json(idea);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/ideas/:id
// @desc    Update an idea
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Find the idea
    let idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    
    // Check user
    if (idea.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    idea.title = title || idea.title;
    idea.description = description || idea.description;
    idea.category = category || idea.category;
    
    await idea.save();
    
    res.json(idea);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/ideas/:id
// @desc    Delete an idea
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    
    // Check user
    if (idea.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await Idea.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Idea removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/ideas/:id/vote
// @desc    Upvote or downvote an idea
// @access  Private
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    
    if (voteType !== 'up' && voteType !== 'down') {
      return res.status(400).json({ msg: 'Invalid vote type' });
    }
    
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    
    const upvoteIndex = idea.votes.upvotes.indexOf(req.user.id);
    const downvoteIndex = idea.votes.downvotes.indexOf(req.user.id);
    
    // Remove existing votes
    if (upvoteIndex > -1) {
      idea.votes.upvotes.splice(upvoteIndex, 1);
    }
    
    if (downvoteIndex > -1) {
      idea.votes.downvotes.splice(downvoteIndex, 1);
    }
    
    // Add new vote
    if (voteType === 'up') {
      idea.votes.upvotes.push(req.user.id);
    } else {
      idea.votes.downvotes.push(req.user.id);
    }
    
    await idea.save();
    
    res.json({
      upvotes: idea.votes.upvotes.length,
      downvotes: idea.votes.downvotes.length,
      voteCount: idea.voteCount
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Idea not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;