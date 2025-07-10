const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const { upload, cloudinary } = require('../utils/fileUploader');
const QRCode = require('qrcode');
/**
 * @desc    Register an attendee for a specific event
 * @route   POST /api/events/:eventId/register
 * @access  Public
 */
exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const { eventId } = req.params;

  // 1. Check if the event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // 2. Check if this email is already registered for this event
  const existingAttendee = await Attendee.findOne({ email, event: eventId });
  if (existingAttendee) {
    return next(new ErrorResponse('This email is already registered for this event', 400));
  }

  // 3. Create the attendee record (without the picture URL for now)
  const attendee = await Attendee.create({
    name,
    email,
    phone,
    event: eventId,
  });

  // 4. Handle the profile picture upload if it exists
  if (req.file) {
    // Convert buffer to a data URI string
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `convention-badges/${eventId}`, // Organize uploads by event
      public_id: attendee._id, // Use attendee ID as the public ID for easy lookup
      overwrite: true,
      resource_type: 'image',
    });

    // Update the attendee with the secure URL from Cloudinary
    attendee.profilePictureUrl = result.secure_url;
    await attendee.save();
  }

  res.status(201).json({
    success: true,
    message: 'Successfully registered for the event. Your badge is ready.',
    data: attendee,
  });
});


/**
 * @desc    Get badge details by badge ID
 * @route   GET /api/attendees/badge/:badgeId
 * @access  Public
 */
exports.getBadgeDetails = asyncHandler(async (req, res, next) => {
  const { badgeId } = req.params;

  const attendee = await Attendee.findOne({ badgeId }).populate('event', 'name');

  if (!attendee) {
    return next(new ErrorResponse('Invalid badge ID. Attendee not found.', 404));
  }

  const qrCodeData = `${process.env.APP_URL}/api/attendees/badge/${attendee.badgeId}`;

  // Generate QR code as a data URL (base64 encoded PNG)
  const qrCodeImageUrl = await QRCode.toDataURL(qrCodeData);

  res.status(200).json({
    success: true,
    data: {
      name: attendee.name,
      eventName: attendee.event.name,
      profilePictureUrl: attendee.profilePictureUrl,
      qrCodeData: qrCodeData,      // The URL encoded in the QR code
      qrCodeImageUrl: qrCodeImageUrl // The base64 image data URL of the QR code
    },
  });
});