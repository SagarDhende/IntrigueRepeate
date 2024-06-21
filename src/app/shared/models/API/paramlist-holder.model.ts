import { IAttributeRefHolder } from "./atribute-ref-holder-model";
import { IMetaIdentifierHolder } from "./meta-identifier-holder-model";
import { IMetaIdentifier } from "./meta-identifier-model";

export interface IParamlistHolder extends IMetaIdentifierHolder{
    paramId:string;
    paramName:string;
    paramType:string;
    paramDispName:string;
    paramDesc:string;
    paramValue:IMetaIdentifierHolder;
    attributeInfo:Array<IAttributeRefHolder>;
}


export class ParamlistHolder implements IParamlistHolder{

    paramId: string;
    paramName: string;
    paramType: string;
    paramDispName: string;
    paramDesc: string;
    paramValue: IMetaIdentifierHolder;
    attributeInfo: IAttributeRefHolder[];
    ref: IMetaIdentifier;
    value: string;
}
