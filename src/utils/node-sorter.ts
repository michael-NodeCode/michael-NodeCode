/* eslint-disable @typescript-eslint/no-explicit-any */
export function sortBlocksByLeftSiblingAndReturnNodeJson(blocks: any[]): any[] {
    const validBlocks = blocks.filter((b) => b.node_type_content_json);

    const idToBlock: Record<string, any> = {};
    for (const block of validBlocks) {
      idToBlock[block.node_id] = block;
    }

    const roots = validBlocks.filter((b) => {
      const lsId = b.left_sibling_node_id;
      return !lsId || !idToBlock[lsId];
    });

    const sortedBlocks: any[] = [];

    for (const root of roots) {
      sortedBlocks.push(root);

      let current = root;
      while (true) {
        const nextBlock = validBlocks.find(
          (b) => b.left_sibling_node_id === current.node_id
        );
        if (!nextBlock) break;
        sortedBlocks.push(nextBlock);
        current = nextBlock;
      }
    }

    return sortedBlocks.map((block) => block.node_type_content_json);
  }
