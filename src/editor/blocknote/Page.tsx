/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import {
  DragHandleButton,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import {
  getCustomSlashMenuItems,
  getCustomSquareBracketMenuItems,
  searchForNode,
} from '@utils/editor';
import { invoke } from '@tauri-apps/api/core';
import { BlockNoteView } from '@blocknote/mantine';
import { Block, filterSuggestionItems } from '@blocknote/core';
import { NavigateButton } from '@components/editor/NaviagetButton';
import { buildNodeStructure } from '@utils/build-node-structure';

export default function Page({
  currentDate,
  title,
}: {
  currentDate: string;
  title: string | null;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [query, setQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [isSquareBracketMenuVisible, setSquareBracketMenuVisible] =
    useState(false);

  console.log(
    query,
    'The query string to search for',
    'and title being:',
    title
  );

  useEffect(() => {
    const saveData = async () => {
      if (currentDate && blocks.length > 0) {
        try {
          const finalData = buildNodeStructure(
            currentDate,
            blocks as any
          );

          console.log('Final data structure:', finalData);
          const response = await invoke<string>('insert_node_blocks', {
            blocks: finalData,
          });
          console.log('Insert success:', response);
        } catch (error) {
          console.error('Error sending data to backend:', error);
        }
      }
    };
    saveData();
  }, [currentDate, blocks]);

  const editor = useCreateBlockNote({});

  useEffect(() => {
    const handleContentChange = () => {
      const currentText = '';

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
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '@') {
        const selection = window.getSelection();
        const anchorNode = selection?.anchorNode;

        if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
          const text = anchorNode.nodeValue;
          const caretOffset = selection.anchorOffset;

          if (caretOffset > 0 && text?.[caretOffset - 1] === ' ') {
            console.log('User typed "@" after a space');

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setMenuPosition({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
            });

            setShowMenu(true);
          }
        }
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('ESC pressed, hiding context menu');
        setShowMenu(false);
      }
    };

    const editorContainer = document.querySelector('.bn-container');
    if (editorContainer) {
      editorContainer.addEventListener(
        'keydown',
        handleKeyPress as EventListener
      );
    }

    window.addEventListener('keydown', handleEscKey);

    return () => {
      if (editorContainer) {
        editorContainer.removeEventListener(
          'keydown',
          handleKeyPress as EventListener
        );
      }
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const [answer, setAnswer] = useState<string | null>(null);
  async function greetSomeone() {
    const msg = await invoke<string>('greet', { name: 'Alice' });
    console.log(msg);
    setAnswer(msg);
  }

  async function addPerson() {
    try {
      const result = await invoke<string>('create_person');
      console.log(result);
      setAnswer(result);
    } catch (error) {
      console.error('Error creating person:', error);
    }
  }

  async function updateAndRead() {
    try {
      const result = await invoke<string>('update_and_select');
      console.log(result);
      setAnswer(result);
    } catch (error) {
      console.error('Error updating/selecting:', error);
    }
  }

  async function fetchAllBlocks() {
    try {
      // const block = await invoke<any | null>('get_node_block_by_id', {
      //   blockId: '79867f88-d964-4e92-8549-d83f9efa14e0',
      // });
      const blocks = await invoke<any[]>('get_all_node_blocks');
      // console.log('All blocks:', block);
      console.log('All blocks:', blocks);
      // setAnswer(JSON.stringify(block, null, 2));
      setAnswer(JSON.stringify(blocks, null, 2));
    } catch (err) {
      console.error('Error fetching all blocks:', err);
    }
  }
  return (
    <div className={'wrapper'}>
      <p className="text-white text-xl w-full p-2">{answer}</p>
      <div className="flex flex-row gap-4 justify-center items-center">
        <button
          type="submit"
          className="p-2 bg-red-500 rounded-md text-white"
          onClick={greetSomeone}
        >
          Greet
        </button>
        <button
          type="submit"
          className="p-2 bg-green-500 rounded-md text-white"
          onClick={addPerson}
        >
          Add Person
        </button>
        <button
          type="submit"
          className="p-2 bg-blue-500 rounded-md text-white"
          onClick={updateAndRead}
        >
          Updaet & Read
        </button>
        {/**
        <button
          type="submit"
          className="p-2 bg-yellow-500 rounded-md text-white"
          onClick={fetchAllBlocks}
        >
          Fetch All Blocks
        </button>
         */}
      </div>
      <div className={'item'}>
        <BlockNoteView
          editor={editor}
          slashMenu={false}
          formattingToolbar={false}
          onChange={() => {
            setBlocks(editor.document);
          }}
          sideMenu={false}
          className="w-full my-4 h-full flex-1"
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
          <SideMenuController
            sideMenu={(props) => (
              <SideMenu {...props}>
                <NavigateButton {...props} />
                <DragHandleButton {...props} />
              </SideMenu>
            )}
          />
          {showMenu && (
            <div
              style={{ top: menuPosition.top, left: menuPosition.left }}
              className="absolute bg-gray-700 border border-gray-300 rounded-md shadow-md z-[999] p-2"
            >
              <div
                onClick={() => console.log('Option 1 clicked')}
                className="px-2 py-1 cursor-pointer border-b border-gray-300 hover:bg-gray-600"
              >
                Option 1
              </div>
              <div
                onClick={() => console.log('Option 2 clicked')}
                className="px-2 py-1 cursor-pointer border-b border-gray-300 hover:bg-gray-600"
              >
                Option 2
              </div>
              <div
                onClick={() => console.log('Option 3 clicked')}
                className="px-2 py-1 cursor-pointer hover:bg-gray-600"
              >
                Option 3
              </div>
            </div>
          )}

          {/* <SideMenuController
            sideMenu={(props) => (
              <SideMenu
                {...props}
                dragHandleMenu={(props) => (
                  <DragHandleMenu {...props}>
                    <RemoveBlockItem {...props}>Delete</RemoveBlockItem>
                    <BlockColorsItem {...props}>Colors</BlockColorsItem>
                    <ResetBlockTypeItem {...props}>
                      Reset Type
                    </ResetBlockTypeItem>
                    <NavigateToBlock {...props}>Navigate</NavigateToBlock>
                  </DragHandleMenu>
                )}
              />
            )}
          /> */}
        </BlockNoteView>
      </div>
      {/* <div>Document/Response JSON:</div>
        <div className="bg-red-400 text-black">
          <pre>
            <code>{JSON.stringify(initialBlocks, null, 2)}</code>
          </pre>
        </div>
        <div>Blocks JSON:</div>
        <div className="bg-red-400 text-black">
          <pre>
            <code>{JSON.stringify(blocks, null, 2)}</code>
          </pre>
        </div> */}
    </div>
  );
}
