import { DocCollection, type Y } from '@blocksuite/store';

import { invoke } from '@tauri-apps/api/core';
import logging from '@utils/logger';
import { createCollection, createFirstDoc } from './collection';

export class CollectionProvider {
  collection!: DocCollection;

  private constructor(private dbId: string) {}

  static async init() {
    logging.info('Initializing collection provider');
    const dbId = '07th December 2024';
  
      logging.info('Initializing empty collection');
      await invoke<string>('init_db');
      return CollectionProvider._initEmptyCollection(dbId);
  }

  static async loadData(dbId: string) {
    return CollectionProvider._loadCollectionFromDb(dbId);
  }

  private static async _initEmptyCollection(dbId: string) {
    logging.info('Initializing empty collection with dbId:' + dbId);
    const provider = new CollectionProvider(dbId);
    const id = `${Math.random()}`.slice(2, 12);
    provider.collection = createCollection(dbId, id);
    provider._connectCollection();
    provider.collection.meta.initialize();

    logging.info('Inserting root doc with id:' + id + ' to dbId:' + dbId);
    await invoke('insert_root', { dbId, docId: id });
    createFirstDoc(provider.collection);
    return provider;
  }

  private static async _loadCollectionFromDb(dbId: string) {
    const provider = new CollectionProvider(dbId);
    // fix this to look for all ids in the db
    const id = await invoke<string>('get_root_doc_id', { dbId });
    console.log(id, 'id');
    if (!id) throw new Error('No collection found in database');

    provider.collection = createCollection(dbId, id);
    await provider._applyUpdates(provider.collection.doc);
    provider.collection.docs.forEach(async (doc) => {
      await provider._applyUpdates(doc.spaceDoc);
      doc.load();
      provider._connectSubDoc(doc.spaceDoc);
    });

    provider._connectCollection();
    return provider;
  }

  private _connectCollection() {
    const { collection, dbId } = this;
    collection.doc.on('update', (update) => {
      invoke('insert_update', { dbId, docId: collection.id, update: Array.from(update) });
    });

    collection.doc.on('subdocs', (subdocs) => {
      subdocs.added.forEach((doc: Y.Doc) => {
        invoke('insert_doc', { dbId, docId: doc.guid, rootDocId: collection.id });
        this._connectSubDoc(doc);
      });
    });
  }

  private _connectSubDoc(doc: Y.Doc) {
    const { dbId } = this;
    doc.on('update', (update) => {
      invoke('insert_update', { dbId, docId: doc.guid, update: Array.from(update) });
    });
  }

  private async _applyUpdates(doc: Y.Doc) {
    const updates = await invoke<number[][]>('get_updates', { dbId: this.dbId, docId: doc.guid });
    updates.forEach((update) => {
      DocCollection.Y.applyUpdate(doc, new Uint8Array(update));
    });
  }
}
