/**
 * Document Picture-in-Picture Helper
 */

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
    };
  }
}

/**
 * Triggers Picture-in-Picture window or fallback popup
 */
export async function openPictureInPicture(targetUrl: string = window.location.href): Promise<Window | null> {
  if ('documentPictureInPicture' in window && window.documentPictureInPicture) {
    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 450,
        height: 600,
      });

      const iframe = pipWindow.document.createElement('iframe');
      iframe.src = targetUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      pipWindow.document.body.style.margin = '0';
      pipWindow.document.body.style.padding = '0';
      pipWindow.document.body.appendChild(iframe);

      return pipWindow;
    } catch (err) {
      console.warn('Document Picture-in-Picture failed, falling back to popup window:', err);
    }
  }

  const popup = window.open(
    targetUrl,
    'NotesOnAnythingPIP',
    'width=450,height=600,resizable=yes,scrollbars=yes,status=no,toolbar=no'
  );
  return popup;
}
