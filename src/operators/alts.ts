/* eslint-disable require-yield */
// // takes an array consists of channels or [ch, valueToPut]
// // tries to immediately do an operation like poll/offer
// // if succeeds and priority is false - return the random one
// // if succeeds and priority is true and multiple results ready - return in order
// // if no operations ready
// // if default value provided - return it
// // if no default value - wait for operations, return first one to succeed

import { FlattenChannel, Channel } from '@Lib/channel/channel.types';
import { call } from '@Lib/go';
import { Flatten } from '@Lib/shared/types';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { race } from './combinators/race';
import { offerFn } from './offer';
import { pollFn } from './poll';
import { put } from './put';
import { take } from './take';

type PutDefinition<C extends Channel<any>> = [C, FlattenChannel<C>];

type ArrayOfDefinitions<C extends Channel<any>> = (PutDefinition<C> | C)[];

type DefinitionType<A extends any[], C = Flatten<A>> = C extends
    | PutDefinition<infer U>
    | infer U
    ? FlattenChannel<U> | null
    : unknown;

type OperationResponse<C extends any> = {
    value: C | true;
    ch: Channel<NonNullable<C>>;
};

function isPutDefinition<C extends Channel<any>>(
    def: C | PutDefinition<C>,
): def is PutDefinition<C> {
    if (def instanceof Array && typeof def[0] === 'object') {
        return true;
    }
    return false;
}

function* performOperationByDefinition<C extends Channel<any>>(
    definition: C | PutDefinition<C>,
) {
    if (isPutDefinition(definition)) {
        const result: FlattenChannel<C> = yield put(
            definition[0],
            definition[1],
        );
        return {
            value: result,
            ch: definition[0],
        };
    }
    const result: FlattenChannel<C> = yield take(definition);

    return {
        value: result,
        ch: definition,
    };
}

export function* altsGenerator<
    Definitions extends ArrayOfDefinitions<Channel<any>>,
    InnerType = DefinitionType<Definitions>,
>(defs: Definitions, defaultValue?: InnerType): Generator {
    const successes: OperationResponse<InnerType>[] = [];

    defs.forEach((def) => {
        if (isPutDefinition(def)) {
            const [ch, data] = def;
            const result = offerFn(ch, data);

            if (result !== null) {
                successes.push({ value: result, ch });
            }
        } else {
            const ch = def;
            const result = pollFn(ch);

            if (result !== null) {
                successes.push({ value: result, ch });
            }
        }
    });

    if (successes.length > 0) {
        return successes[0];
    }

    if (defaultValue) {
        return { ch: null, value: defaultValue };
    }

    const instructions = defs.map((def) =>
        call(performOperationByDefinition, def),
    );

    return race(...instructions);
}

export const alts = createAsyncWrapper(altsGenerator) as (
    defs: ArrayOfDefinitions<Channel<any>>,
    defaultValue?: unknown,
) => Promise<OperationResponse<any>>;
