const jwt = require('jsonwebtoken');
const Group = require('./models/Group');
const User = require('./models/User');

module.exports = (io) => {
    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log(`User connected via WS: ${socket.user.id}`);

        socket.on('join_channel', async ({ groupId, channelId }) => {
            try {
                // Verify user is member of group
                const group = await Group.findById(groupId);
                if (!group) return;

                const isMember = group.isMember(socket.user.id);
                if (!isMember && group.visibility === 'private') {
                    // Admins could potentially view, but generally must be a member
                    const userRecord = await User.findById(socket.user.id);
                    if (!userRecord || userRecord.role !== 'admin') {
                        return socket.emit('error', { message: 'Not a member of this group' });
                    }
                }

                // Leave previous channels
                Array.from(socket.rooms).forEach(room => {
                    if (room !== socket.id) socket.leave(room);
                });

                // Join the new channel room
                const roomName = `${groupId}:${channelId}`;
                socket.join(roomName);
                console.log(`User ${socket.user.id} joined channel ${roomName}`);
            } catch (err) {
                console.error('Socket Join Error:', err);
            }
        });

        socket.on('typing', ({ groupId, channelId, username }) => {
            const roomName = `${groupId}:${channelId}`;
            socket.to(roomName).emit('typing', { username });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected WS: ${socket.user.id}`);
        });
    });
};
