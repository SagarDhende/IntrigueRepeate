import { IMetaIdentifierHolder } from "./meta-identifier-holder-model";

export interface IAttributeRefHolder extends IMetaIdentifierHolder {
    
    attrId:string;
    attrName: string;
    attrDispName: string;
    attrDesc: string;
    attrType: string;
    attrUnitType: string;
    piiFlag: string;
    cdeFlag: string;
    function: string;

}