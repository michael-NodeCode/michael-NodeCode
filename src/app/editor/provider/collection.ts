import { type BlobSource } from '@blocksuite/sync';
import { AffineSchemas } from '@blocksuite/blocks';
import { invoke } from '@tauri-apps/api/core';
import { DocCollection, Schema } from '@blocksuite/store';

export function createCollection(dbId: string, id: string) {
    class ClientBlobSource implements BlobSource {
      readonly = false;
      name = 'client';
  
      async get(key: string): Promise<Blob | null> {
        const blobData = await invoke<number[]>('get_blob', { dbId, key });
        if (blobData) {
          return new Blob([new Uint8Array(blobData)]);
        }
        return null;
      }
  
      async set(key: string, value: Blob) {
        const arrayBuffer = await value.arrayBuffer();
        const blobData = Array.from(new Uint8Array(arrayBuffer));
        await invoke('insert_blob', { dbId, key, blob: blobData });
        return key;
      }
  
      async delete(key: string): Promise<void> {
        await invoke('delete_blob', { dbId, key });
      }
  
      async list() {
        return invoke<string[]>('list_blobs', { dbId });
      }
    }
  
    const schema = new Schema().register(AffineSchemas);
  
    const collection = new DocCollection({
      schema,
      id,
      blobSources: {
        main: new ClientBlobSource(),
      },
    });
    return collection;
  }
  
 export function createFirstDoc(collection: DocCollection) {
    console.log('First doc created');
    const doc = collection.createDoc();
    doc.load(() => {
      const pageBlockId = doc.addBlock('affine:page', {});
      doc.addBlock('affine:surface', {}, pageBlockId);
      const noteId = doc.addBlock('affine:note', {}, pageBlockId);
      doc.addBlock('affine:paragraph', {}, noteId);
    });
    doc.resetHistory();
  }