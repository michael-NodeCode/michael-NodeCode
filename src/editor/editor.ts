'use client';

import { AffineEditorContainer } from '@blocksuite/presets'
import { DocCollection } from '@blocksuite/store';
import { createContext, useContext } from 'react';

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
}

export const EditorContext = createContext<EditorContextType | null>(null);

export function useEditor() {
  return useContext(EditorContext);
}

// export function initEditor() {
//   const schema = new Schema().register(AffineSchemas);
//   const collection = new DocCollection({ schema });
//   collection.meta.initialize();

//   const doc = collection.createDoc({ id: 'page1' });
//   doc.load(() => {
//     const pageBlockId = doc.addBlock('affine:page', {});
//     doc.addBlock('affine:surface', {}, pageBlockId);
//     const noteId = doc.addBlock('affine:note', {}, pageBlockId);
//     doc.addBlock('affine:paragraph', {}, noteId);
//   });

//   // Only create editor if in browser environment
//   let editor: AffineEditorContainer | null = null;
//   if (typeof window !== 'undefined') {
//     editor = new AffineEditorContainer();
//     editor.doc = doc;
//   }

//   return { editor, collection };
// }