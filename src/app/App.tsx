'use client';

import React, { useEffect } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
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
      StarterKit,
      InternalLink.configure({
        dispatch,
        getState: () => ({
          currentDate,
          title,
        }),
      }),
    ],
    content: `<p> </p>`,
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
        <div className="border-2 border-solid border-primary w-full p-4 pt-0 rounded-lg text-body">
          <div className="shadow-sm bg-primary text-white text-lg p-2 mt-4 focus-within:ring-2 focus-within:ring-primary h-full">
            <EditorContentWithNoSSR
              editor={editor}
              className="prose max-w-none border rounded-lg p-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
