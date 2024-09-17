import React, { ReactElement, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

const Popup = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage({ greeting: 'hello' }, (response) => {
      console.log('Response:', response);
    });
  };

  return (
    <div>
      <h1>Popup</h1>
      <button type="button" className="btn btn-primary" onClick={handleClick}>Click me</button>
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
