require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Group = require('./models/Group');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        try {
            const tempGroupId = "6998a105448f5dcbf97cb3f9";
            const group = await Group.findById(tempGroupId);
            if (!group) {
                console.log("Group not found.");
            } else {
                console.log("Group visibility:", group.visibility);
                console.log("Group Members:", JSON.stringify(group.members, null, 2));
                console.log("Group Channels:", JSON.stringify(group.channels, null, 2));
            }
        } catch (e) {
            console.error(e);
        }
        process.exit(0);
    })
    .catch(console.error);
