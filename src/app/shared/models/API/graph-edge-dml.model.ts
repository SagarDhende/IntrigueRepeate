import { GraphProperty } from "./graph-property.model";

export interface IGraphEdgeDML {
    label:string;
    sourceLabel:string;
    targetLabel:string;
    id:string;
    sourceNode:GraphProperty[];
    targetNode:GraphProperty[];
    edgeProperty:GraphProperty[];
}

export class GraphEdgeDML implements IGraphEdgeDML{
  label: string;
  sourceLabel: string;
  targetLabel: string;
  id: string;
  sourceNode: GraphProperty[];
  targetNode: GraphProperty[];
  edgeProperty: GraphProperty[];
}
