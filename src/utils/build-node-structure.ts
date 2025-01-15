/* eslint-disable @typescript-eslint/no-explicit-any */

// import {
//     v4 as uuidv4
// } from 'uuid';
import {
    DateNode,
    NodeBlock,
    NodeBlockTypes,
    NodeData,
} from '../types/node';


export function buildNodeStructure(
    rootDateString: string,
    blocks: NodeData[]
): NodeBlock[] {
    // NOTE: for now we are saving date (root node as root id for easy access)
    const rootId = rootDateString;
    const rootNode: DateNode = {
        node_id: rootId,
        node_block_type: NodeBlockTypes.DATE,
        content: new Date(rootDateString),
        parent_node_id: undefined,
        left_sibling_node_id: undefined,
        node_type_content_json: undefined,
        additional_props: {},
        node_mentions: [],
        vector: [],
    };


    let previousSiblingId: string | undefined = undefined;
    blocks = blocks && blocks.length > 0 ? blocks.filter((block) => block.id !== 'loading-placeholder') : [];
    const childNodes: NodeBlock[] = blocks.map((block) => {
        const childId = block.id;
        const nodeBlockType = getNodeBlockType(block.type);
        const childNode: NodeBlock = {
            node_id: childId,
            node_block_type: nodeBlockType,
            parent_node_id: rootId,
            left_sibling_node_id: previousSiblingId,
            content: undefined,
            node_type_content_json: block,
            additional_props: {},
            node_mentions: [],
            vector: [],
        };


        if (nodeBlockType === NodeBlockTypes.TASK) {
            childNode.content = getCombinedText(block);
            childNode.additional_props = {
                assignedTo: 'aman',
                dueDate: '10th Jan 2025',
            };
        } else if (nodeBlockType === NodeBlockTypes.RICH_TEXT) {
            childNode.content = getCombinedText(block);
        }


        previousSiblingId = childId;
        return childNode;
    });

    return [rootNode, ...childNodes];
}
function getNodeBlockType(originalType: string): NodeBlockTypes {
    switch (originalType) {
        case 'paragraph':
        case 'bulletListItem':
            return NodeBlockTypes.RICH_TEXT;
        case 'checkListItem':
            return NodeBlockTypes.TASK;
        default:
            return NodeBlockTypes.RICH_TEXT;
    }
}

function getCombinedText(block: NodeData): string {
    if (Array.isArray(block.content)) {
        return block.content
            .map((c: any) => (typeof c.text === 'string' ? c.text : ''))
            .join(' ');
    }
    return '';
}

export function buildSingleNodeStructure(block: NodeData, parent_node_id: string | undefined, left_sibling_node_id: string| undefined): NodeBlock | null {
    const nodeBlockType = getNodeBlockType(block.type);
    const content = getCombinedText(block);
    if (content === '') {
        return null;
    }

    const node: NodeBlock = {
        node_id: block.id,
        node_block_type: nodeBlockType,
        parent_node_id: parent_node_id,
        left_sibling_node_id: left_sibling_node_id,
        content: content,
        node_type_content_json: block,
        additional_props: {},
        node_mentions: [],
        vector: [],
    };

    if (nodeBlockType === NodeBlockTypes.TASK) {
        node.content = getCombinedText(block);
        node.additional_props = {
            assignedTo: 'aman',
            dueDate: '10th Jan 2025',
        };
    } else if (nodeBlockType === NodeBlockTypes.RICH_TEXT) {
        node.content = getCombinedText(block);
    }

    return node;
}