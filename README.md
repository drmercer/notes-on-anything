# notes-on-anything
(WIP) A tool that shows you your notes associated with your active window

# goal

I want to have a notes scratch pad next to every Codex conversation, PR, web page, etc. to augment my working memory about any task or goal.

# Bootstrapping & Development

To bootstrap and run this project, the following exact commands were executed:

1. **Configure pnpm Minimum Package Age Requirement (3 days = 4320 minutes)**:
   ```bash
   pnpm config set minimumReleaseAge 4320
   ```
   This is also configured in `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - '.'
   minimumReleaseAge: 4320
   ```

2. **Install Dependencies**:
   ```bash
   pnpm add astro @astrojs/preact preact
   ```

3. **Run Development Server**:
   ```bash
   pnpm dev
   ```

4. **Build Production Assets**:
   ```bash
   pnpm build
   ```

# plan

Two parts: a web app and a locally-running watcher. 

The locally-running watcher (a Gnome extension for Ubuntu) watches the active (i.e. focused) window title and writes it to an `active.json` file in a notes directory on disk, with the format `{ "title": "..." }`.

The web app functionality:
* lets the user open a notes directory using the Web FS API
* remembers the opened directory so that it's easy to get started again after reopening the web app
* watches the `active.json` file using the FS observer API (or interval polling fallback)
* whenever the title changes, it looks for a markdown file in the notes directory with a frontmatter field (`windowTitle`) that matches the active window title. If no such markdown file exists, it creates a new one named based on the current time (format `YYYY-MM-DD-HHMM.SSS.md`) and with the frontmatter field set properly.
* the web app displays a rich text editor for the active notes file.
* the web app has an option to open it as a pop-up using the Document Picture-in-Picture API (containing an iframe of the web app, for simplicity), or just the regular window.open popup if Doc PIP is unsupported.

implementation details: 
* use pnpm for package management for the web app
* use Astro for the web app
* if a frontend framework is needed, use Preact
* the Gnome extension should be in a subdirectory `watcher/ubuntu/` with a README explaining how to install it locally
