'use client';

import React, { useEffect } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import dynamic from 'next/dynamic';

import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setDate } from '@redux/dateSlice';
import { setTitle } from '@redux/titleSlice';

import { CustomListItem } from './editor/CustomListItem';
import InternalLink from './editor/InternalLink';

import Header from '@components/header';
import Sidebar from './components/Sidebar';

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
      CustomListItem.configure({
        dispatch,
        onBulletClick: (itemText: string) => {
          console.log('Custom bullet click callback:', itemText);
          dispatch(setDate(itemText));
          dispatch(setTitle(itemText));
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
    content: `
      <ul class="list-none p-0 m-0">
        <li>Item A</li>
        <li>Item B</li>
        <li>Click me</li>
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
        <div className="shadow-sm bg-primary rouneded-lg h-full w-full p-2">
          <EditorContentWithNoSSR
            editor={editor}
            className="prose max-w-none text-body text-white border-2 border-gray-400 border-solid rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default App;
