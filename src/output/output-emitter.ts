import {OutputStream} from './output-stream';

export interface OutputEmitter {

    stream: OutputStream;

    close(): void;

}