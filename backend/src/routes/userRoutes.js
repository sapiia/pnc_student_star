const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  getAllUsers,
  getUserById,
  getUserProfile,
  createUser,
  updateUser,
  updateUserProfile,
  updateUserProfileImage,
  changeUserPassword,
  deleteUser,
  hardDeleteUser,
  deleteAllUsers,
  hardDeleteAllUsers,
  disableAllUsers,
  setUserActive,
  loginUser,
  inviteUser,
  inviteUsersBulk,
  validateUsersBulkInvite,
  commitUsersBulkInvite,
  validateInvite,
  completeInviteRegistration,
  updateClassNameForStudents
} = require('../controllers/userController');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const profileImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destinationPath = path.join(__dirname, '..', '..', 'uploads', 'profiles');
      fs.mkdirSync(destinationPath, { recursive: true });
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      const filename = `user_${req.params.id}_${Date.now()}${extension}`;
      cb(null, filename);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  }
});

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// GET /api/users/:id/profile - Get profile for user
router.get('/:id/profile', getUserProfile);

// POST /api/users - Create new user
router.post('/', createUser);

// POST /api/users/login - Login user
router.post('/login', loginUser);

// POST /api/users/invite - Send user invite email
router.post('/invite', inviteUser);

// POST /api/users/invite/bulk/validate - Validate Excel rows only (no DB insert)
router.post('/invite/bulk/validate', upload.single('file'), validateUsersBulkInvite);

// POST /api/users/invite/bulk/commit - Insert users and send invites for validated rows
router.post('/invite/bulk/commit', commitUsersBulkInvite);

// POST /api/users/invite/bulk - Backward-compatible bulk invite endpoint (commit from file)
router.post('/invite/bulk', upload.single('file'), inviteUsersBulk);

// GET /api/users/invite/validate - Validate invite token
router.get('/invite/validate', validateInvite);

// POST /api/users/invite/complete - Complete registration from invite
router.post('/invite/complete', completeInviteRegistration);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// PUT /api/users/:id/profile - Update profile for user
router.put('/:id/profile', updateUserProfile);

// PATCH /api/users/:id/profile-image - Upload and update user profile image
router.patch(
  '/:id/profile-image',
  (req, res, next) => {
    console.log('📤 Upload started for user:', req.params.id);
    
    profileImageUpload.single('image')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error:', err);
        return res.status(400).json({ error: err.message || 'Failed to upload image.' });
      }
      
      if (!req.file) {
        console.log('❌ No file received');
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      
      console.log('✅ File saved:', req.file.filename);
      console.log('✅ File path:', req.file.path);
      console.log('✅ File size:', req.file.size);
      
      next();
    });
  },
  updateUserProfileImage
);

// PATCH /api/users/:id/password - Change password for user
router.patch('/:id/password', changeUserPassword);

// PATCH /api/users/active - Disable all users
router.patch('/active', disableAllUsers);

// PATCH /api/users/:id/active - Enable/disable specific user
router.patch('/:id/active', setUserActive);

// POST /api/users/update-class-name - Update class name for all students in a class
router.post('/update-class-name', updateClassNameForStudents);

// DELETE /api/users - Delete (archive) all users
router.delete('/', deleteAllUsers);

// DELETE /api/users/hard-delete - Permanently remove non-admin users
router.delete('/hard-delete', hardDeleteAllUsers);

// DELETE /api/users/:id/hard - Permanently remove user
router.delete('/:id/hard', hardDeleteUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
