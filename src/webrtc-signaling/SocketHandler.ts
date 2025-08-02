import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import supabaseAdmin from '../utils/supabaseAdmin';

type RoomPeers = Record<string, Record<string, string>>; // diagramId -> peerId -> socketId
type SocketMeta = Record<string, { peerId: string; diagramId: string }>;
type RoomColors = Record<string, Set<string>>;

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

    private roomPeers: RoomPeers = {};
    private socketMeta: SocketMeta = {};
    private roomColors: RoomColors = {};

    private io: Server | null = null;
    constructor() {
        this.roomPeers = {}; // { diagramId: { peerId: socketId } }
        this.socketMeta = {}; // { socketId: { peerId, diagramId } }
    }

    initialize(io: Server) {
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
                    this.socketMeta[socket.id] = { peerId, diagramId };

                    if (!this.roomPeers[diagramId]) this.roomPeers[diagramId] = {};
                    this.roomPeers[diagramId][peerId] = socket.id;

                    if (!this.roomColors[diagramId]) this.roomColors[diagramId] = new Set();

                    let color: string;

                    const usedColors = this.roomColors[diagramId];

                    if (usedColors.size < availableColors.length) {
                        color = availableColors.find(c => !usedColors.has(c))!;
                        usedColors.add(color);
                    } else {
                        const idx = Math.round(Math.random() * availableColors.length) % availableColors.length;
                        color = availableColors[idx];
                    }

                    // Send own ID + other peers
                    socket.emit('joined', {
                        peerId,
                        peerColor: color,
                        peerName: data.user.user_metadata.name,
                        peers: Object.keys(this.roomPeers[diagramId]).filter(id => id !== peerId)
                    });

                    // Notify other peers
                    socket.to(diagramId).emit('new-peer', { peerId });
                });

                socket.on('signal', ({ to, from, signalType, data }) => {
                    const diagramId = this.socketMeta[socket.id]?.diagramId;
                    const targetSocketId = this.roomPeers[diagramId]?.[to];

                    if (targetSocketId) {
                        this.io!.to(targetSocketId).emit('signal', {
                            from,
                            signalType,
                            data
                        });
                    }
                });

                socket.on('disconnect', () => {
                    const meta = this.socketMeta[socket.id];
                    if (!meta) return;

                    const { peerId, diagramId } = meta;

                    delete this.socketMeta[socket.id];
                    delete this.roomPeers[diagramId]?.[peerId];
                    delete this.roomColors[diagramId];

                    socket.to(diagramId).emit('peer-left', { peerId });

                    if (Object.keys(this.roomPeers[diagramId] || {}).length === 0) {
                        delete this.roomPeers[diagramId];
                    }
                });
            });
        } catch (err) {
            console.log(err);
        }
    }
}

const socketHandlerInstance = new SocketHandler();
export default socketHandlerInstance;