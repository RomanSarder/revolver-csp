import { Channel } from '@Lib/channel/entity/channel';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { put } from '../core/put';
import { iterate } from '../collection/iterate';
import { close } from '../core/close';
import { constant } from '@Lib/shared/utils';

export function pipe<T = unknown>(
    destinationChannel: Channel<T>,
    sourceChannel: Channel<T>,
    keepOpen = false,
): { promise: Promise<void> } {
    const promise = (async () => {
        try {
            await createAsyncWrapper(iterate)(
                function* mapValues(data) {
                    yield put(destinationChannel, data);
                },
                constant(true),
                sourceChannel,
            );
        } finally {
            if (!keepOpen) {
                close(destinationChannel);
            }
        }
    })();

    return { promise };
}