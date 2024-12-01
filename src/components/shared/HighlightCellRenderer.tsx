import React from 'react';

interface HighlightCellRendererProps {
  value: string;
  searchText: string;
}

const HighlightCellRenderer: React.FC<HighlightCellRendererProps> = ({
  value,
  searchText,
}) => {
  if (!searchText || !value) {
    return <span>{value}</span>;
  }

  const regex = new RegExp(`(${searchText})`, 'gi');
  const parts = value.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} style={{ backgroundColor: 'yellow' }}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export default HighlightCellRenderer;
