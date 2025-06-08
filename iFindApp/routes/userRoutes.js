const express = require('express');
const router = express.Router();

// ✅ FINAL ATTEMPT: Let's assume the controller is in the SAME folder.
// The path './' means "look in the current directory".
const userController = require('../controllers/userController'); 

// --- Routes ---
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;