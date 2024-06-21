
export class Nodes {
    id: string;
    nodeId:string;
    shape: string;
    size: number
    label: string;
    nodeName: string;
    nodeType: string;
    nodeTypeList:any[];
    otherNodeType:string
    initialNodeType:string;
    updatedNodeType:string;
    icon: any;
    nodeProperties: any[];
    nodeIndex: string;
    color: any;
    image?: string;
    children: {
        nodes: Nodes[];
        edges: Edges[];
    }
    constructor() { }
}

export class Edges {
    id:string;
    edgeId: string;
    from: string;
    to: string;
    arrows: string
    color: any;
    label: string;
    title: string;
    edgeProperties: string[];
    edgeType: string;
    edgeName: string;
    edgeIndex:number;
    smooth:any
    constructor() { };
}

export interface IVizNetworkStyle {
    height: string
}

export class VizNetworkResult {
    nodes: Nodes[];
    edges: Edges[];
}
