import React from 'react';

export default function Page({ params }: { params: { date: string } }) {
  return (
    <div style={{ padding: 12 }}>
      <h1>Moved</h1>
      <p>Journal entries now stored under Studio. Visit <a href={`/ship/home/faith/journal/${params.date}`}>/ship/home/faith/journal/{params.date}</a></p>
    </div>
  );
}
