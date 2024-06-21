export interface INode {
    hIType: string;
    id: string;
    label: string;
    nBPropertyId: string;
    nHPropertyId: string;
    nIPropertyId: string;
    niType: string;
    nodeIcon: string;
    nodeIndex: string;
    nodeName: string;
    nodeProperties: string;
    nodeSize: string;
    nodeType: string;
}

export interface IEdge {
    id?: any;
    eHPropertyId: string;
    edgeIndex: string;
    edgeName: string;
    edgeProperties: string;
    edgeSequence: string;
    edgeType: string;
    value: string;
    sourceDisplayId: string;
    targetDisplayId: string;
}

export interface ISankey {
    nodes: INode[];
    edges: IEdge[];
}