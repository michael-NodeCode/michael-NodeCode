/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/react';
import { Dispatch } from '@reduxjs/toolkit';
import ListItem from '@tiptap/extension-list-item';

interface CustomListItemOptions {
  dispatch: Dispatch<any>;
  onBulletClick?: (content: string) => void;
}

export const CustomListItem = ListItem.extend<CustomListItemOptions>({
  name: 'listItem',

  addOptions() {
    return {
      ...this.parent?.(),
      dispatch: (action) => action,
      onBulletClick: undefined,
    };
  },

  addNodeView(): NodeViewRenderer {
    return (props: NodeViewRendererProps) => {
      const { editor } = props;

      let currentNode = props.node;

      const container = document.createElement('li');
      container.style.display = 'flex';
      container.style.alignItems = 'center';

      const bullet = document.createElement('span');
      bullet.textContent = '•';
      bullet.style.cursor = 'pointer';
      bullet.style.marginRight = '8px';
      bullet.style.userSelect = 'none';

      const content = document.createElement('div');
      content.classList.add('custom-list-item-content');

      bullet.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const nodeJSON = currentNode.toJSON();
        console.log('Node JSON:', nodeJSON);

        const docJSON = {
          type: 'doc',
          content: [
            {
              type: 'bulletList',
              content: [nodeJSON],
            },
          ],
        };

        editor.commands.setContent(docJSON);

        if (this.options.onBulletClick) {
          const listItemText = currentNode
            .textBetween(0, currentNode.content.size, ' ')
            .trim();
          this.options.onBulletClick(listItemText);
          this.options.dispatch({
            type: 'title/setTitle',
            payload: listItemText,
          });
        }
      });

      container.appendChild(bullet);
      container.appendChild(content);

      return {
        dom: container,
        contentDOM: content,

        update(updatedNode) {
          currentNode = updatedNode;
          return true;
        },
      };
    };
  },
});
