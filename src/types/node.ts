/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NodeData {
    id: string;
    type: string;
    props: Record < string, any > ;
    content: any[];
    children: any[];
}

export interface NodeState {
    nodeData: NodeData[];
}

// This will be stored in DB
export interface NodeBlock {
    id: string;
    type: string;
    content: any[];
    props: Record < string, any > ;
}

export enum NodeBlockTypes {
}