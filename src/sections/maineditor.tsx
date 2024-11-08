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

export default function MainEditor({
  heading,
  subHeading,
}: {
  heading: string;
  subHeading: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [query, setQuery] = useState('');
  const [text, setText] = useState('');
  const [isSquareBracketMenuVisible, setSquareBracketMenuVisible] =
    useState(false);

  const editor = useCreateBlockNote({});

  console.log(query, 'The query string to search for');

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

  useEffect(() => {
    console.log(
      JSON.stringify(blocks, null, 2),
      'The Context sent to backend with keys and data, to analyze and save to database for node named',
      heading,
      subHeading
    );

    const saveData = async () => {
      if (heading && subHeading && blocks) {
        try {
          const formattedBlocks = blocks.map((block) => JSON.stringify(block));

          const res = await invoke('store_nodes', {
            heading,
            subheading: subHeading,
            block: formattedBlocks,
          });

          setText(res as string);
        } catch (error) {
          console.error('Error sending data to backend:', error);
        }
      }
    };

    saveData();
  }, [heading, subHeading, blocks]);

  useEffect(() => {
    console.log('The heading and subheading', heading, subHeading);
    if (heading && subHeading) {
      const getData = async () => {
        try {
          const res = await invoke('get_node', {
            heading,
            subheading: subHeading,
          });

          if (res) {
            const blocks = JSON.parse(res as string);
            setBlocks(blocks);
          }
        } catch (error) {
          console.error('Error getting data from backend:', error);
        }
      };

      getData();
    }
  }, [heading, subHeading]);
  return (
    <div className={'wrapper'}>
      <p className="text-white text-3xl">{text}</p>
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
