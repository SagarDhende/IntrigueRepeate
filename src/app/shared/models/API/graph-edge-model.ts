import { IAttributeRefHolder } from "./atribute-ref-holder-model";
import { IHighlight } from "./highlight.model";
import { IMetaIdentifierHolder } from "./meta-identifier-holder-model";

export interface IGraphEdge {
    edgeId: string;
    edgeType: string;
    edgeName: string;
    edgeSource: IMetaIdentifierHolder;
    edgeProperties: IAttributeRefHolder[];
    sourceNodeId: IAttributeRefHolder;
    sourceNodeType: string;
    targetNodeId: IAttributeRefHolder;
    targetNodeType: string;
    highlightInfo: IHighlight;
    sourceDisplayId: string;
    targetDisplayId: string;
}