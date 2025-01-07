/* eslint-disable @typescript-eslint/no-explicit-any */
import {  type PartialBlock,
    type DefaultBlockSchema } from "@blocknote/core";
import { NodeData } from "../types/node";

export function nodeDataToPartialBlock(
  node: NodeData
): PartialBlock<DefaultBlockSchema> {
  return {
    id: node.id,
    type: node.type as any, 
    props: { ...node.props },
    content: node.content,
    children: node.children?.map((child) => nodeDataToPartialBlock(child)),
  };
}
