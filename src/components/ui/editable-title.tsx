import { useEffect, useState } from 'react';

type EditableTitleProps = {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
};

const EditableTitle = ({ value, onSave, className = '', placeholder = 'Untitled' }: EditableTitleProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) {
      setDraft(value);
      setError('');
    }
  }, [value, editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Title cannot be empty');
      return;
    }
    if (trimmed !== value) {
      onSave(trimmed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`relative ${className}`}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
            if (e.key === 'Escape') {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-accent"
          placeholder={placeholder}
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`text-left ${className}`}
    >
      {value || placeholder}
    </button>
  );
};

export default EditableTitle;
