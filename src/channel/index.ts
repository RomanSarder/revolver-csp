export type { Channel } from './entity/channel';
export type { ChannelConfiguration } from './entity/channelConfiguration';
export type { FlattenChannel, FlattenChannels } from './entity/flatten';
export { errorMessages } from './entity/errorMessages';
export { Events } from './entity/events';

export { isChannelClosedError } from './utils/isChannelClosedError';

export { closeOnAllValuesTaken } from './proxy/closeOnAllValuesTaken';
export { closeOnEmptyBuffer } from './proxy/closeOnEmptyBuffer';

export { DefaultChannelConfig } from './config';

export { makeChannel, makeTimeoutChannel } from './channel';
