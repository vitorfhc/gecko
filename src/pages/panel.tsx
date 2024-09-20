import React from 'react';
import { createRoot } from 'react-dom/client';
import FindingsTable from '../components/findings-table';


const Panel = () => {
  return (
    <div className="mt-4">
      <FindingsTable />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Panel />);
} else {
  console.error('Root container not found');
}
