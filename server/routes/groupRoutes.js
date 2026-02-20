const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

// Configure Multer for Chat Content
const chatStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../public/uploads/chat');
        require('fs').mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadChat = multer({
    storage: chatStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware for authentication
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = await User.findById(decoded.userId || decoded.id);
        if (!req.user) throw new Error();
        next();
    } catch (e) {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// Check if a user has a specific role in a group
const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            const group = await Group.findById(req.params.id || req.params.groupId);
            if (!group) return res.status(404).json({ message: 'Group not found' });

            // Make sure the group object's isMember and getRole work
            const isMember = group.isMember(req.user._id);
            const userRole = group.getRole(req.user._id);

            if (!isMember || !roles.includes(userRole)) {
                return res.status(403).json({ message: 'Insufficient group permissions' });
            }
            req.group = group; // Pass group to next middleware
            req.memberRole = userRole;
            next();
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    };
};

/* --- CORE GROUP ROUTES --- */

// GET all public/joined groups
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Find public groups or groups where user is a member
        const groups = await Group.find({
            $or: [
                { visibility: 'public' },
                { 'members.user': req.user._id }
            ]
        }).populate('creator', 'username profile.avatar')
            .select('-inviteCode -joinRequests'); // Hide sensitive info from listing

        // Attach boolean 'isMember' flag for frontend
        const mappedGroups = groups.map(g => {
            const doc = g.toObject();
            doc.isMember = g.members.some(m => m.user.toString() === req.user._id.toString());
            // don't send massive member list in general GET
            doc.memberCount = doc.members.length;
            delete doc.members;
            return doc;
        });

        res.json(mappedGroups);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET group details (Requires membership if private)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('creator', 'username profile.avatar')
            .populate('members.user', 'username profile.avatar xp status role')
            .populate('resources.addedBy', 'username')
            .populate('events.creator', 'username')
            .populate('challenges.submissions.user', 'username');

        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.visibility === 'private' && !isMember && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'This is a private group. You must join to view contents.' });
        }

        // Only send invite code to admins/moderators of the group
        const role = group.getRole(req.user._id);
        const doc = group.toObject();
        doc.currentUserRole = role;
        doc.isMember = isMember;

        if (role !== 'admin' && role !== 'moderator') {
            delete doc.inviteCode;
            delete doc.joinRequests;
        } else {
            await group.populate('joinRequests', 'username profile.avatar xp');
            doc.joinRequests = group.joinRequests;
        }

        res.json(doc);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST Create Group
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, tags, visibility } = req.body;

        // Generate a 6-character random deep-link code
        const inviteCode = crypto.randomBytes(3).toString('hex');

        const group = new Group({
            name, description, tags, visibility,
            creator: req.user._id,
            inviteCode,
            members: [{ user: req.user._id, role: 'admin' }], // Creator is admin
            channels: [{ name: 'general', description: 'General Discussion' }] // Default channel
        });

        await group.save();

        // Bidirectional sync: Add group to user's profile
        await User.findByIdAndUpdate(req.user._id, { $push: { groups: group._id } });

        res.status(201).json(group);
    } catch (e) { res.status(400).json({ message: e.message }); }
});

/* --- JOINING & INVITES --- */

// POST Request Join or Join directly
router.post('/:id/join', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.isMember(req.user._id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        if (group.visibility === 'public') {
            group.members.push({ user: req.user._id, role: 'member' });
            await group.save();

            // Bidirectional sync
            await User.findByIdAndUpdate(req.user._id, { $addToSet: { groups: group._id } });

            return res.json({ message: 'Successfully joined group', group });
        } else {
            // Private group - send request
            if (!group.joinRequests.includes(req.user._id)) {
                group.joinRequests.push(req.user._id);
                await group.save();
            }
            return res.json({ message: 'Join request sent to Admins' });
        }
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST Accept/Decline Join Request (Admins/Mods only)
router.post('/:id/requests/:userId', [authMiddleware, requireRole(['admin', 'moderator'])], async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'decline'
        const group = req.group;
        const targetUserId = req.params.userId;

        // Check if request exists
        if (!group.joinRequests.some(id => id.toString() === targetUserId.toString())) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        // Remove from requests queue
        group.joinRequests = group.joinRequests.filter(id => id.toString() !== targetUserId.toString());

        if (action === 'accept') {
            if (!group.isMember(targetUserId)) {
                group.members.push({ user: targetUserId, role: 'member' });
            }
        }

        await group.save();

        if (action === 'accept') {
            await User.findByIdAndUpdate(targetUserId, { $addToSet: { groups: group._id } });
        }

        res.json({ message: `Request ${action}ed successfully` });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET Fetch preview data from an Invite Code (public endpoint)
router.get('/invite/:code', async (req, res) => {
    try {
        const group = await Group.findOne({ inviteCode: req.params.code })
            .populate('creator', 'username profile.avatar');

        if (!group) return res.status(404).json({ message: 'Invalid or expired invite link.' });

        res.json({
            id: group._id,
            name: group.name,
            description: group.description,
            creator: group.creator,
            memberCount: group.members.length,
            visibility: group.visibility
        });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST Join via Invite Code
router.post('/invite/:code/accept', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findOne({ inviteCode: req.params.code });
        if (!group) return res.status(404).json({ message: 'Invalid or expired invite link.' });

        if (group.isMember(req.user._id)) {
            return res.json({ message: 'Already a member', id: group._id });
        }

        // Remove from join requests if they were waiting
        group.joinRequests = group.joinRequests.filter(id => id.toString() !== req.user._id.toString());

        group.members.push({ user: req.user._id, role: 'member' });
        await group.save();

        // Bidirectional sync
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { groups: group._id } });
        await group.save();

        res.json({ message: 'Successfully joined via invite', id: group._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT Edit group details (Admin/Moderator only)
router.put('/:id', [authMiddleware, requireRole(['admin', 'moderator'])], async (req, res) => {
    try {
        const { name, description, icon, visibility } = req.body;
        const group = req.group;

        if (name) group.name = name;
        if (description) group.description = description;
        if (icon !== undefined) group.icon = icon;
        if (visibility) group.visibility = visibility;

        await group.save();
        res.json({ message: 'Group updated successfully', group });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE Group (Creator or Global Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only the creator can dismantle this hub.' });
        }

        await Group.findByIdAndDelete(req.params.id);

        // Also remove group from all users' group lists
        await User.updateMany({}, { $pull: { groups: req.params.id } });

        // Also delete associated messages
        const Message = require('../models/Message');
        await Message.deleteMany({ group: req.params.id });

        res.json({ message: 'Group dismantled successfully' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET group members list
router.get('/:id/members', authMiddleware, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('members.user', 'username profile.avatar xp status role');
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.visibility === 'private' && !group.isMember(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Membership required to view roster.' });
        }

        res.json(group.members);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT Update Member Role / Kick / Block (Admin only)
router.put('/:id/members/:userId', [authMiddleware, requireRole(['admin'])], async (req, res) => {
    try {
        const { role, action } = req.body; // action: 'kick' or 'block'
        const group = req.group;
        const targetUserId = req.params.userId;

        if (action === 'kick' || action === 'block') {
            group.members = group.members.filter(m => m.user.toString() !== targetUserId.toString());
            if (action === 'block') {
                if (!group.bannedUsers.includes(targetUserId)) group.bannedUsers.push(targetUserId);
            }
        } else if (role) {
            const member = group.members.find(m => m.user.toString() === targetUserId.toString());
            if (member) member.role = role;
        }

        await group.save();
        res.json({ message: 'Member updated successfully' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT Generate new invite link (Admins only)
router.put('/:id/invite/regenerate', [authMiddleware, requireRole(['admin'])], async (req, res) => {
    try {
        const crypto = require('crypto');
        req.group.inviteCode = crypto.randomBytes(3).toString('hex');
        await req.group.save();
        res.json({ inviteCode: req.group.inviteCode });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

/* --- CHAT & CHANNELS --- */

// GET messages for a channel
router.get('/:groupId/channels/:channelId/messages', [authMiddleware, requireRole(['admin', 'moderator', 'member'])], async (req, res) => {
    try {
        const messages = await Message.find({
            group: req.params.groupId,
            channel: req.params.channelId
        }).populate('sender', 'username profile.avatar role')
            .sort({ createdAt: -1 }) // Get newest first
            .limit(50); // Pagination in future

        res.json(messages.reverse()); // Send back chronologically
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST send a message (or snippet)
router.post('/:groupId/channels/:channelId/messages', [authMiddleware, requireRole(['admin', 'moderator', 'member'])], async (req, res) => {
    try {
        const { content, type, snippetMeta } = req.body;

        // Verify channel exists
        const channelExists = req.group.channels.id(req.params.channelId);
        if (!channelExists) return res.status(404).json({ message: 'Channel not found in this group' });

        const msg = new Message({
            group: req.params.groupId,
            channel: req.params.channelId,
            sender: req.user._id,
            content,
            type: type || 'text',
            snippetMeta
        });

        await msg.save();

        const populatedMsg = await msg.populate('sender', 'username profile.avatar role');

        // Broadcast via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`${req.params.groupId}:${req.params.channelId}`).emit('new_message', populatedMsg);
        }

        res.status(201).json(populatedMsg);
    } catch (e) { res.status(400).json({ message: e.message }); }
});

// POST upload specialized content (media/docs)
router.post('/:groupId/channels/:channelId/messages/upload', [authMiddleware, uploadChat.single('file')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file transmitted.' });

        const { groupId, channelId } = req.params;
        const group = await Group.findById(groupId);
        if (!group || !group.isMember(req.user._id)) return res.status(403).json({ message: 'Access Denied' });

        const isImage = req.file.mimetype.startsWith('image/');
        const fileUrl = `/public/uploads/chat/${req.file.filename}`;

        const message = new Message({
            group: groupId,
            channel: channelId,
            sender: req.user._id,
            content: req.file.originalname, // Store filename as content
            type: isImage ? 'image' : 'file',
            fileUrl: fileUrl,
            fileMeta: {
                mimetype: req.file.mimetype,
                size: req.file.size,
                filename: req.file.originalname
            }
        });

        await message.save();
        const populatedMsg = await message.populate('sender', 'username profile.avatar role');

        // Broadcast via Socket.IO for "mini-sec" delivery
        const io = req.app.get('io');
        if (io) {
            io.to(`${groupId}:${channelId}`).emit('new_message', populatedMsg);
        }

        res.status(201).json(populatedMsg);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST Create Channel (Admin/Mod)
router.post('/:groupId/channels', [authMiddleware, requireRole(['admin', 'moderator'])], async (req, res) => {
    try {
        const { name, description } = req.body;
        // Simple slugify for channel name
        const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        req.group.channels.push({ name: cleanName, description });
        await req.group.save();

        const newChannel = req.group.channels[req.group.channels.length - 1];
        res.status(201).json(newChannel);
    } catch (e) { res.status(400).json({ message: e.message }); }
});

/* --- THE VAULT (RESOURCES) --- */
router.post('/:groupId/vault', [authMiddleware, requireRole(['admin', 'moderator', 'member'])], async (req, res) => {
    try {
        const { title, url, type } = req.body;
        req.group.resources.push({
            title, url, type, addedBy: req.user._id
        });
        await req.group.save();
        res.status(201).json(req.group.resources[req.group.resources.length - 1]);
    } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE a message
router.delete('/:groupId/channels/:channelId/messages/:messageId', [authMiddleware, requireRole(['admin', 'moderator', 'member'])], async (req, res) => {
    try {
        const { groupId, channelId, messageId } = req.params;
        const { mode } = req.query; // 'everyone' or 'me'

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        // If "Delete for Everyone"
        if (mode === 'everyone') {
            // Check permissions: sender or group admin
            const isSender = message.sender.toString() === req.user._id.toString();
            const isAdmin = req.group.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');

            if (!isSender && !isAdmin) {
                return res.status(403).json({ message: 'Unauthorized to delete for everyone' });
            }

            // Transform message rather than hard delete to maintain thread history (WhatsApp style)
            message.content = '🚫 This message was deleted';
            message.type = 'system';
            message.isDeleted = true;
            message.fileUrl = null;
            message.fileMeta = null;
            message.snippetMeta = null;
            await message.save();

            // Broadcast to all clients
            const io = req.app.get('io');
            if (io) {
                io.to(`${groupId}:${channelId}`).emit('message_deleted', {
                    messageId,
                    groupId,
                    channelId,
                    content: message.content,
                    type: message.type
                });
            }

            return res.json({ message: 'Message deleted for everyone', messageId });
        } else {
            // "Delete for Me" - Handled purely on frontend for simplicity in this version
            // (In a scaleable app, we'd store a 'hiddenForUsers' array in the message)
            return res.json({ message: 'Message removed locally', messageId });
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
