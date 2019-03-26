export interface OutputStream {

    write(content: string): void;

    flush(): Promise<void>;

}
