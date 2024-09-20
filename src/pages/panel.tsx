import React from 'react';
import { createRoot } from 'react-dom/client';
import FindingsTable from '../components/findings-table';
import FindingDrawer from '../components/finding-drawer';
import { FindingUI } from '../shared/types';


const Panel = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedFinding, setSelectedFinding] = React.useState<FindingUI | null>(null);

  const handleRowClick = (finding: FindingUI) => {
    setSelectedFinding(finding);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="mt-4 mb-8">
      <FindingsTable onRowClick={handleRowClick} />
      <FindingDrawer open={isDrawerOpen} finding={selectedFinding} onClose={handleCloseDrawer} />
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
