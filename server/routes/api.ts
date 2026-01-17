import express from 'express'
import userRouter from './userRouter.js';
import courseRouter from './courseRouter.js';
import adminRouter from './adminRouter.js';

const apiRouter = express.Router();

// all user endpoints
apiRouter.use('/users/', userRouter)

// all course endpoints
apiRouter.use('/courses/', courseRouter)

// all admin endpoints - to be worked upon later
apiRouter.use('/admin/', adminRouter)

export default apiRouter;