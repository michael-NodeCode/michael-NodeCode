'use client';

import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';
import { createContext, useContext } from 'react';

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
}

export const EditorContext = createContext<EditorContextType>({
  editor: null,
  collection: null
});

export function useEditor() {
  return useContext(EditorContext);
}