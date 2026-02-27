const MeetingSchedule = require('../models/MeetingSchedule');

const getAllMeetings = async (req, res) => {
  try {
    const meetings = await MeetingSchedule.findAll();
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const meeting = await MeetingSchedule.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getMeetingsByStudentId = async (req, res) => {
  try {
    const meetings = await MeetingSchedule.findByStudentId(req.params.studentId);
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createMeeting = async (req, res) => {
  try {
    const meetingId = await MeetingSchedule.create(req.body);
    res.status(201).json({ 
      message: "Meeting created successfully", 
      meetingId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const updated = await MeetingSchedule.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.json({ message: "Meeting updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const deleted = await MeetingSchedule.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.json({ message: "Meeting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllMeetings,
  getMeetingById,
  getMeetingsByStudentId,
  createMeeting,
  updateMeeting,
  deleteMeeting
};
