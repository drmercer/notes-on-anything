import { sendToDesktop } from '../lib/browserSupport';

interface LandingPageProps {
  isSupported: boolean;
  savedFolderName?: string | null;
  onOpenFolder: () => void;
  onOpenSavedFolder?: () => void;
  errorMessage?: string | null;
}

export function LandingPage({
  isSupported,
  savedFolderName,
  onOpenFolder,
  onOpenSavedFolder,
  errorMessage
}: LandingPageProps) {
  const handleSendToDesktop = () => {
    sendToDesktop();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      color: '#212529',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Navigation */}
      <header style={{
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#ffffff',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              Notes on Anything 📝
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              by <a
                href="https://danmercer.net"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
              >
                Dan Mercer
              </a>
            </span>
          </div>

          <div>
            <a
              href="https://github.com/drmercer/notes-on-anything"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#374151',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub Repo
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section & Explanation */}
      <main style={{
        flex: 1,
        maxWidth: '850px',
        width: '100%',
        margin: '0 auto',
        padding: '3rem 1.5rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '0 0 1rem 0',
            color: '#111827'
          }}>
            Contextual notes for everything you do
          </h1>
          <p style={{
            fontSize: '1.2rem',
            lineHeight: 1.6,
            color: '#4b5563',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <strong>Notes on Anything</strong> displays notes tied to your currently focused desktop window—augmenting your working memory across AI chats, pull requests, docs, and IDE tasks.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1f2937' }}>
              🎯 Active Window Tracking
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.5 }}>
              Runs with a lightweight local watcher (e.g. Ubuntu GNOME extension) that updates your active window title seamlessly.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1f2937' }}>
              📁 Local & Plain Text
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.5 }}>
              Your notes remain 100% stored on your local disk as plain Markdown files with YAML frontmatter via the Web FS API.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1f2937' }}>
              🖼️ Always-On Pop-Up
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.5 }}>
              Pop out your notes in Document Picture-in-Picture mode so your notes stay floating above your work area.
            </p>
          </div>
        </div>

        {/* Dynamic CTA Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '2.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          {!isSupported ? (
            <div>
              <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.35rem', color: '#1f2937' }}>
                Web File System API Required
              </h2>
              <p style={{
                fontSize: '1rem',
                lineHeight: 1.5,
                color: '#4b5563',
                maxWidth: '560px',
                margin: '0 auto 1.5rem auto'
              }}>
                Notes on Anything requires the Web File System API to access and edit local files on your disk.
                Your current browser or device does not support this API. Please open this app in a supported desktop browser such as Chrome, Edge, or Opera.
              </p>
              <button
                onClick={handleSendToDesktop}
                style={{
                  padding: '0.8rem 1.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                Send to desktop
              </button>
            </div>
          ) : savedFolderName ? (
            <div>
              <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.35rem', color: '#1f2937' }}>
                Welcome back
              </h2>
              <p style={{
                fontSize: '1rem',
                lineHeight: 1.5,
                color: '#4b5563',
                maxWidth: '560px',
                margin: '0 auto 1.5rem auto'
              }}>
                You previously selected the notes directory <strong>"{savedFolderName}"</strong>.
                Would you like to reopen it or choose a different folder?
              </p>

              {errorMessage && (
                <div style={{
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  {errorMessage}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {onOpenSavedFolder && (
                  <button
                    onClick={onOpenSavedFolder}
                    style={{
                      padding: '0.8rem 1.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Open "{savedFolderName}"
                  </button>
                )}
                <button
                  onClick={onOpenFolder}
                  style={{
                    padding: '0.8rem 1.75rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#374151',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Select a different folder
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.35rem', color: '#1f2937' }}>
                Get Started
              </h2>
              <p style={{
                fontSize: '1rem',
                lineHeight: 1.5,
                color: '#4b5563',
                maxWidth: '560px',
                margin: '0 auto 1.5rem auto'
              }}>
                Select a directory on your local disk where your notes and active window state will be saved.
              </p>
              <button
                onClick={onOpenFolder}
                style={{
                  padding: '0.8rem 1.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Open a folder
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e9ecef',
        backgroundColor: '#ffffff',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          Notes on Anything &bull; Built by <a
            href="https://danmercer.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none' }}
          >
            Dan Mercer
          </a> &bull; Source code on <a
            href="https://github.com/drmercer/notes-on-anything"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none' }}
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
