import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { injectFonts } from '~/renderer/mixins';
import { configureUI } from '~/common/renderer-config';

export const renderWebUI = (Component: any) => {
  injectFonts();
  configureUI();

  const container = document.getElementById('app');
  if (!container) {
    throw new Error("Element with ID 'app' not found");
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(Component)
  );
};
