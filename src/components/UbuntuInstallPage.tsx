import { useState } from 'preact/hooks';

export function UbuntuInstallPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  const steps = [
    {
      title: 'Step 1: Create the GNOME extension directory',
      description: 'Open a terminal on your Ubuntu machine and create the target extension directory under ~/.local/share/gnome-shell/extensions/:',
      command: 'mkdir -p ~/.local/share/gnome-shell/extensions/notes-on-anything-watcher@local'
    },
    {
      title: 'Step 2: Download the extension files from GitHub',
      description: 'Download extension.js and metadata.json directly from the official GitHub repository into your extension directory:',
      command: `curl -fsSL https://raw.githubusercontent.com/drmercer/notes-on-anything/main/watcher/ubuntu/metadata.json -o ~/.local/share/gnome-shell/extensions/notes-on-anything-watcher@local/metadata.json && \\
curl -fsSL https://raw.githubusercontent.com/drmercer/notes-on-anything/main/watcher/ubuntu/extension.js -o ~/.local/share/gnome-shell/extensions/notes-on-anything-watcher@local/extension.js`
    },
    {
      title: 'Alternative: Clone repository from GitHub',
      description: 'If you prefer using Git to clone the repo directly:',
      command: `git clone https://github.com/drmercer/notes-on-anything.git /tmp/notes-on-anything
cp /tmp/notes-on-anything/watcher/ubuntu/metadata.json /tmp/notes-on-anything/watcher/ubuntu/extension.js ~/.local/share/gnome-shell/extensions/notes-on-anything-watcher@local/`
    },
    {
      title: 'Step 3: Enable the GNOME extension',
      description: 'Enable the extension using gnome-extensions. If you are using X11, you can also restart GNOME Shell with Alt + F2, type r, and press Enter. On Wayland, log out and log back in if it is not immediately recognized:',
      command: 'gnome-extensions enable notes-on-anything-watcher@local'
    },
    {
      title: 'Step 4: Configure your target directory',
      description: 'The extension creates a configuration file at ~/.config/notes-on-anything/config.json. Set "targetDir" to the notes folder you opened in the web app (e.g., in ~/Documents/Notes). Avoid folders inside ~/.config as Chromium blocks Web FS access to sensitive directories:',
      command: `cat << 'EOF' > ~/.config/notes-on-anything/config.json
{
  "targetDir": "${typeof window !== 'undefined' ? '$HOME/Documents/Notes' : '$HOME/Documents/Notes'}"
}
EOF`
    },
    {
      title: 'Step 5: Verify active.json',
      description: 'Switch between windows and verify that active.json is updating automatically with the current window title:',
      command: 'cat ~/Documents/Notes/active.json'
    }
  ];

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
              href="/install"
              style={{
                color: '#4b5563',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              &larr; Choose Platform
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
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🐧</span>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              lineHeight: 1.2,
              margin: 0,
              color: '#111827'
            }}>
              Ubuntu GNOME Extension Installation
            </h1>
          </div>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: '#4b5563',
            margin: '0 0 1rem 0'
          }}>
            Follow these steps to download the watcher extension files from GitHub and install them into your GNOME Shell environment.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#fff7ed',
            border: '1px solid #ffedd5',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#9a3412'
          }}>
            <span>⚡</span>
            <span>Written in vanilla JavaScript with <strong>zero build steps</strong> and no npm dependencies.</span>
          </div>
        </div>

        {/* Steps Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <h2 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                margin: '0 0 0.5rem 0',
                color: '#1f2937'
              }}>
                {step.title}
              </h2>
              <p style={{
                margin: '0 0 1rem 0',
                fontSize: '0.95rem',
                color: '#4b5563',
                lineHeight: 1.5
              }}>
                {step.description}
              </p>

              <div style={{ position: 'relative' }}>
                <pre style={{
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  padding: '1rem 3.5rem 1rem 1rem',
                  borderRadius: '6px',
                  fontFamily: 'monospace, monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                  overflowX: 'auto',
                  margin: 0,
                  border: '1px solid #334155'
                }}>
                  <code>{step.command}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(step.command, idx)}
                  aria-label={`Copy command for ${step.title}`}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    backgroundColor: copiedIndex === idx ? '#059669' : '#334155',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {copiedIndex === idx ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Warning Box */}
        <div style={{
          marginTop: '2rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #fde68a',
          padding: '1.25rem',
          borderRadius: '8px',
          color: '#92400e',
          fontSize: '0.9rem',
          lineHeight: 1.5
        }}>
          <strong>⚠️ Note on Directory Permissions:</strong> The Web File System API in Chromium-based browsers restricts access to sensitive directories (such as files inside <code>~/.config</code>). Make sure your <code>targetDir</code> points to a regular user directory such as <code>~/Documents/Notes</code> or <code>~/Notes</code>!
        </div>

        {/* Back to App CTA */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.8rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: '#2563eb',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Done! Return to Notes on Anything
          </a>
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
