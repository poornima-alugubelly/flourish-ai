import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "What's on your mind?",
}) => {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const formats = [
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
  ];

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
      formats={formats}
      style={{
        backgroundColor: 'white',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
      }}
    />
  );
};

export default RichTextEditor;
