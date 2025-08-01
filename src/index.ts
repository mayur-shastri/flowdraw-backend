import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import userRouter from './routes/user.route';
import diagramRouter from './routes/diagram.route';
import invitationRouter from './routes/collabInvite.route';
import http from 'http';
import {Server} from 'socket.io';
import socketHandlerInstance from './webrtc-signaling/SocketHandler';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {cors: { origin: '*' }});

socketHandlerInstance.initialize(io);

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(express.json());

app.get('/', (req, res)=>{
  res.send('Hello World');
});

app.use('/invitations', invitationRouter);
app.use('/users', userRouter);
app.use('/diagrams', diagramRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});