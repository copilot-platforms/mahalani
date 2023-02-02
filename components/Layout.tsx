import React, { ReactNode, useEffect } from 'react';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  // Setting the document title
  useEffect(() => {
    window.document.title = title;
  }, [title]);

  return <div>{children}</div>;
};

export default Layout;
