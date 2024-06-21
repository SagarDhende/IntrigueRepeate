import { IColStructure } from "../../models/col-structure.model";
import { ActionType } from "./action-type"; 

export class ActionMenu{
    label : string;
    icon : string;
    actionType: ActionType
    routerLink?: string
}
export interface IOption {
    isRowClickable?: boolean;
    isExec?: boolean;
    uuid:string;
    isTableCaptionEnable:boolean;
    tableCols: IColStructure [];
    requestParam: {publishFlag : string}
    actionMenu :ActionMenu[];
    filter?:any[];

}

export class Options implements IOption{
    isRowClickable?: boolean;
    isExec?: boolean;
    uuid:string;
    isTableCaptionEnable:boolean=true;
    tableCols: IColStructure[];
    requestParam: {publishFlag : string}
    actionMenu :ActionMenu[]
    //filter?:Map<string,filterOption>;
    filter?:any[]

}

export class filterOption{
    visible:boolean;
    label:string;
}
 



