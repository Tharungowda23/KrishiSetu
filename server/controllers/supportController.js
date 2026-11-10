const SupportTicket = require('../models/SupportTicket');

// @desc Submit inquiry from Contact and Help form
// @route POST /api/support
exports.submitTicket = async (req, res) => {
  try {
    const { name, email, phone, userRole, category, subject, message } = req.body;

    if (!name || !email || !category || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, issue category, and message are required fields.',
      });
    }

    const ticket = await SupportTicket.create({
      userId: req.user ? req.user._id : undefined,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      userRole: userRole || (req.user ? req.user.role : 'visitor'),
      category,
      subject: subject || `${category} Inquiry`,
      message: message.trim(),
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been registered with KrishiSetu support. Our team will review and follow up shortly.',
      ticketId: ticket._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all support inquiries (Admin only)
// @route GET /api/support
exports.getTickets = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
