import { createCancellablePromise } from '@Lib/cancellablePromise/createCancellablePromise';
import type { CancellablePromise } from '@Lib/cancellablePromise/entity/cancellablePromise';
import { runIterator } from '@Lib/runner';

export const createCoroutine = ({
    iterator,
}: {
    iterator: Generator;
}): CancellablePromise<any> => {
    const state = {
        isRunning: true,
        isCancelled: false,
    };
    const runner = runIterator(iterator);

    const { resolve, reject, cancellablePromise } = createCancellablePromise(
        async () => {
            if (state.isRunning) {
                state.isCancelled = true;
                await runner.cancel();
            }
        },
    );

    const createPromise = async () => {
        let completionResult;
        try {
            completionResult = await Promise.race([runner, cancellablePromise]);
            resolve(completionResult);
        } catch (e) {
            reject(e);
        } finally {
            state.isRunning = false;
        }
    };
    createPromise();

    return cancellablePromise;
};
