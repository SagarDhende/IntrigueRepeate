import { IMetaIdentifierHolder } from "./meta-identifier-holder-model";
import { IMetaIdentifier } from "./meta-identifier-model";


export interface IAppManager {
   appInfo:IAppRole[];
   orgInfo:IMetaIdentifierHolder
}

export interface IAppRole {
    defaultAppId: any
    applicationType: string
    appId: IMetaIdentifier
    roleInfo: IMetaIdentifier[]
    applicationDesc: any
    applicationIcon: any
}


