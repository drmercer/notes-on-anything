/**
 * Document Picture-in-Picture Helper
 */

/**
 * Triggers Picture-in-Picture window or fallback popup
 * @param {string} targetUrl
 * @returns {Promise<Window|null>}
 */
export async function openPictureInPicture(targetUrl = window.location.href) {
  if ('documentPictureInPicture' in window) {
    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 450,
        height: 600,
      });

      // Embed web app inside an iframe in the Document PiP window
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

  // Fallback to regular window.open popup if Doc PIP is unsupported or fails
  const popup = window.open(
    targetUrl,
    'NotesOnAnythingPIP',
    'width=450,height=600,resizable=yes,scrollbars=yes,status=no,toolbar=no'
  );
  return popup;
}
