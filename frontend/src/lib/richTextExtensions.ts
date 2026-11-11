import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

// One schema for the admin editor and the public renderer: a node the editor can create
// but the renderer does not know makes generateHTML throw for the whole post.
export const richTextExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary-400 underline hover:text-primary-300',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
];
