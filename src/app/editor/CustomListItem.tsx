// CustomListItem.ts
import {  NodeViewRenderer, NodeViewRendererProps } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import ListItem from '@tiptap/extension-list-item';

// Types for the Redux dispatch, etc.
import { Dispatch } from '@reduxjs/toolkit';

interface CustomListItemOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: Dispatch<any>;
  onBulletClick?: (content: string) => void;
}

/**
 * CustomListItem extends the default ListItem node from StarterKit
 * to provide a clickable bullet.
 */
export const CustomListItem = ListItem.extend<CustomListItemOptions>({
  name: 'customListItem',

  addOptions() {
    return {
      ...this.parent?.(),
      dispatch: (action) => action,
      onBulletClick: undefined,
    };
  },

  /**
   * We'll create a NodeView so we can attach a clickable bullet.
   */
  addNodeView(): NodeViewRenderer {
    return (props: NodeViewRendererProps) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      const { node, getPos, editor, HTMLAttributes, selected, updateAttributes, deleteNode } = props as NodeViewRendererProps & { selected: boolean; updateAttributes: (attrs: Record<string, any>) => void; deleteNode: () => void; };
      // Create top-level container for list item
      const container = document.createElement('li');
      const bullet = document.createElement('span');
      const content = document.createElement('div');

      // Style the bullet
      bullet.textContent = '•'; // or use a real bullet symbol, CSS, etc.
      bullet.style.cursor = 'pointer';
      bullet.style.marginRight = '8px';
      bullet.style.userSelect = 'none';

      // Listen for clicks on the bullet
      bullet.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Gather the text content of this list item’s content
        // (TipTap renders text in child nodes)
        const listItemText = node.textContent.trim();

        console.log('Bullet clicked for item:', listItemText);

        // Optionally call a user-defined callback
        if (this.options.onBulletClick) {
          this.options.onBulletClick(listItemText);
        }

        // Example: dispatch a Redux action or navigate
        this.options.dispatch({
          type: 'title/setTitle',
          payload: listItemText,
        });

        // Example: Clear the editor and show only this bullet’s content
        // You might do something like:
        editor.commands.setContent(`<ul><li>${listItemText}</li></ul>`);
      });

      // Put the actual list item text in content
      content.classList.add('custom-list-item-content');

      // Let TipTap handle rendering the list item’s children in `content`
      Object.assign(container, { className: 'custom-list-item' });

      // We still want all default attributes (data-type, etc.)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const attrs = mergeAttributes(HTMLAttributes);

      // Attach bullet + content to container
      container.appendChild(bullet);
      container.appendChild(content);

      // We return a NodeView object so TipTap can render child nodes in content
      return {
        dom: container,
        contentDOM: content,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        update(updatedNode) {
          // Called when the node updates (e.g., typing)
          // We can do logic if needed
          return true;
        },
      };
    };
  },
});
