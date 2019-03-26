import {OutputStream} from './output-stream';

export class StdoutOutputStream implements OutputStream {

    private stream;

    private donePromise: Promise<void>;

    private resolveDonePromise: () => void;
    private rejectDonePromise: () => void;

    constructor() {
        this.initPromise();
        this.initStdout();
    }

    private initPromise(): void {
        this.donePromise = new Promise<void>((resolve, reject) => {
            this.resolveDonePromise = resolve;
            this.rejectDonePromise = reject;
        });
    }

    private initStdout(): void {
        this.stream = process.stdout;
        this.stream.on('finish', this.resolveDonePromise);
        this.stream.on('error', this.rejectDonePromise);
    }

    public write(content: string): void {
        this.stream.write(content, 'utf8');
    }

    public flush(): Promise<void> {
        return this.donePromise;
    }

}
