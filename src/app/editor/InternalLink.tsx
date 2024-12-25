/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mark, markInputRule } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { Dispatch } from '@reduxjs/toolkit';

interface InternalLinkAttributes {
  href: string | null;
}

interface InternalLinkOptions {
  dispatch: Dispatch<any>; // Redux dispatch function
}

const InternalLink = Mark.create<InternalLinkOptions>({
  name: 'internalLink',

  addOptions(): InternalLinkOptions {
    return {
      dispatch: (action) => action, // Default dispatch function
    };
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="internal-link"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    console.log('Rendering HTML for internal link:', HTMLAttributes);

    return [
      'span',
      {
        ...HTMLAttributes,
        'data-type': 'internal-link',
        'data-href': HTMLAttributes.href, // Store href in data-href instead
        class: 'text-blue-500 underline hover:text-blue-700 cursor-pointer',
      },
      0,
    ];
  },

  addInputRules() {
    const regex = /\[\[([\w\s]+)\]\]/;

    return [
      markInputRule({
        find: regex,
        type: this.type,
        getAttributes: (match: string[]): InternalLinkAttributes => {
          const [, linkText] = match;
          console.log('Creating input rule for link:', linkText);
          return { href: linkText };
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClickOn: (view, pos, node, nodePos, event) => {
            const target = event.target as HTMLElement;
            if (target.dataset.type === 'internal-link') {
              event.preventDefault(); // Prevent default browser behavior
              event.stopPropagation(); // Stop the event from bubbling up

              const href = target.dataset.href; // Use data-href instead of href
              if (href) {
                console.log('Navigating to:', href);

                // Dispatch Redux actions
                this.options.dispatch({ type: 'date/setDate', payload: href });
                this.options.dispatch({ type: 'title/setTitle', payload: href });

                // Update editor content
                view.dispatch(
                  view.state.tr.replaceWith(0, view.state.doc.content.size, view.state.schema.text(`<h1>${href}</h1>`))
                );

                return true; // Stop further handling
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

export default InternalLink;
