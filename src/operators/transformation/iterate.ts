import { events } from '../../channel';
import { Channel } from '../../channel/channel.types';

export function iterate<T = unknown>(
    callback: (data: T) => Promise<void>,
    ch: Channel<T>,
) {
    if (ch.isClosed) return Promise.resolve(events.CHANNEL_CLOSED);
    const iterator = ch[Symbol.asyncIterator]();

    async function nextStep(
        res:
            | Promise<IteratorResult<string | T, string>>
            | IteratorResult<string | T, string>,
    ): Promise<any> {
        if (ch.isClosed) {
            return Promise.resolve(events.CHANNEL_CLOSED);
        }

        if (res instanceof Promise) {
            return res.then(nextStep);
        }
        if (res.done) {
            return res.value;
        }
        await callback(res.value as T);
        return nextStep(iterator.next());
    }

    return nextStep(iterator.next());
}