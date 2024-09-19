import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const Panel = () => {
  const [findings, setFindings] = useState([]);
  const max_col_chars = 40;

  const clearFindings = () => {
    chrome.storage.local.set({ findings: [] });
    setFindings([]);
  }

  const fetchFindings = () => {
    chrome.storage.local.get('findings', (data) => {
      setFindings(data.findings ? data.findings.reverse() : []);
    });
  }

  useEffect(() => {
    fetchFindings();
  }, []);

  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.findings) {
      fetchFindings();
    }
  });

  return (
    <div className="container-fluid mt-2">
      <div className="row align-items-center mb-2">
        <div className="col">
          <h4 className="mb-0">Findings
            <span className="badge bg-secondary ms-2">{findings.length}</span>
          </h4>
        </div>
        <div className="col d-flex justify-content-end">
          <button className="btn btn-danger" onClick={clearFindings}>
            <i className="bi bi-trash me-2"></i>Clear Findings</button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-hover table-bordered table-striped align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Source URL</th>
              <th>Target URL</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((finding, index) => (
              <tr key={index} style={{ cursor: 'pointer' }}>
                <td>{findings.length - index}</td>
                <td>{finding.source.url.length > max_col_chars ? `${finding.source.url.substring(0, max_col_chars - 3)}...` : finding.source.url}</td>
                <td>{finding.targetUrl.length > max_col_chars ? `${finding.targetUrl.substring(0, max_col_chars - 3)}...` : finding.targetUrl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
