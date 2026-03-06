const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
  setUserActive,
  loginUser,
  inviteUser,
  inviteUsersBulk,
  validateUsersBulkInvite,
  commitUsersBulkInvite,
  validateInvite,
  completeInviteRegistration
} = require('../controllers/userController');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

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

// PATCH /api/users/:id/active - Enable/disable user
router.patch('/:id/active', setUserActive);

// DELETE /api/users - Delete all users
router.delete('/', deleteAllUsers);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
