import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { songAPI } from '../services/api';

const SongDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSong();
    const interval = setInterval(loadSong, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const loadSong = async () => {
    try {
      const response = await songAPI.getSong(id);
      setSong(response.data.song);
      setEditData({
        title: response.data.song.title,
        description: response.data.song.description || '',
      });
      setError('');
    } catch (err) {
      setError('Failed to load song');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await songAPI.updateSong(id, editData);
      setEditing(false);
      loadSong();
    } catch (err) {
      setError('Failed to update song');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }

    setDeleting(true);
    try {
      await songAPI.deleteSong(id);
      navigate('/', { state: { message: 'Song deleted successfully' } });
    } catch (err) {
      setError('Failed to delete song');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" aria-hidden="true"></div>
            <p className="mt-4 text-gray-600" aria-label="Loading song details">Loading song...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !song) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = () => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[song.status]}`}
        role="status"
        aria-label={`Song status: ${song.status}`}
      >
        {song.status.charAt(0).toUpperCase() + song.status.slice(1)}
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-primary-600 hover:text-primary-700 flex items-center"
          aria-label="Back to songs list"
        >
          ← Back to Songs
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="label">Title</label>
                    <input
                      id="edit-title"
                      type="text"
                      className="input"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-description" className="label">Description</label>
                    <textarea
                      id="edit-description"
                      className="input"
                      rows={3}
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={handleUpdate} className="btn-primary">
                      Save
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{song.title}</h1>
                  {song.description && (
                    <p className="text-gray-600 mb-4">{song.description}</p>
                  )}
                </>
              )}
            </div>
            {!editing && getStatusBadge()}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Prompt</p>
              <p className="mt-1 text-gray-900">{song.prompt}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Max Tokens</p>
              <p className="mt-1 text-gray-900">{song.max_tokens}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Created</p>
              <p className="mt-1 text-gray-900">
                {new Date(song.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {song.gcs_url && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Generated Audio</p>
              <audio
                controls
                className="w-full"
                aria-label={`Audio player for ${song.title}`}
              >
                <source src={song.gcs_url} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              <a
                href={song.gcs_url}
                download
                className="mt-3 inline-block btn-secondary text-sm"
                aria-label={`Download ${song.title}`}
              >
                Download
              </a>
            </div>
          )}

          {song.error_message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p className="text-sm font-medium text-red-800 mb-1">Generation Error</p>
              <p className="text-sm text-red-600">{song.error_message}</p>
            </div>
          )}

          {!editing && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary"
                aria-label="Edit song details"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger"
                aria-label="Delete song"
                aria-busy={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SongDetails;
