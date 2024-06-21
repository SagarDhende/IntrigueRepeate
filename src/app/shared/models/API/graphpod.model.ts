import { IBaseEntity } from "./base-entity.model";
import { IGraphEdge } from "./graph-edge-model";
import { IGraphNodeModel } from "./graph-node.model";
import { IMetaIdentifierHolder } from "./meta-identifier-holder-model";

export interface IGraphpod extends IBaseEntity{
    nodeInfo: IGraphNodeModel[];
    edgeInfo: IGraphEdge[];
    resultOverwrite: string;
    target: IMetaIdentifierHolder;
    nodeLimit: number;
    edgeLimit: number;
    saveMode: string;
}