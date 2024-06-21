import { ICreatedBy } from "./created-by.model";

export interface INote {
    id?: any;
    uuid?: any;
    version?: any;
    name?: any;
    displayName?: any;
    desc?: any;
    createdBy: ICreatedBy;
    createdOn: string;
    tags?: any;
    active?: any;
    locked: string;
    published: string;
    appInfo?: any;
    publicFlag: string;
    parentInfo?: any;
    notifyOn?: any;
    resource?: any;
    caseInfo?: any;
    alertInfo?: any;
    uploadExecInfo?: any;
    noteId: string;
    caseId: string;
    appUuid: string;
    noteText: string;
    noteCreateTime: string;
}