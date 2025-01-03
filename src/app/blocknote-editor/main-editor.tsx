/* eslint-disable @typescript-eslint/no-unused-vars */
import { Block, filterSuggestionItems } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import {
  DragHandleButton,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useEffect, useState } from 'react';
import { NavigateButton } from './editor/NaviagetButton';
import {
  getCustomSlashMenuItems,
  getCustomSquareBracketMenuItems,
  searchForNode,
} from '@utils/editor';

export default function NewEditor({
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

  console.log(query, 'The query string to search for');

  console.log(blocks, 'The updated blocks');

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
  return (
    <div className={'wrapper'}>
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
        </BlockNoteView>
      </div>
    </div>
  );
}
