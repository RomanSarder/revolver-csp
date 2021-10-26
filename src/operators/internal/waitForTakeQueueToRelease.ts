import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeParkCommand } from '@Lib/go';
import { Operator } from '../operator.types';

export const WAIT_FOR_TAKE_QUEUE_TO_RELEASE = 'WAIT_FOR_TAKE_QUEUE_TO_RELEASE';

export function* waitForTakeQueueToReleaseGenerator<C extends Channel<any>>(
    ch: C,
): Generator<Instruction<unknown>> {
    while (ch.takeBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield makeParkCommand();
    }
}

export function waitForTakeQueueToRelease<C extends Channel<any>>(
    ch: C,
): Operator<Generator<Instruction<unknown>>> {
    return {
        name: WAIT_FOR_TAKE_QUEUE_TO_RELEASE,
        generator: waitForTakeQueueToReleaseGenerator(ch),
    };
}
