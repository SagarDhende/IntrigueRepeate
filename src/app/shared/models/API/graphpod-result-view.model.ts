import { IGraphEdgeView } from "./graph-edge-view.model";
import { IGraphNodeView } from "./graph-node-view.model";

export interface GraphpodResultView {
    nodes: IGraphNodeView[];
    edges: IGraphEdgeView[];
}
