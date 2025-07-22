import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

type RoomPeers = Record<string, Record<string, string>>; // diagramId -> peerId -> socketId
type SocketMeta = Record<string, { peerId: string; diagramId: string }>;

class SocketHandler {

    private roomPeers: RoomPeers = {};
    private socketMeta: SocketMeta = {};
    private io : Server | null = null;
    constructor() {
        this.roomPeers = {}; // { diagramId: { peerId: socketId } }
        this.socketMeta = {}; // { socketId: { peerId, diagramId } }
    }

    initialize(io : Server) {
        this.io = io;

        io.on('connection', (socket) => {
            const peerId = uuidv4();

            socket.on('join', ({ diagramId }) => {
                socket.join(diagramId);
                this.socketMeta[socket.id] = { peerId, diagramId };

                if (!this.roomPeers[diagramId]) this.roomPeers[diagramId] = {};
                this.roomPeers[diagramId][peerId] = socket.id;

                // Send own ID + other peers
                socket.emit('joined', {
                    peerId,
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

                socket.to(diagramId).emit('peer-left', { peerId });

                if (Object.keys(this.roomPeers[diagramId] || {}).length === 0) {
                    delete this.roomPeers[diagramId];
                }
            });
        });
    }
}

const socketHandlerInstance = new SocketHandler();
export default socketHandlerInstance;