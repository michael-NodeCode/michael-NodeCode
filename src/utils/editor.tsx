/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Block, BlockNoteEditor, PartialBlock } from '@blocknote/core';
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import { HiOutlineGlobeAlt } from 'react-icons/hi';

export const insertHelloWorldItem = (editor: BlockNoteEditor) => ({
  title: 'Insert reference Section below',
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;

    const helloWorldBlock: PartialBlock = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Nothing in reference now',
          styles: { bold: true, textColor: 'green' },
        },
      ],
    };

    editor.insertBlocks([helloWorldBlock], currentBlock, 'after');
  },
  aliases: ['reference', 'rf'],
  group: 'Manual Commands',
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: 'Used to insert a block with references below.',
});

export const insertNode = (editor: BlockNoteEditor) => ({
  title: 'Add A new Node',
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;

    const helloWorldBlock: PartialBlock = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Added something to Node',
          styles: { bold: true, textColor: 'green' },
        },
      ],
    };

    editor.insertBlocks([helloWorldBlock], currentBlock, 'after');
  },
  aliases: ['node', 'nd'],
  group: 'Manual Commands',
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: 'Used to insert a block with references below.',
});

export const searchForNode = (nodeName: string) => {
  console.log(`Searching for node: ${nodeName}`);
  return [{ title: `No Node found for: ${nodeName}` }];
};

export const getCustomSlashMenuItems = (
  editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  insertHelloWorldItem(editor),
  insertNode(editor),
];
export const getCustomSquareBracketMenuItems = (
  editor: BlockNoteEditor,
  query: string
): DefaultReactSuggestionItem[] => {
  const searchResults = searchForNode(query);

  const suggestionItems = searchResults.map((result) => ({
    title: result.title,
    onItemClick: () => {
      editor.insertBlocks(
        [
          {
            type: 'paragraph',
            content: [],
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      );
    },
    group: 'Search Results',
    icon: <HiOutlineGlobeAlt size={18} />,
  }));

  suggestionItems.push({
    title: `Create new node: ${query}`,
    onItemClick: () => {
      // const newNodeBlock: PartialBlock = {
      //   type: 'paragraph',
      //   content: [
      //     {
      //       type: 'text',
      //       text: `New Node: ${query}`,
      //       styles: { bold: true, textColor: 'green' },
      //     },
      //   ],
      // };

      // editor.insertBlocks(
      //   [newNodeBlock],
      //   editor.getTextCursorPosition().block,
      //   'after'
      // );

      // insertNode(editor);
      console.log('New node will be created!');
    },
    group: 'Create New Node',
    icon: <HiOutlineGlobeAlt size={18} />,
  });

  return suggestionItems;
};


export  function removeAllNodesFromEditorAndInsertLoadingPlaceholder(editor: any) {
  const allEditorBlocks: Block[] = editor.document;
  const allEditorBlocksIds = allEditorBlocks.map((b) => b.id);
  const rootBlock = {
    id: 'loading-placeholder',
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Loading…',
        styles: {},
      },
    ],
  };
  editor.insertBlocks([rootBlock], allEditorBlocksIds[0], 'after');
  editor.removeBlocks(allEditorBlocksIds);
}