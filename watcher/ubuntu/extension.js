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
        this._configDir = null;
        this._activeJsonFile = null;
        this._timeoutId = null;
    }

    enable() {
        this._windowTracker = Shell.WindowTracker.get_default();

        // Open config file (~/.config/notes-on-anything/config.json)
        const configDir = GLib.get_user_config_dir();
        this._configDir = GLib.build_filenamev([configDir, 'notes-on-anything']);
        GLib.mkdir_with_parents(this._configDir, 0o755);

        const configFilePath = GLib.build_filenamev([this._configDir, 'config.json']);
        // Initialize config file with default values if it doesn't exist.
        if (!GLib.file_test(configFilePath, GLib.FileTest.EXISTS)) {
            const defaultConfig = JSON.stringify({
                targetDir: this._configDir
            }, null, 2);
            GLib.file_set_contents(configFilePath, defaultConfig);
        }
        this._configFilePath = configFilePath;

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
        // Read the setting on each write so changes take effect without restarting
        // the extension. Fall back to the config directory for missing/invalid config.
        let targetDir = this._configDir;
        try {
            const [, contents] = GLib.file_get_contents(this._configFilePath);
            const config = JSON.parse(new TextDecoder().decode(contents));
            if (typeof config.targetDir === 'string' && config.targetDir.trim()) {
                targetDir = config.targetDir.trim();
            }
        } catch (e) {
            // Keep using the default location if config cannot be read or parsed.
        }

        try {
            GLib.mkdir_with_parents(targetDir, 0o755);
            const filePath = GLib.build_filenamev([targetDir, 'active.json']);
            this._activeJsonFile = Gio.File.new_for_path(filePath);
        } catch (e) {
            // Keep the last usable destination if the configured path is unavailable.
        }
        if (!this._activeJsonFile) {
            const filePath = GLib.build_filenamev([this._configDir, 'active.json']);
            this._activeJsonFile = Gio.File.new_for_path(filePath);
        }

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
