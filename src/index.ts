import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user.route';
import diagramRouter from './routes/diagram.route';
import invitationRouter from './routes/collabInvite.route';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(express.json());

app.use('/invitations', invitationRouter);
app.use('/users', userRouter);
app.use('/diagrams', diagramRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});