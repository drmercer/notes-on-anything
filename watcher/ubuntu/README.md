# Notes on Anything - Ubuntu GNOME Extension Watcher

This GNOME extension monitors the active/focused window in Ubuntu / GNOME Shell and writes its window title to `active.json`. Its settings live in `~/.config/notes-on-anything/config.json`.

On first run, the extension creates this config with the default output directory:

```json
{
  "targetDir": "/home/your-user/.config/notes-on-anything"
}
```

Change `targetDir` to the directory where the web application should monitor `active.json`. The extension creates the directory if needed and rereads the config on each write, so changes take effect while it is running.

> [!WARNING]
> The Web FS API (at least in Chromium) hides any files that are symlinks to sensitive system files, such as a file in .config. So the `targetDir` should be a directory outside of `.config`, like in `~/Documents` or `~/Notes`.

## Requirements & Design
- **Vanilla JavaScript**: Written with zero npm dependencies and no build step.
- Uses native GNOME Shell GObject introspection APIs (`gi://GLib`, `gi://Gio`, `gi://Shell`, `gi://Meta`).

## Local Installation Instructions

1. **Create the Extension Directory**:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/notes-on-anything-watcher@local
   ```

2. **Copy the Extension Files**:
   ```bash
   cp watcher/ubuntu/metadata.json watcher/ubuntu/extension.js ~/.local/share/gnome-shell/extensions/notes-on-anything-watcher@local/
   ```

3. **Enable the Extension**:
   - On Wayland or X11, enable it via `gnome-extensions`:
     ```bash
     gnome-extensions enable notes-on-anything-watcher@local
     ```
   - Alternatively, restart GNOME Shell (Press `Alt + F2`, type `r`, press `Enter` on X11) or log out and log back in on Wayland.

4. **Verify Active Window Title Output**:
   Check the output file:
   ```bash
   cat /path/to/targetDir/active.json
   ```
   When switching windows or every second, the file will update automatically in format:
   ```json
   {
     "title": "Window Title",
     "watcherName": "GNOME Extension",
     "watcherHeartbeat": "2026-03-30T12:00:00.000Z"
   }
   ```
