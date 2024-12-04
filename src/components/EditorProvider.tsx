'use client';

import React, { useMemo } from 'react';
import { EditorContext } from '../editor/context';
import { DocCollection, Schema } from '@blocksuite/store';
import { AffineEditorContainer } from '@blocksuite/presets';
import { AffineSchemas } from '@blocksuite/blocks';

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const contextValue = useMemo(() => {
    const schema = new Schema().register(AffineSchemas);
    const collection = new DocCollection({ schema });
    collection.meta.initialize();

    const doc = collection.createDoc({ id: 'page1' });
    doc.load(() => {
      const pageBlockId = doc.addBlock('affine:page', {});
      doc.addBlock('affine:surface', {}, pageBlockId);
      const noteId = doc.addBlock('affine:note', {}, pageBlockId);
      doc.addBlock('affine:paragraph', {}, noteId);
    });

    const editor = new AffineEditorContainer();
    editor.doc = doc;

    return { editor, collection };
  }, []);

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};