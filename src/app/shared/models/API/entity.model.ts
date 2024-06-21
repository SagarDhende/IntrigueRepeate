import { IAppManager } from "./app-info.model";
import { IBaseEntity } from "./base-entity.model";
import { IChildEntity } from "./child-entity.model";
import { ICreatedBy } from "./created-by.model";
import { IDashboard } from "./dashboard.model";
import { IDependsOn } from "./depends-on.model";
import { IDetailAttr } from "./detail-attr.model";
import { IFilterInfo } from "./filter-info.model";
import { IGraphInfo } from "./graph-info.model";
import { IKeyAttr } from "./key-attr.model";
import { IParentEntity } from "./parent-entity.model";
import { IParentJoinKeyAttr } from "./parent-join-key-attr.model";

export interface IEntity extends IBaseEntity{

    createdBy: ICreatedBy;
    appInfo: IAppManager[];
    publicFlag: string;
    parentInfo?: any;
    notifyOn?: any;
    resource?: any;
    keyAttr: IKeyAttr;
    parentEntity: IParentEntity;
    parentJoinKeyAttr: IParentJoinKeyAttr;
    childEntity: IChildEntity;
    dashboard: IDashboard;
    detailAttr: IDetailAttr[];
    dependsOn: IDependsOn;
    graphInfo: IGraphInfo;
    nodeIcon: string;
    sortby?: any;
    sortOrder?: any;
    filterInfo: IFilterInfo[];
}