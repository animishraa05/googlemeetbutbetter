import { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react';
import { uploadAPI } from '../../api';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };

interface FileUploadProps {
  onUploadSuccess: (fileUrl: string, fileName: string) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{name: string, url: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const res = await uploadAPI.uploadFile(file);
      const fileUrl = res.data.fileUrl; // assuming API returns this
      setUploadedFile({ name: file.name, url: fileUrl });
      onUploadSuccess(fileUrl, file.name);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    onUploadSuccess('', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
      />

      {!uploadedFile && !uploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...IN, fontSize: '14px', fontWeight: 600, color: '#333',
            background: '#F5F5F5', border: '2px dashed #CCC',
            borderRadius: '4px', padding: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.background = '#EEE'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CCC'; e.currentTarget.style.background = '#F5F5F5'; }}
        >
          <Upload size={18} />
          Attach a file
        </button>
      )}

      {uploading && (
        <div style={{ ...IN, fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', background: '#F5F5F5', borderRadius: '4px' }}>
          <Loader2 size={16} className="animate-spin" />
          Uploading...
        </div>
      )}

      {uploadedFile && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#E6F4FF', border: '2px solid #0085FF', borderRadius: '4px', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <FileIcon size={20} color="#0085FF" />
            <span style={{ ...IN, fontSize: '14px', fontWeight: 500, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {uploadedFile.name}
            </span>
          </div>
          <button type="button" onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="#666" />
          </button>
        </div>
      )}

      {error && <div style={{ ...IN, fontSize: '13px', color: '#FF3D57' }}>{error}</div>}
    </div>
  );
}
