import React from 'react';

import { useAppSelector } from '@redux/hooks';
import Page from '@editor/blocknote/Page';

const App: React.FC = () => {
  const currentDate = useAppSelector((state) => state.date.currentDate);
  const title = useAppSelector((state) => state.title.title);

  return (
    <React.Fragment>
      <Page currentDate={currentDate} title={title} />
    </React.Fragment>
  );
};

export default App;
