import { useState } from 'preact/hooks';

export const AI_PROMPT = `I am using an application called "Notes on Anything". It associates notes with my currently focused desktop window by reading a local JSON file named "active.json".

I need a lightweight watcher script or utility for my operating system / window manager that continuously monitors the active (focused) window and writes the active window details into an "active.json" file in a directory that I specify.

Requirements:
1. Target Directory: Let me easily configure the target directory where active.json will be saved (e.g. via an environment variable, config file, or command-line flag).
2. JSON Format: Every time the focused window changes (and periodically or with a heartbeat timestamp), write a JSON file named "active.json" to the target directory with this structure:
{
  "title": "<Currently active window title>",
  "watcherName": "<Name of this custom watcher>",
  "watcherHeartbeat": "<ISO 8601 UTC timestamp, e.g. 2026-03-30T12:00:00.000Z>"
}
3. Behavior:
- Update whenever the user switches windows or changes tabs/titles.
- Update the watcherHeartbeat at least every 1-2 seconds so the app knows the watcher is running.
- Ensure file writes are safe and atomic if possible so the app does not read a partially written file.

Please provide a clean, standalone script (such as Python, Bash, PowerShell, Swift, or Node.js depending on my OS) and step-by-step instructions to run it continuously in the background.`;

export function InstallPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy prompt to clipboard:', err);
    }
  };

  const handleSelectUbuntu = () => {
    window.location.href = '/install/ubuntu';
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
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#ffffff',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', textDecoration: 'none' }}>
              Notes on Anything 📝
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="/"
              style={{
                color: '#4b5563',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              App Home
            </a>
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
              GitHub Repo
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        maxWidth: '850px',
        width: '100%',
        margin: '0 auto',
        padding: '3rem 1.5rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '0 0 0.75rem 0',
            color: '#111827'
          }}>
            Install Watcher
          </h1>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: '#4b5563',
            maxWidth: '620px',
            margin: '0 auto'
          }}>
            To automatically show notes for whatever window you're focused on, Notes on Anything needs a small watcher running locally on your system.
          </p>
        </div>

        {/* Platform Selection */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            margin: '0 0 1rem 0',
            color: '#1f2937'
          }}>
            1. Choose your platform
          </h2>
          <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280', fontSize: '0.95rem' }}>
            Select the operating system or desktop environment you are using:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            <button
              onClick={handleSelectUbuntu}
              data-testid="platform-ubuntu-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e95420';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🐧</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                  Ubuntu (GNOME)
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.4 }}>
                Native GNOME Shell extension with zero dependencies and no build steps required.
              </p>
              <div style={{
                marginTop: '1rem',
                color: '#e95420',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                View Ubuntu Instructions &rarr;
              </div>
            </button>

            <button
              onClick={() => setSelectedPlatform('other')}
              data-testid="platform-other-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1.25rem',
                borderRadius: '8px',
                border: selectedPlatform === 'other' ? '2px solid #2563eb' : '2px solid #e5e7eb',
                backgroundColor: selectedPlatform === 'other' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, box-shadow 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💻</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                  Something else
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.4 }}>
                macOS, Windows, KDE, Hyprland, XFCE, or any other setup. Generate a custom watcher using AI.
              </p>
              <div style={{
                marginTop: '1rem',
                color: '#2563eb',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                Get AI Setup Prompt &darr;
              </div>
            </button>
          </div>
        </div>

        {/* AI Prompt Section for "Something else" */}
        {selectedPlatform === 'other' && (
          <div
            data-testid="ai-prompt-section"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  margin: '0 0 0.25rem 0',
                  color: '#1e3a8a'
                }}>
                  2. Prompt for your AI assistant
                </h2>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '0.95rem' }}>
                  Copy this prompt and paste it into ChatGPT, Claude, GitHub Copilot, or your preferred AI to generate a watcher script for your environment.
                </p>
              </div>
              <button
                onClick={handleCopyPrompt}
                data-testid="copy-prompt-btn"
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: copied ? '#059669' : '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
              >
                {copied ? '✓ Copied to clipboard!' : '📋 Copy Prompt'}
              </button>
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '8px',
              fontFamily: 'monospace, monospace',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              maxHeight: '380px',
              overflowY: 'auto',
              border: '1px solid #334155'
            }}>
              {AI_PROMPT}
            </div>

            <div style={{
              marginTop: '1.25rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              color: '#166534',
              lineHeight: 1.5
            }}>
              <strong>💡 Tip:</strong> Tell your AI model your exact operating system (e.g. <em>macOS Sequoia</em> or <em>Windows 11</em>) and favorite language (e.g. <em>Python</em>, <em>Swift</em>, or <em>PowerShell</em>). All it needs to do is write the active window's title to <code>active.json</code> in your notes directory!
            </div>
          </div>
        )}
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
