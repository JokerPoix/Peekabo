import React from 'react';

interface BirdReportItem {
  id: string;
  species: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  user_email: string | null;
  photo_url: string | null;
}

interface BirdReportsListProps {
  reports: BirdReportItem[];
  onReportClick: (lat: number, lng: number) => void;
}

const BirdReportsList: React.FC<BirdReportsListProps> = ({ reports, onReportClick }) => {
  if (reports.length === 0) {
    return (
      <div style={{ padding: '16px', color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
        Aucun signalement pour le moment.
      </div>
    );
  }

  return (
    <div>
      {reports.map((report) => {
        const time = report.timestamp.split(' ')[1]?.substring(0, 5) || '';
        return (
          <div
            key={report.id}
            onClick={() => onReportClick(report.latitude, report.longitude)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
          >
            {report.photo_url ? (
              <img
                src={report.photo_url}
                alt={report.species}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  background: '#e74c3c',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                &#x1F426;
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
                {report.species}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                {time}
                {report.user_email && <> &middot; {report.user_email}</>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BirdReportsList;
