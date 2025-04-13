import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as authRoutes from './routes/auth';
import * as riddleRoutes from './routes/riddles';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRoutes.authRouter);
app.use('/api/riddles', riddleRoutes.riddleRouter);

app.get('/', (req, res) => {
  res.send('RiddleRewards API is running');
});

app.use(errorHandler);

export default app;
