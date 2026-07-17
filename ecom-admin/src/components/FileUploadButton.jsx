import { useState } from 'react';

function FileUploadButton({
  id,
  multiple = false,
  accept,
  disabled = false,
  onChange,
  label = 'Choose Image',
  existingImageUrl = null,
}) {
  const [fileNames, setFileNames] = useState([]);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);
    setFileNames(files.map((f) => f.name));
    onChange(e);
  }

  return (
    <div className="flex items-center gap-3">
      {existingImageUrl && (
        <img
          src={existingImageUrl}
          alt="Current"
          className="h-14 w-14 shrink-0 rounded-lg border border-gray-200 object-cover"
        />
      )}

      <div className="min-w-0">
        <label
          htmlFor={id}
          className={`inline-flex items-center gap-2 rounded-lg border border-brand-red px-4 py-2 text-sm font-semibold text-brand-red transition-colors ${
            disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-brand-pink'
          }`}
        >
          {label}
        </label>
        <input
          id={id}
          type="file"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
        {fileNames.length > 0 && (
          <p className="mt-1 max-w-[16rem] truncate text-xs text-gray-600">
            {fileNames.length === 1 ? fileNames[0] : `${fileNames.length} files selected`}
          </p>
        )}
      </div>
    </div>
  );
}

export default FileUploadButton;
