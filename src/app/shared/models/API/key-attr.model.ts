import { IRef } from "./ref.model";

export interface IKeyAttr {
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