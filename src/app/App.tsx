'use client';

import React, { useEffect } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import dynamic from 'next/dynamic';

import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setTitle } from '@redux/titleSlice';

import Header from '@components/header';
import Sidebar from '@components/Sidebar';

import InternalLink from '@editor/InternalLink';
import { CollapsibleListItem } from '@editor/CollapsableListItem';

const EditorContentWithNoSSR = dynamic(
  () => import('@tiptap/react').then((mod) => mod.EditorContent),
  {
    ssr: false,
  }
);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDate = useAppSelector((state) => state.date.currentDate);
  const title = useAppSelector((state) => state.title.title);

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        listItem: false,
      }),
      CollapsibleListItem.configure({
        dispatch,
        onNavigate: (text) => {
          dispatch(setTitle(text));
        },
      }),
      InternalLink.configure({
        dispatch,
        getState: () => ({
          currentDate,
          title,
        }),
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none text-white rounded-lg border-2 border-gray-400 border-solid md:min-w-[90vw] min-w-full nested-list',
      },
    },
    content: `
    <ul>
      <li>
        
      </li>
    </ul>
  `,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      console.log('Editor Content as JSON:', json);
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-white">
      <Header />
      <Sidebar />
      <div className="bg-primary min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-1 text-white">
        <div className="shadow-sm bg-primary rouneded-lg h-full w-full">
          <EditorContentWithNoSSR editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default App;
