import * as fs from 'fs';

export const writeFile = function (filename: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, (error) => {
            if (error) {
                reject(`Could not write file "${filename}"`);
            } else {
                resolve();
            }
        })
    });
};