import Crunker from './crunker.js';

export default async function CrunkerHelper({ processType, audios }) {
    try {
        new Crunker().notSupported(() => {
            // "Browser not supported"
            return 1;
        });

        const crunker = new Crunker({ sampleRate: 48000 }),
            buffers = await Promise.all(
                Array.from(audios).map(async (file) => {
                    const arrayBuffer = await file.arrayBuffer(),
                        buffer = await crunker._context.decodeAudioData(arrayBuffer);

                    if (buffer.numberOfChannels === 1) {
                        const newBuffer = crunker._context.createBuffer(2, buffer.length, buffer.sampleRate),
                            channelData = buffer.getChannelData(0);
                        newBuffer.copyToChannel(channelData, 0);
                        newBuffer.copyToChannel(channelData, 1);
                        return newBuffer;
                    } else { return buffer };
                })
            ),
            rawData = await crunker[processType](buffers),
            output = await crunker.export(rawData, 'audio/mp3');

        return output.blob;
    } catch (err) {
        console.log(err);
        return 0;
    };
};