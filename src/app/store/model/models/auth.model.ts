export interface ILogin {
    message:String;
    sessionId:String;
    userName:String;
    appId:String;
    userUuid:String;
    userGroup:String   
}

export class Session implements ILogin{
     message: String;
     sessionId: String;
     userName: String;
     appId:String=null;
     userUuid:String;
     userGroup: String;    

}



