const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  inviteUser,
  validateInvite,
  completeInviteRegistration
} = require('../controllers/userController');

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

// GET /api/users/invite/validate - Validate invite token
router.get('/invite/validate', validateInvite);

// POST /api/users/invite/complete - Complete registration from invite
router.post('/invite/complete', completeInviteRegistration);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
