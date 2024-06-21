import { IRef } from "./ref.model";

export interface IDetailAttr {
    ref: IRef;
    value?: any;
    attrId: string;
    attrName?: any;
    attrDispName?: any;
    attrDesc?: any;
    attrType?: any;
    attrUnitType?: any;
    piiFlag?: any;
    cdeFlag?: any;
    function?: any;
}