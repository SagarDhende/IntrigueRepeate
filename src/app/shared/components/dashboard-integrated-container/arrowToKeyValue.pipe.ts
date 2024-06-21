import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'arrayToKeyValue'
})
export class ArrayToKeyValuePipe implements PipeTransform {
    transform(array: any[]): { key: string, value: any }[] {
        if (!Array.isArray(array)) {
            return [];
        }

        return array.map((item, index) => ({ key: `key${index}`, value: item }));
    }
}