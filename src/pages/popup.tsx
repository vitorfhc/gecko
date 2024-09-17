import React, { ReactElement, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

const Popup = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage({ greeting: 'hello' }, (response) => {
      console.log('Response:', response);
    });
  };

  return (
    <div>
      <h1>My Extension Popup</h1>
      <button onClick={handleClick}>Send Message to Service Worker</button>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} else {
  console.error('Root container not found');
}
