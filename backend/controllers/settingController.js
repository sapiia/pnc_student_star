const Setting = require('../models/Setting');

const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getSettingById = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getSettingByKey = async (req, res) => {
  try {
    const setting = await Setting.findByKey(req.params.key);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createSetting = async (req, res) => {
  try {
    const settingId = await Setting.create(req.body);
    res.status(201).json({ 
      message: "Setting created successfully", 
      settingId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const updated = await Setting.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "Setting updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const updated = await Setting.updateByKey(key, value);
    if (!updated) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "Setting updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteSetting = async (req, res) => {
  try {
    const deleted = await Setting.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "Setting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteSettingByKey = async (req, res) => {
  try {
    const deleted = await Setting.deleteByKey(req.params.key);
    if (!deleted) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "Setting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllSettings,
  getSettingById,
  getSettingByKey,
  createSetting,
  updateSetting,
  updateSettingByKey,
  deleteSetting,
  deleteSettingByKey
};
