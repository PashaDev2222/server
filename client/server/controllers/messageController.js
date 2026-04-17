const Message = require('../models/Message');
const xss = require('xss');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const text = xss(req.body.text || '');
    if (!text.trim()) return res.status(400).json({ message: 'Message text is required' });
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: 'Receiver is required' });

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();
    messages.forEach((msg) => {
      const other = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      const key = other._id.toString();
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, { user: other, lastMessage: msg });
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getConversations };
