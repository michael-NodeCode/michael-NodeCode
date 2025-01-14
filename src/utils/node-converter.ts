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


// in place of taking single node as argument now we will pass whole array of nodes and convert them in to list of partial blocks
export function nodeDataToPartialBlockList(
  nodes: NodeData[]
): PartialBlock<DefaultBlockSchema>[] {
  return nodes.map((node) => nodeDataToPartialBlock(node));
}