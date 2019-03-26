import * as fs from 'fs';

export const readFile = function (filename): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (error, data) => {
            if (error) {
                reject(`Could not read file ${filename}`);
            } else {
                resolve(data);
            }
        })
    });
};