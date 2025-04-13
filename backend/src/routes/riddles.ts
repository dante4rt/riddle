import express from 'express';
import * as riddleController from '../controllers/riddleController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', riddleController.getRiddles);
router.get('/check-eligibility', protect, riddleController.checkEligibility);
router.get('/:id', riddleController.getRiddle);
router.post('/', protect, riddleController.createRiddle);
router.post('/:id/submit', protect, riddleController.submitAnswer);

export { router as riddleRouter };
