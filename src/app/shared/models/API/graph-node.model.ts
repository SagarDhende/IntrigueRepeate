import { IAttributeRefHolder } from "./atribute-ref-holder-model";
import { IHighlight } from "./highlight.model";
import { IMetaIdentifierHolder } from "./meta-identifier-holder-model";

export interface IGraphNodeModel {
    nodeId: IAttributeRefHolder;
    nodeType: string;
    nodeIcon: string;
    nodeName: IAttributeRefHolder;
    nodeSize: IAttributeRefHolder;
    nodeSource: IMetaIdentifierHolder;
    nodeProperties: IAttributeRefHolder[];
    nodeBackgroundColor: string;
    displayId: string;
    nodeIconInfo: IHighlight;
    nodeBackgroundInfo: IHighlight;
    highlightInfo: IHighlight;

}