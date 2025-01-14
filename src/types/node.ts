/* eslint-disable @typescript-eslint/no-explicit-any */

export interface NodeData {
    id: string;
    type: string;
    props: Record<string, any>;
    content: any[];
    children: any[];
}

export interface NodeState {
    node_data: NodeData[];
    left_sibling_node_id?: string;
    parent_node_id?: string;
}

export enum NodeBlockTypes {
    DATE = "date",
    RICH_TEXT = "rich_text",
    TASK = "task",
}

export interface NodeBlock {
    node_id: string;
    node_block_type: NodeBlockTypes;
    content?: string | Date;
    parent_node_id?: string;
    left_sibling_node_id?: string;
    node_type_content_json?: NodeData;
    additional_props?: Record<string, any>;
    node_mentions?: string[];
    vector?: number[];
}

export interface DateNode extends NodeBlock {
    node_block_type: NodeBlockTypes.DATE;
    content: Date;
}

export interface RichTextNode extends NodeBlock {
    node_block_type: NodeBlockTypes.RICH_TEXT;
    node_type_content_json: NodeData;
}

export interface TaskNode extends NodeBlock {
    node_block_type: NodeBlockTypes.TASK;
    content: string;
    additional_props: {
        due_date: string;
        assigned_to: string;
    };
}
