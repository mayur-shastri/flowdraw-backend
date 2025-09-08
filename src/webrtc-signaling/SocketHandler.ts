import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import supabaseAdmin from '../utils/supabaseAdmin';
import { createClient, RedisClientType } from 'redis';

const availableColors = [
    'hsl(0, 70%, 50%)',
    'hsl(30, 70%, 50%)',
    'hsl(60, 70%, 50%)',
    'hsl(90, 70%, 50%)',
    'hsl(120, 70%, 50%)',
    'hsl(150, 70%, 50%)',
    'hsl(180, 70%, 50%)',
    'hsl(210, 70%, 50%)',
    'hsl(240, 70%, 50%)',
    'hsl(270, 70%, 50%)',
    'hsl(300, 70%, 50%)',
    'hsl(330, 70%, 50%)',
];

class SocketHandler {

    private redis: RedisClientType;

    private io: Server | null = null;


    constructor() {
        this.redis = createClient({
            url: process.env.REDIS_URL
        });
        this.redis.on("error", (err) => {
            console.error("Redis error:", err);
        });
    }

    async initialize(io: Server) {
        await this.redis.connect();
        try {
            this.io = io;

            io.on('connection', async (socket) => {
                const peerId = uuidv4();

                socket.on('join', async ({ diagramId, token }) => {
                    const { data, error } = await supabaseAdmin.auth.getUser(token);

                    if (error || !data?.user) {
                        console.log("Authentication error:", error);
                        socket.emit("auth-error", { message: "Invalid token" });
                        return;
                    }

                    console.log("Success: ", data.user.user_metadata.name);

                    socket.join(diagramId);
                    this.redis.hSet(`socket:${socket.id}`, {
                        peerId,
                        diagramId,
                    });

                    await this.redis.hSet(`room:${diagramId}`, peerId, socket.id);

                    let color: string;

                    const usedColors = await this.redis.sMembers(`roomColors:${diagramId}`);

                    if (usedColors.length < availableColors.length) {
                        color = availableColors.find(c => !usedColors.includes(c))!; // check array, not Set
                    } else {
                        const idx = Math.floor(Math.random() * availableColors.length);
                        color = availableColors[idx];
                    }

                    await this.redis.sAdd(`roomColors:${diagramId}`, color);

                    // Send own ID + other peers
                    const peersInRoom = await this.redis.hGetAll(`room:${diagramId}`);
                    const peerIds = Object.keys(peersInRoom).filter(id => id !== peerId);
                    socket.emit('joined', {
                        peerId,
                        peerColor: color,
                        peerName: data.user.user_metadata.name,
                        peers: peerIds
                    });

                    // Notify other peers
                    socket.to(diagramId).emit('new-peer', { peerId, peerName: data.user.user_metadata.name });
                });

                socket.on('signal', async ({ to, from, signalType, data }) => {
                    const diagramId = await this.redis.hGet(`socket:${socket.id}`, 'diagramId');
                    const targetSocketId = await this.redis.hGet(`room:${diagramId}`, to);
                    if (targetSocketId) {
                        this.io!.to(targetSocketId).emit('signal', {
                            from,
                            signalType,
                            data
                        });
                    }
                });

                socket.on('disconnect', async () => {
                    const meta = await this.redis.hGetAll(`socket:${socket.id}`);
                    if (!meta || !meta.peerId || !meta.diagramId) return;

                    const { peerId, diagramId } = meta;

                    await this.redis.del(`socket:${socket.id}`);
                    await this.redis.hDel(`room:${diagramId}`, peerId);
                    await this.redis.sRem(`roomColors:${diagramId}`, peerId);

                    socket.to(diagramId).emit('peer-left', { peerId });
                });
            });
        } catch (err) {
            console.log(err);
        }
    }
}

const socketHandlerInstance = new SocketHandler();
export default socketHandlerInstance;