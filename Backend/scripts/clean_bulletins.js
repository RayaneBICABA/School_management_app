const mongoose = require('mongoose');
const Bulletin = require('../models/Bulletin');

async function cleanDuplicates() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/school_management');
        console.log('Connected to database');

        const allGroups = await Bulletin.aggregate([
            {
                $group: {
                    _id: '$eleve',
                    count: { $sum: 1 },
                    ids: { $push: '$_id' }
                }
            }
        ]);

        console.log(`Debug: Total unique groups (eleve/periode/year): ${allGroups.length}`);

        allGroups.forEach(g => {
            if (g.count > 1) {
                console.log('Duplicate Group found:', JSON.stringify(g, null, 2));
            }
        });

        const duplicates = allGroups.filter(g => g.count > 1);

        console.log(`Found ${duplicates.length} sets of duplicates`);

        let totalDeleted = 0;

        for (const duplicate of duplicates) {
            // Sort bulletins by updatedAt descending (if possible) or just keep first one
            // Higher index = keep the one that matches lastUpdated or just latest created

            const bulletins = await Bulletin.find({ _id: { $in: duplicate.ids } }).sort({ updatedAt: -1 });

            // Keep the first one, delete the rest
            const toDelete = bulletins.slice(1).map(b => b._id);

            if (toDelete.length > 0) {
                const result = await Bulletin.deleteMany({ _id: { $in: toDelete } });
                totalDeleted += result.deletedCount;
                console.log(`Deleted ${result.deletedCount} duplicates for student ${duplicate._id.eleve}`);
            }
        }

        console.log(`Total bulletins deleted: ${totalDeleted}`);
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

cleanDuplicates();
