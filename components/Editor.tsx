import { css } from '@emotion/react';
import Editor from 'rich-markdown-editor';

export const EditorInput = ({ value, onChange }) => {
  return (
    <Editor
      defaultValue={value}
      onChange={(val) => {
        const value = val();
        onChange(value);
      }}
      css={css`
        padding: 16px;
      `}
    />
  );
};
