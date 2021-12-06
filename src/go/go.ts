import { Channel } from '@Lib/channel/entity/channel';
import { makeChannel } from '@Lib/channel/channel';
import { makePut } from '@Lib/operators/internal/makePut';
import { close } from '@Lib/operators/close';
import type { CancellablePromise } from '@Lib/cancellablePromise/entity/cancellablePromise';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy/closeOnAllValuesTaken';
import { runIterator } from '@Lib/runner';
import { Events } from './entity';
import { GeneratorReturn, MaybeGeneratorReturnFromValue } from './utils';

export function go<
    GenFn extends (...args1: readonly any[]) => Generator,
    Args extends Parameters<GenFn>,
    G extends Generator = ReturnType<GenFn>,
    TReturn = Exclude<MaybeGeneratorReturnFromValue<GeneratorReturn<G>>, void>,
>(
    generator: GenFn,
    ...args: Args
): {
    cancellablePromise: CancellablePromise<TReturn | Events.CANCELLED>;
    channel: Channel<TReturn | Events.CANCELLED>;
} {
    const channel = makeChannel<TReturn | Events.CANCELLED>();
    const cancellablePromise = runIterator(generator(...args));

    return {
        cancellablePromise: cancellablePromise
            .then((res) => {
                makePut(channel, res);
                return res;
            })
            .catch((e) => {
                close(channel);
                throw e;
            }),
        channel: closeOnAllValuesTaken(channel),
    };
}
