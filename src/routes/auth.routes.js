import {Router} from 'express';
import * as authController from '../controllers/auth.contoller.js';
const authRoute = Router();

// POST api/auth/register
authRoute.post('/register',authController.register);

// GET api/auth/get-me
authRoute.get('/get-me',authController.getMe);


// GET api/auth/get-me
authRoute.get('/refresh-token',authController.refreshToken);


export default authRoute;