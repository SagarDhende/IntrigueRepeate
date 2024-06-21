import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore';
@Pipe({
  name: 'columnValue',
})
export class ColumnValuePipe implements PipeTransform {
  transform(object:any,key:string):any {
    if (key.indexOf('.') != -1) {
      return _.get(object, key.split('.'));
    }
    return _.get(object, key);
  }

}