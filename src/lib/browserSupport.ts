/**
 * Helper utilities for checking browser API support and sharing pages.
 */

/**
 * Checks if the Web File System Access API (showDirectoryPicker) is supported.
 */
export function isWebFSSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('opfs')) {
    return true;
  }
  return 'showDirectoryPicker' in window && typeof window.showDirectoryPicker === 'function';
}

/**
 * Generates a mailto URL for sending the current page link.
 */
export function getMailtoUrl(url: string = typeof window !== 'undefined' ? window.location.href : ''): string {
  const title = typeof document !== 'undefined' && document.title ? document.title : 'Notes on Anything';
  const subject = encodeURIComponent(`Link to ${title}`);
  const body = encodeURIComponent(`Open this page on your desktop browser to use Notes on Anything:\n\n${url}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Shares or emails the current page to desktop using Web Share API or mailto fallback.
 */
export async function sendToDesktop(): Promise<void> {
  if (typeof window === 'undefined') return;

  const currentUrl = window.location.href;
  const pageTitle = typeof document !== 'undefined' && document.title ? document.title : 'Notes on Anything';

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: pageTitle,
        text: 'Open Notes on Anything on your desktop browser:',
        url: currentUrl
      });
      return;
    } catch (err: any) {
      // If user canceled share or share failed, fallback to mailto if it wasn't an AbortError
      if (err.name === 'AbortError') {
        return;
      }
    }
  }

  // Fallback: mailto link
  const mailtoUrl = getMailtoUrl(currentUrl);
  window.location.href = mailtoUrl;
}
