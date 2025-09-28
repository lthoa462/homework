// components/HomeButton.tsx
import Link from 'next/link';
import React from 'react';

export default function HomeButton() {
  return (
    <div style={{ margin: '20px 0' }}>
      <Link href="/">
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#0070f3', // Màu xanh dương
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
        >
          🏠 Quay về Trang Chủ
        </button>
      </Link>
    </div>
  );
}