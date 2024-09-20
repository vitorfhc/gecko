import React from 'react';
import { createRoot } from 'react-dom/client';

const Popup = () => {
  return (
    <div></div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} else {
  console.error('Root container not found');
}
