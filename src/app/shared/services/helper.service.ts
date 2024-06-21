import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private sessionService: SessionService) { }

  public setSearchTerm(_array:any,searchStr:any): any{
    return _array.filter(function (item: string) {
      return JSON.stringify(item).toLowerCase().includes(searchStr.toLowerCase());
    })
  }

  public isItemExist(_array: any[], value: string, key: string) {
    var _found = -1
    if (_array != null && _array.length > 0) {
      _found = _array.findIndex(function (item, index) {
        if (item[key] == value)
          return true;
      });
    }
    return _found
  }

  public convertStringObjectToJson(propertiesStr: string) {
    let propertiesObj = {};
    if (typeof propertiesStr === 'string') {
      let temp = propertiesStr.replace('{', ' ');
      temp = temp.replace('}', ' ');
      var tempNPS = temp.split(",");
      for (var i = 0; i < tempNPS.length; i++) {
        let temp = tempNPS[i].split(":");
        var obj = {}
        obj["name"] = temp[0].replace(/["\"]/g, "");
        obj["value"] = typeof temp[1] != "undefined" ? temp[1].replace(/["']/g, "") : "";
        obj["name"] = obj["name"].trim();
        propertiesObj[obj["name"].toLowerCase()] = obj["value"].trim();
      }
    }
    return propertiesObj;
  }

  public convertStringToJson(propertiesStr:string) {
    let propertiesObj = {};
    if (typeof propertiesStr === 'string') {
        let temp = propertiesStr.replace('{', ' ');
        temp = temp.replace('}', ' ');
        var tempNPS = temp.split(",");
        for (var i = 0; i < tempNPS.length; i++) {
            let temp = tempNPS[i].split(":");
            let obj:any = {}
            obj.name = temp[0].replace(/["\"]/g, "");
            obj.value = typeof temp[1] != "undefined" ? temp[1].replace(/["']/g, "") : "";
            obj.name = obj.name.trim();
            propertiesObj[obj.name.toLowerCase()] = obj.value.trim();
        }
    }
    return propertiesObj;
  }

  public convertStringArrayToArray(strArray: string) {
    let data = [];
    data = strArray.split(",");
    data[0] = data[0].substring(0);
    data[data.length - 1] = data[data.length - 1].substring(0, data[data.length - 1].length);
    data.forEach((x, i) => {
      data[i] = data[i].includes('"') ? data[i].replace(/[\"]+/g, '') : data[i].replace(/[\']+/g, '');
    });
  
    return data;
  }

  public convertStringObjectToArrayEdge(strJSON: string){
    let tempArray = [];
    //console.log(strJSON);
    if (typeof strJSON === 'string') {
      let tempStr = strJSON.replace('{', ' ');
      tempStr = tempStr.replace('}', ' ');
      let tempSplit = tempStr.split(",");
      for (let i = 0; i < tempSplit.length; i++) {
        let tempArr = tempSplit[i].split(":");
        //console.log(tempArr);
        if(tempArr[0] !=""){
          let tempObj = {}
          tempObj["name"] = tempArr[0].replace(/["\"]/g, "").trim();
          tempObj["value"] = typeof tempArr[1] != 'undefined' ? tempArr[1].replace(/["']/g, "").trim() : "";
          tempArray[i] = tempObj;
        }
      }
    } else {
      tempArray = strJSON;
    }
    return tempArray
  }

  public convertStringObjectToArray(strJSON: string){
    let tempArray = [];
    //console.log(strJSON);
    if (typeof strJSON === 'string') {
      let tempStr = strJSON.replace('{', ' ');
      tempStr = tempStr.replace('}', ' ');
      let tempSplit = tempStr.split("\",");
      for (let i = 0; i < tempSplit.length; i++) {
        let tempArr = tempSplit[i].split(":");
        //console.log(tempArr);
        if(tempArr[0] !=""){
          let tempObj = {}
          tempObj["name"] = tempArr[0].replace(/["\"]/g, "").trim();
          tempObj["value"] = typeof tempArr[1] != 'undefined' ? tempArr[1].replace(/["']/g, "").trim() : "";
          tempArray[i] = tempObj;
        }
      }
    } else {
      tempArray = strJSON;
    }
    return tempArray
  }


  public getCountByKey = function (arr: any, proType: string) {
    var counts = {};
    arr.forEach(function (x) {
      counts[x[proType]] = (counts[x[proType]] || 0) + 1;
    });
    return counts
  }

  public convertObjectToArray = function (object: object) {
    let result = Object.keys(object).map(function (key) {
      let ltemInfo = { key: '', value: '', hidden: false };
      ltemInfo.key = key;
      ltemInfo.value = object[key];
      ltemInfo.hidden = false;
      return ltemInfo;
    });
    return result;
  }

  public hasMultipleSlashes(str:string):boolean {
    let isFound=false;
    if(str ==null || typeof str !='string')
      return isFound;

    // Create a regular expression to match the forward slash character
    const regex = /\//g;
    // Use the match method to find all occurrences of '/' in the string
    const matches = str.match(regex);
    // Check if there are multiple matches
    if(matches !=null && matches && matches.length > 1){
      isFound=true;
    }
    return isFound;
  }

  public sortAlphaNum(propName:any) {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;
    return function (a, b) {
      var aA = a[propName].replace(reA, "");
      var bA = b[propName].replace(reA, "");
      if (aA === bA) {
        var aN = parseFloat(a[propName].replace(reN, ""));
        var bN = parseFloat(b[propName].replace(reN, ""));
        return aN === bN ? 0 : aN > bN ? 1 : -1;
      } else {
        return aA > bA ? 1 : -1;
      }
    }
  }
}
