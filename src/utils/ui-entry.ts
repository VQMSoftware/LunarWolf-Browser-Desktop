import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { configureUI } from '~/common/renderer-config';
import { ipcRenderer } from 'electron';

export const renderUI = (Component: any) => {
  ipcRenderer.setMaxListeners(0);
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
