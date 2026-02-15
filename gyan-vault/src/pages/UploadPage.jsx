import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineCheckCircle } from 'react-icons/hi';
import Sidebar from '../components/Sidebar';
import api from '../api';

function UploadPage() {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [uploadedDoc, setUploadedDoc] = useState(null);
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile);
        } else {
            toast.error('Only PDF files are supported');
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress('Uploading document...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            setProgress('Processing PDF — extracting text, chunking, generating embeddings...');
            const res = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadedDoc(res.data);
            setProgress('');
            toast.success('Document uploaded and processed successfully!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Upload failed');
            setProgress('');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Upload Document</h1>
                    <p className="page-subtitle">Upload a PDF to add to your knowledge base</p>
                </div>

                {!uploadedDoc ? (
                    <>
                        {/* Drop Zone */}
                        <div
                            className={`drop-zone ${dragging ? 'drop-zone-active' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".pdf"
                                onChange={handleFileSelect}
                                hidden
                            />
                            <HiOutlineCloudUpload size={48} className="drop-zone-icon" />
                            <p className="drop-zone-text">
                                Drag & drop your PDF here, or <span className="text-blue-400">browse</span>
                            </p>
                            <p className="drop-zone-hint">Supports PDF files only</p>
                        </div>

                        {/* Selected File Preview */}
                        {file && (
                            <div className="file-preview">
                                <div className="file-preview-info">
                                    <HiOutlineDocumentText size={24} className="text-blue-400" />
                                    <div>
                                        <p className="file-name">{file.name}</p>
                                        <p className="file-size">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    className="upload-btn"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="spinner"></span>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Upload & Process'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Progress */}
                        {progress && (
                            <div className="processing-status">
                                <div className="processing-spinner"></div>
                                <p>{progress}</p>
                            </div>
                        )}
                    </>
                ) : (
                    /* Success State */
                    <div className="upload-success">
                        <HiOutlineCheckCircle size={64} className="text-green-400" />
                        <h2 className="success-title">Document Processed Successfully!</h2>
                        <div className="success-stats">
                            <div className="success-stat">
                                <span className="success-stat-value">{uploadedDoc.page_count}</span>
                                <span className="success-stat-label">Pages</span>
                            </div>
                            <div className="success-stat">
                                <span className="success-stat-value">{uploadedDoc.chunk_count}</span>
                                <span className="success-stat-label">Chunks</span>
                            </div>
                        </div>
                        <div className="success-actions">
                            <button className="primary-btn" onClick={() => navigate('/query')}>
                                Ask Questions
                            </button>
                            <button
                                className="secondary-btn"
                                onClick={() => { setFile(null); setUploadedDoc(null); }}
                            >
                                Upload Another
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default UploadPage;
