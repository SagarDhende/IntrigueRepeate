import { ICreatedBy } from "./created-by.model";

export interface IDocument {
    id?: any;
    uuid?: any;
    version?: any;
    name?: any;
    displayName?: any;
    desc?: any;
    createdBy: ICreatedBy;
    createdOn: string;
    tags?: any;
    active: string;
    locked: string;
    published: string;
    appInfo?: any;
    publicFlag: string;
    parentInfo?: any;
    notifyOn?: any;
    resource?: any;
    attachmentId: string;
    caseId: string;
    appUuid: string;
    file_name: string;
    file_format: string;
    file_size_mb: string;
    fileContents?: any;
}