const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc Get all conversations for current user
// @route GET /api/conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participantIds: req.user._id,
    })
      .populate('participantIds', 'name role profileImage location')
      .populate('listingId', 'cropName variety images askingPrice priceUnit')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Start or retrieve conversation
// @route POST /api/conversations
exports.createConversation = async (req, res) => {
  try {
    const { recipientId, listingId, saleId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required.' });
    }

    // Check if conversation already exists between these two
    let conversation = await Conversation.findOne({
      participantIds: { $all: [req.user._id, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participantIds: [req.user._id, recipientId],
        listingId: listingId || undefined,
        saleId: saleId || undefined,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('participantIds', 'name role profileImage location')
      .populate('listingId');

    res.status(200).json({
      success: true,
      conversation: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get messages in a conversation
// @route GET /api/conversations/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Enforce participant authorization
    const isParticipant = conversation.participantIds.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name role profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Send a message in a conversation
// @route POST /api/conversations/:id/messages
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participantIds.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    conversation.lastMessageText = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate(
      'senderId',
      'name role profileImage'
    );

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
