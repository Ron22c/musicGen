import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SongCard from '../components/SongCard';
import { songAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadSongs();
    const interval = setInterval(loadSongs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSongs = async () => {
    try {
      const response = await songAPI.getSongs();
      setSongs(response.data.songs);
      setError('');
    } catch (err) {
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" aria-hidden="true"></div>
            <p className="mt-4 text-gray-600" aria-label="Loading songs">Loading your songs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Songs</h1>
            <p className="mt-2 text-gray-600">
              {user?.is_paid ? `Premium User - Up to ${user.max_tokens} tokens` : `Free User - Up to ${user?.max_tokens} tokens`}
            </p>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary"
            aria-label="Create new song"
          >
            + Create Song
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {songs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">You haven't created any songs yet.</p>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary"
            >
              Create Your First Song
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SongList;
