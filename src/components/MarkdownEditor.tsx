import { useEffect, useRef } from 'preact/hooks';
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

export interface MarkdownEditorProps {
  activeNoteKey?: string;
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function MarkdownEditor({
  activeNoteKey,
  defaultValue = '',
  onChange,
  placeholder,
  readOnly = false,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;
    let createdCrepe: Crepe | null = null;

    const initEditor = async () => {
      if (crepeRef.current) {
        try {
          await crepeRef.current.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
        crepeRef.current = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      if (isCancelled || !containerRef.current) return;

      const crepe = new Crepe({
        root: containerRef.current,
        defaultValue: defaultValue,
    featureConfigs: placeholder
      ? {
          [Crepe.Feature.Placeholder]: {
            text: placeholder,
          },
        }
      : undefined,
      });

      if (readOnly) {
        crepe.setReadonly(readOnly);
      }

      crepe.on((listener) => {
        listener.markdownUpdated((_ctx, markdown) => {
          if (!isCancelled && onChangeRef.current) {
            onChangeRef.current(markdown);
          }
        });
      });

      try {
        await crepe.create();
        if (isCancelled) {
          await crepe.destroy();
          return;
        }
        createdCrepe = crepe;
        crepeRef.current = crepe;
      } catch (err) {
        console.error('Error initializing Crepe editor:', err);
      }
    };

    initEditor();

    return () => {
      isCancelled = true;
      if (createdCrepe) {
        createdCrepe.destroy().catch(() => {});
        if (crepeRef.current === createdCrepe) {
          crepeRef.current = null;
        }
      }
    };
  }, [activeNoteKey]);

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '6px',
        minHeight: '350px',
        backgroundColor: '#fff',
        overflow: 'hidden',
      }}
    >
      <div ref={containerRef} className="milkdown-editor-wrapper" />
    </div>
  );
}
