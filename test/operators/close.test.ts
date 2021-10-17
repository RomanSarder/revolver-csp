import { makeChannel } from '@Lib/channel';
import { close } from '@Lib/operators';

describe('close', () => {
    it('should close the channel', () => {
        const ch = makeChannel();
        close(ch);
        expect(ch.isClosed).toEqual(true);
    });
});