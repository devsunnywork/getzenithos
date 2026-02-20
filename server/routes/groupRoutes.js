const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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

            const member = group.members.find(m => m.user.toString() === req.user._id.toString());
            if (!member || !roles.includes(member.role)) {
                return res.status(403).json({ message: 'Insufficient group permissions' });
            }
            req.group = group; // Pass group to next middleware
            req.memberRole = member.role;
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

        const isMember = group.isMember(req.user._id);

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

        res.json({ message: 'Successfully joined via invite', id: group._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT Generate new invite link (Admins only)
router.put('/:id/invite/regenerate', [authMiddleware, requireRole(['admin'])], async (req, res) => {
    try {
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
            channelId: req.params.channelId
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
            channelId: req.params.channelId,
            sender: req.user._id,
            content,
            type: type || 'text',
            snippetMeta
        });

        await msg.save();

        // In a real app, this is where you'd emit a Socket.io event!
        await msg.populate('sender', 'username profile.avatar role');
        res.status(201).json(msg);
    } catch (e) { res.status(400).json({ message: e.message }); }
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

module.exports = router;
