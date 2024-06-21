
export interface IAttributeHolder{
    id:string;
    uuid:string;
    type:string;
    name:string;
    displayName:string;
    attrName:string;
    attrId:string;
    attrType:string;
    dname:string;
}

export class AttributeHolder implements IAttributeHolder{
    id: string;
    uuid: string;
    type: string;
    name: string;
    displayName: string;
    attrName: string;
    attrId: string;
    attrType: string;
    dname: string;
    
}
