import { IStatus } from "./status";

export interface INotification{
    to:[]
	cc:[];
	bcc:[];
	sendAttachment:string;
    subject:string;
	message:string; 
	signature:string;
	disclaimer:string;
    statusList:IStatus[];
    status:IStatus;
}