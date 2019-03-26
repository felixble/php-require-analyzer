import {OutputEmitter} from './output-emitter';
import {StdoutOutputStream} from './stdout-output-stream';

export class OutputFactory {

    public static createEmitter(): Promise<OutputEmitter> {
        return new Promise<OutputEmitter>((resolve) => {
            resolve({
                stream: new StdoutOutputStream(),
                close: () => {},
            } as OutputEmitter);
        });
    }

}
