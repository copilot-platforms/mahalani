import { css } from '@emotion/react';
import { useContext } from 'react';
import Editor from 'rich-markdown-editor';
import { AppContext } from '../utils/appContext';

export const EditorInput = ({ value, onChange }) => {
  const appConfig = useContext(AppContext);
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
      readOnly={!appConfig.controls?.allowingUpdatingDetails}
      autoFocus={true}
      placeholder={"Add details here"}
    />
  );
};
