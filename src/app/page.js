'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [retention, setRetention] = useState('1week');
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortenedUrl(null);
    setRedirectPath(null);
    setLoading(true);

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, retention, alias }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setShortenedUrl(data.displayUrl);
      setRedirectPath(data.redirectUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '2rem',
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.05em' }}>약수.울산</h1>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '400px',
      }}>
        <input
          type="url"
          placeholder="단축할 URL을 입력하세요 (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#111',
            color: '#fff',
            fontSize: '1rem',
          }}
        />

        <input
          type="text"
          placeholder="원하는 단축 주소 (예: 학교, mylink) - 선택사항"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          style={{
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#111',
            color: '#fff',
            fontSize: '1rem',
          }}
        />

        <select
          value={retention}
          onChange={(e) => setRetention(e.target.value)}
          style={{
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#111',
            color: '#fff',
            fontSize: '1rem',
            appearance: 'none', // Remove default arrow on some browsers
          }}
        >
          <option value="1week">1주 보관</option>
          <option value="1month">1달 보관</option>
          <option value="1year">1년 보관</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '1rem',
            borderRadius: '8px',
            border: 'none',
            background: '#fff',
            color: '#000',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? '단축 중...' : '단축하기'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</p>
      )}

      {shortenedUrl && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          borderRadius: '12px',
          background: '#111',
          border: '1px solid #333',
          textAlign: 'center',
          width: '100%',
          maxWidth: '400px',
          animation: 'fadeIn 0.5s ease-out',
        }}>
          <p style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>단축된 URL</p>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '1rem',
            wordBreak: 'break-all'
          }}>
            {shortenedUrl}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigator.clipboard.writeText(shortenedUrl)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #333',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              복사
            </button>
            {redirectPath && (
              <a
                href={redirectPath}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #fff',
                  background: '#fff',
                  color: '#000',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  display: 'inline-block',
                }}
              >
                이동
              </a>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
