

export async function groupUpdate(update) {
    // Check if the update contains participant changes
    if (update.participants && update.action === 'remove') {
        for (let participant of update.participants) {
            // Check if the removed participant is the specified number
            if (participant === '919737825303@s.whatsapp.net') {
                console.log('Owner removed from group, attempting to re-add...');
                try {
                    // Attempt to re-add the number to the group
                    await this.groupParticipantsUpdate(update.id, [participant], 'add');
                    console.log('Owner successfully re-added to the group.');
                } catch (err) {
                    console.error('Failed to re-add owner to the group:', err);
                }
            }
        }
    }
}
