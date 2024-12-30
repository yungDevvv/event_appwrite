"use client"

import 'ckeditor5/ckeditor5.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useEffect, useState } from 'react';
import {
   ClassicEditor,
   AccessibilityHelp,
   Alignment,
   Autoformat,
   AutoImage,
   AutoLink,
   Autosave,
   BlockQuote,
   Bold,
   CloudServices,
   Essentials,
   FontBackgroundColor,
   FontColor,
   FontFamily,
   FontSize,
   GeneralHtmlSupport,
   Heading,
   ImageBlock,
   ImageCaption,
   ImageInline,
   ImageInsertViaUrl,
   ImageResize,
   ImageStyle,
   ImageTextAlternative,
   ImageToolbar,
   ImageUpload,
   Indent,
   IndentBlock,
   Italic,
   Link,
   List,
   ListProperties,
   MediaEmbed,
   Paragraph,
   SelectAll,
   SourceEditing,
   SpecialCharacters,
   Strikethrough,
   TextTransformation,
   TodoList,
   Underline,
   Undo
} from 'ckeditor5';

const CKeditor = ({ content, handleChange, onReady, editorType }) => {
   const [isLayoutReady, setIsLayoutReady] = useState(false);

   useEffect(() => {
      setIsLayoutReady(true);
      return () => setIsLayoutReady(false);
   }, []);

   const editorConfig = {
      toolbar: {
         items: [
            'undo',
            'redo',
            '|',
            'heading',
            '|',
            'fontSize',
            'fontFamily',
            'fontColor',
            '|',
            'bold',
            'italic',
            'underline',
            '|',
            'alignment',
            'outdent',
            'indent',
            'bulletedList',
            'link',
            'mediaEmbed',
            'blockQuote',
            '|',
            'numberedList',
            'todoList',
            'strikethrough',
            'sourceEditing',
         ],
         shouldNotGroupWhenFull: false
      },
      plugins: [
         AccessibilityHelp,
         Alignment,
         Autoformat,
         AutoImage,
         AutoLink,
         Autosave,
         BlockQuote,
         Bold,
         CloudServices,
         Essentials,
         FontBackgroundColor,
         FontColor,
         FontFamily,
         FontSize,
         GeneralHtmlSupport,
         Heading,
         ImageBlock,
         ImageCaption,
         ImageInline,
         ImageInsertViaUrl,
         ImageResize,
         ImageStyle,
         ImageTextAlternative,
         ImageToolbar,
         ImageUpload,
         Indent,
         IndentBlock,
         Italic,
         Link,
         List,
         ListProperties,
         MediaEmbed,
         Paragraph,
         SelectAll,
         SourceEditing,
         SpecialCharacters,
         Strikethrough,
         TextTransformation,
         TodoList,
         Underline,
         Undo
      ],
      fontFamily: {
         supportAllValues: true
      },
      fontSize: {
         options: [10, 12, 14, 'default', 18, 20, 22],
         supportAllValues: true
      },
      heading: {
         options: [
            {
               model: 'paragraph',
               title: 'Paragraph',
               class: 'ck-heading_paragraph'
            },
            {
               model: 'heading1',
               view: 'h1',
               title: 'Heading 1',
               class: 'ck-heading_heading1'
            },
            {
               model: 'heading2',
               view: 'h2',
               title: 'Heading 2',
               class: 'ck-heading_heading2'
            },
            {
               model: 'heading3',
               view: 'h3',
               title: 'Heading 3',
               class: 'ck-heading_heading3'
            },
            {
               model: 'heading4',
               view: 'h4',
               title: 'Heading 4',
               class: 'ck-heading_heading4'
            },
            {
               model: 'heading5',
               view: 'h5',
               title: 'Heading 5',
               class: 'ck-heading_heading5'
            },
            {
               model: 'heading6',
               view: 'h6',
               title: 'Heading 6',
               class: 'ck-heading_heading6'
            }
         ]
      },
      htmlSupport: {
         allow: [
            {
               name: /^.*$/,
               styles: true,
               attributes: true,
               classes: true
            }
         ]
      },
      image: {
         toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage'
         ]
      },
      initialData: content ? content : '',
      link: {
         addTargetToExternalLinks: true,
         defaultProtocol: 'https://',
         decorators: {
            toggleDownloadable: {
               mode: 'manual',
               label: 'Downloadable',
               attributes: {
                  download: 'file'
               }
            }
         }
      },
      list: {
         properties: {
            styles: true,
            startIndex: true,
            reversed: true
         }
      },
      placeholder: 'Kirjoita tai liitä sisältösi tähän!'
   };

   return (
      <>
         {isLayoutReady && (
            <CKEditor
               editor={ClassicEditor}
               data={content}
               onChange={handleChange}
               config={editorConfig}
               onReady={editor => {
                  editor.editing.view.change(writer => {
                     const viewEditableRoot = editor.editing.view.document.getRoot();
                     writer.setAttribute('data-editor-type', editorType, viewEditableRoot);
                  });
                  if (onReady) onReady(editor);
               }}
            />
         )}
      </>
   );
};

export default CKeditor;