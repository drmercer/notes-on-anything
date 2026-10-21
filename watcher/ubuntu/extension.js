import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

export default class Extension {
    constructor(metadata) {
        this._metadata = metadata;
        this._windowTracker = null;
        this._focusSignalId = null;
        this._titleSignalId = null;
        this._focusedWindow = null;
        this._targetDir = null;
        this._activeJsonFile = null;
        this._timeoutId = null;
    }

    enable() {
        this._windowTracker = Shell.WindowTracker.get_default();

        // Setup storage directory (~/.config/notes-on-anything/active.json)
        const configDir = GLib.get_user_config_dir();
        this._targetDir = GLib.build_filenamev([configDir, 'notes-on-anything']);
        GLib.mkdir_with_parents(this._targetDir, 0o755);

        const filePath = GLib.build_filenamev([this._targetDir, 'active.json']);
        this._activeJsonFile = Gio.File.new_for_path(filePath);

        // Connect signal for focus changes
        this._focusSignalId = global.display.connect('notify::focus-window', () => {
            this._onFocusWindowChanged();
        });

        this._onFocusWindowChanged();

        // Start 1 second heartbeat timer
        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            this._writeActiveTitle();
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }

        if (this._focusSignalId) {
            global.display.disconnect(this._focusSignalId);
            this._focusSignalId = null;
        }

        if (this._focusedWindow && this._titleSignalId) {
            this._focusedWindow.disconnect(this._titleSignalId);
            this._titleSignalId = null;
        }

        this._focusedWindow = null;
        this._windowTracker = null;
    }

    _onFocusWindowChanged() {
        if (this._focusedWindow && this._titleSignalId) {
            this._focusedWindow.disconnect(this._titleSignalId);
            this._titleSignalId = null;
        }

        const focusedWindow = global.display.focus_window;
        this._focusedWindow = focusedWindow;

        if (focusedWindow) {
            this._titleSignalId = focusedWindow.connect('notify::title', () => {
                this._writeActiveTitle();
            });
        }

        this._writeActiveTitle();
    }

    _writeActiveTitle() {
        let title = '';
        if (this._focusedWindow) {
            title = this._focusedWindow.get_title() || '';
        }

        const data = JSON.stringify({
            title: title,
            watcherName: 'GNOME Extension',
            watcherHeartbeat: new Date().toISOString()
        }, null, 2);

        try {
            this._activeJsonFile.replace_contents_async(
                new TextEncoder().encode(data),
                null,
                false,
                Gio.FileCreateFlags.NONE,
                null,
                (file, res) => {
                    try {
                        file.replace_contents_finish(res);
                    } catch (e) {
                        // ignore write errors or handle log
                    }
                }
            );
        } catch (e) {
            // ignore
        }
    }
}
