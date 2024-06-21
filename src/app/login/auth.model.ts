export interface ILogin {
    message:String;
    sessionId:String;
    userName:String;
    appId:String;
    userUuid:String;
    userGroup:String;
    appName:String;  
}

export class Session implements ILogin{
     message: String;
     sessionId: String;
     userName: String;
     appId:String=null;
     userUuid:String;
     userGroup: String;
     appName:String;    

}
export interface SocialSSO {
    googleAuthVisible: boolean,
    googleAuthClientId: string,
}



// interface RootObject {
//     data: Datum[];
//     meta: Meta;
//   }
  
//   interface Meta {
//     count: number;
//     attributes: Attribute[];
//   }
  
//   interface Attribute {
//     attributeId?: any;
//     displaySeq?: any;
//     name?: any;
//     type?: any;
//     desc?: any;
//     expression?: any;
//     key?: any;
//     partition?: any;
//     dispName?: any;
//     active: string;
//     length?: any;
//     attrUnitType?: any;
//     domain?: any;
//     piiFlag: string;
//     cdeFlag: string;
//     precision?: any;
//     scale?: any;
//     nullFlag: string;
//     count: number;
//     min?: any;
//     max?: any;
//     unique?: any;
//     filterFlag: string;
//     filterType?: any;
//   }
  
//   interface Datum {
//     updated_on?: string;
//     app_uuid: string;
//     threshold_limit: number;
//     business_date: string;
//     rule_uuid: string;
//     score: number;
//     case_id: string;
//     action?: string;
//     param_info: string;
//     severity: string;
//     owner?: any;
//     user_group?: string;
//     rule_name: string;
//     case_type: string;
//     active?: string;
//     disposition_code?: string;
//     entity_id: string;
//     priority?: string;
//     version: number;
//     rule_exec_time: string;
//     rule_exec_uuid: string;
//     rule_exec_version: number;
//     filter_expr: string;
//     entity_type: string;
//     rule_version: number;
//     stage?: string;
//     updated_by?: string;
//     threshold_type: string;
//     status?: string;
//   }