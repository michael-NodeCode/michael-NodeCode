import {
  Block,
  BlockNoteEditor,
  filterSuggestionItems,
  PartialBlock,
} from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useEffect, useState } from 'react';
import { HiOutlineGlobeAlt } from 'react-icons/hi';
import { invoke } from '@tauri-apps/api/core';

const insertHelloWorldItem = (editor: BlockNoteEditor) => ({
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

const insertNode = (editor: BlockNoteEditor) => ({
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

const searchForNode = (nodeName: string) => {
  console.log(`Searching for node: ${nodeName}`);
  return [{ title: `Node found for: ${nodeName}` }];
};

const getCustomSlashMenuItems = (
  editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  insertHelloWorldItem(editor),
  insertNode(editor),
];
const getCustomSquareBracketMenuItems = (
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
            content: [
              // {
              //   type: 'text',
              //   text: `Node: ${result.title}`,
              // },
            ],
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
      const newNodeBlock: PartialBlock = {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: `New Node: ${query}`,
            styles: { bold: true, textColor: 'green' },
          },
        ],
      };

      editor.insertBlocks(
        [newNodeBlock],
        editor.getTextCursorPosition().block,
        'after'
      );

      insertNode(editor);
    },
    group: 'Create New Node',
    icon: <HiOutlineGlobeAlt size={18} />,
  });

  return suggestionItems;
};
type RequiredInitialBlocks = {
  content: string;
  type: string;
};
export default function MainEditor({
  heading,
  subHeading,
  initialBlocks,
}: {
  heading: string;
  subHeading: string;
  initialBlocks: RequiredInitialBlocks[];
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [query, setQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [text, setText] = useState('');

  const [isSquareBracketMenuVisible, setSquareBracketMenuVisible] =
    useState(false);

  console.log(query, 'The query string to search for');

  useEffect(() => {
    const saveData = async () => {
      if (heading && subHeading && blocks.length > 0) {
        try {
          const formattedBlocks = blocks.map((block) => JSON.stringify(block));
          const res = await invoke('save_node', {
            heading,
            subheading: subHeading,
            blocks: formattedBlocks,
          });
          console.log('Response from save_node:', res);
          setText(res as string);
        } catch (error) {
          console.error('Error sending data to backend:', error);
        }
      }
    };
    saveData();
  }, [heading, subHeading, blocks]);

  const editor = useCreateBlockNote({
    initialContent: initialBlocks as PartialBlock[],
  });

  useEffect(() => {
    const handleContentChange = () => {
      // const textCursorPosition = editor.getTextCursorPosition();
      const currentText = '';
      // textCursorPosition.block?.content
      // .map((content) => content.text)
      // .join('') || '';

      const matches = currentText.match(/\[(.*?)\]/);
      if (matches) {
        const queryText = matches[1];
        setQuery(queryText);

        searchForNode(queryText);
      }

      setBlocks(editor.document);
    };

    editor.onChange(handleContentChange);

    return () => {
      editor.onChange(handleContentChange);
    };
  }, [editor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const lastChar = event.key;

      if (lastChar === '[') {
        setSquareBracketMenuVisible(true);
      }

      if (lastChar === ']') {
        setSquareBracketMenuVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);
  return (
    <div className={'wrapper'}>
      <p className="text-white text-3xl">{'Saved'}</p>
      <div className={'item'}>
        <BlockNoteView
          editor={editor}
          slashMenu={false}
          formattingToolbar={false}
          onChange={() => {
            setBlocks(editor.document);
          }}
          className="w-full my-4 h-full"
        >
          <SuggestionMenuController
            triggerCharacter={'/'}
            getItems={async (query) =>
              filterSuggestionItems(getCustomSlashMenuItems(editor), query)
            }
          />
          {isSquareBracketMenuVisible && (
            <SuggestionMenuController
              triggerCharacter={'['}
              getItems={async (query) =>
                filterSuggestionItems(
                  getCustomSquareBracketMenuItems(editor, query),
                  query
                )
              }
            />
          )}
        </BlockNoteView>
      </div>
    </div>
  );
}
