import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { eventLoopQueue } from '@Lib/internal';

export async function waitForTakeQueueToRelease<T = unknown>(ch: Channel<T>) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.takeBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }

        await eventLoopQueue();
    }
}