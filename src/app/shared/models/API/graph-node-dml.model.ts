import { GraphProperty } from "./graph-property.model";

export interface IGraphNodeDML{
 label:string;
 graphProperty:GraphProperty[];
}

export class GraphNodeDML implements IGraphNodeDML {
    label: string;
    graphProperty:GraphProperty[];
}