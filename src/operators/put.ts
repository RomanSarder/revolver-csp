import { Channel, FlattenChannel } from '@Lib/channel/channel.types';
import { isChannelClosedError } from '@Lib/channel/utils/isChannelClosedError';

import { makePut } from './internal/makePut';
import { resetChannel } from './internal/resetChannel';
import { waitForIncomingTake } from './internal/waitForIncomingTake';
import { waitForPutQueueToRelease } from './internal/waitForPutQueueToRelease';

export const PUT = 'PUT';

export function* put<C extends Channel<NonNullable<any>>>(
    ch: C,
    data: FlattenChannel<C>,
) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        yield waitForPutQueueToRelease(ch);
        makePut(ch, data);

        if (!ch.isBuffered) {
            yield waitForIncomingTake(ch);
        }
    } catch (e) {
        if (!isChannelClosedError(e)) {
            throw e;
        }
        resetChannel(ch);
        return false;
    }

    return true;
}
