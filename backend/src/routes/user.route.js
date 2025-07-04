import { Router } from 'express'

import {
    getAllUsers,
    getUserById,
    getCurrentUser,
    updateUserStatus,
    approveMotivator,
    rejectMotivator,
} from '../controllers/user.controller.js'

import { authorizeRoles, JWTVerify } from '../middlewares/auth.middleware.js'
import { UserRoles } from '../constants.js'

import {
    // ...existing imports
    deleteUser,
} from '../controllers/user.controller.js'

// ...existing routes

const router = Router()

router.route('/me').get(JWTVerify, getCurrentUser)

// Admin Only

router.route('/').get(JWTVerify, authorizeRoles(UserRoles.ADMIN), getAllUsers)
router.route('/:id').get(JWTVerify, getUserById)
router
    .route('/:id/status')
    .patch(JWTVerify, authorizeRoles(UserRoles.ADMIN), updateUserStatus)
router
    .route('/:id/approve')
    .get(JWTVerify, authorizeRoles(UserRoles.ADMIN), approveMotivator)
router
    .route('/:id/reject')
    .get(JWTVerify, authorizeRoles(UserRoles.ADMIN), rejectMotivator)

router
    .route('/:id')
    .delete(JWTVerify, authorizeRoles(UserRoles.ADMIN), deleteUser)

export default router
