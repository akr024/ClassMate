// BASE BACKEND COMPLETE

import express from 'express'
import userRouter from './userRouter.js';
import courseRouter from './courseRouter.js';
import adminRouter from './adminRouter.js';

const apiRouter = express.Router();

// all user endpoints
apiRouter.use('/user/', userRouter)

// all course endpoints
apiRouter.use('/course/', courseRouter)

// all admin endpoints - to be worked upon later
apiRouter.use('/admin/', adminRouter)

export default apiRouter;