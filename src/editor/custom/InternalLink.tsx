/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mark, markInputRule } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { Dispatch } from '@reduxjs/toolkit';

interface InternalLinkAttributes {
  href: string | null;
}

interface InternalLinkOptions {
  dispatch: Dispatch<any>;
  getState: () => { currentDate: string; title: string | null };
}

const InternalLink = Mark.create<InternalLinkOptions>({
  name: 'internalLink',

  addOptions(): InternalLinkOptions {
    return {
      dispatch: (action) => action,
      getState: () => ({ currentDate: '', title: null }),
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
    return [
      'span',
      {
        ...HTMLAttributes,
        'data-type': 'internal-link',
        'data-href': HTMLAttributes.href,
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
          return { href: linkText };
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClickOn: (view, _pos, _node, _nodePos, event) => {
            const target = event.target as HTMLElement;
            if (target.dataset.type === 'internal-link') {
              event.preventDefault();
              event.stopPropagation();

              const href = target.dataset.href;
              if (href) {
                console.log('Navigating to:', href);

                const state = this.options.getState();
                const currentDate = state.currentDate;
                const lastPageTitle = state.title || currentDate;

                this.options.dispatch({ type: 'date/setDate', payload: href });
                this.options.dispatch({
                  type: 'title/setTitle',
                  payload: href,
                });

                const heading = view.state.schema.nodes.heading.create(
                  { level: 1 },
                  view.state.schema.text(href)
                );
                const backReference =
                  lastPageTitle &&
                  view.state.schema.nodes.paragraph.create(
                    {},
                    view.state.schema.text(`Back to [[${lastPageTitle}]]`, [
                      view.state.schema.marks.internalLink.create({
                        href: lastPageTitle,
                      }),
                    ])
                  );

                const fragment = backReference
                  ? view.state.schema.nodes.doc.create(null, [
                      heading,
                      backReference,
                    ])
                  : view.state.schema.nodes.doc.create(null, [heading]);

                view.dispatch(
                  view.state.tr.replaceWith(
                    0,
                    view.state.doc.content.size,
                    fragment
                  )
                );

                return true;
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
