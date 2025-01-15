/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/react';
import ListItem from '@tiptap/extension-list-item';

interface CollapsibleListItemOptions {
  dispatch: (action: any) => void;
  onNavigate?: (text: string) => void;
}

export const CollapsibleListItem = ListItem.extend<CollapsibleListItemOptions>({
  name: 'listItem',

  addAttributes() {
    const parentAttrs =
      this.parent &&
      'addAttributes' in this.parent &&
      typeof this.parent.addAttributes === 'function'
        ? this.parent.addAttributes()
        : {};
    return {
      ...parentAttrs,
      collapsed: {
        default: false,
      },
    };
  },

  addOptions() {
    return {
      ...this.parent?.(),
      onNavigate: undefined,
    };
  },

  addNodeView(): NodeViewRenderer {
    return (props: NodeViewRendererProps) => {
      const { node, editor } = props;
      let currentNode = node;

      const container = document.createElement('li');
      container.style.position = 'relative';
      container.style.display = 'flex';
      container.style.alignItems = 'flex-start';
      
      const collapseIcon = document.createElement('span');
      collapseIcon.style.cursor = 'pointer';
      collapseIcon.style.marginRight = '0.5rem';
      collapseIcon.style.marginTop = '1.45rem';
      
      const navBullet = document.createElement('span');
      navBullet.textContent = '•';
      navBullet.style.cursor = 'pointer';
      navBullet.style.marginRight = '0.5rem';
      navBullet.style.marginTop = '1.30rem';

      const content = document.createElement('div');
      content.style.marginLeft = '0.5rem';
      content.style.flex = '1';

      container.appendChild(collapseIcon);
      container.appendChild(navBullet);
      container.appendChild(content);

      function hasChildren(): boolean {
        return currentNode.content.content.some(
          (child) =>
            child.type.name === 'bulletList' ||
            child.type.name === 'orderedList'
        );
      }

      function applyCollapse(collapsed: boolean) {
        const nestedLists = content.querySelectorAll('ul, ol');
        nestedLists.forEach((el) => {
          (el as HTMLElement).style.display = collapsed ? 'none' : '';
        });
      }

      function updateIcon() {
        const collapsed = currentNode.attrs.collapsed;
        if (hasChildren()) {
          collapseIcon.textContent = collapsed ? '▶' : '▼';
        } else {
          collapseIcon.textContent = '';
        }
      }

      collapseIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasChildren()) {
          const oldVal = currentNode.attrs.collapsed;
          editor.commands.updateAttributes('listItem', {
            collapsed: !oldVal,
          });
        }
      });

      navBullet.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const nodeJSON = currentNode.toJSON();
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

        const textValue = currentNode
          .textBetween(0, currentNode.content.size, ' ')
          .trim();
        this.options.dispatch({
          type: 'title/setTitle',
          payload: textValue,
        });
        if (this.options.onNavigate) {
          this.options.onNavigate(textValue);
        }
      });

      return {
        dom: container,

        contentDOM: content,

        update(updatedNode) {
          if (updatedNode.type.name !== 'listItem') return false;
          currentNode = updatedNode;

          updateIcon();
          applyCollapse(Boolean(currentNode.attrs.collapsed));
          return true;
        },
      };
    };
  },
});
