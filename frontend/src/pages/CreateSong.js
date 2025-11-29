import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { songAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateSong = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    max_tokens: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setDownloadUrl(null);
    setLoading(true);

    try {
      if (isAuthenticated) {
        // Authenticated user - save to profile and process in background
        const payload = {
          title: formData.title,
          description: formData.description || null,
          prompt: formData.prompt,
        };

        if (formData.max_tokens) {
          payload.max_tokens = parseInt(formData.max_tokens, 10);
        }

        await songAPI.createSong(payload);
        navigate('/', { state: { message: 'Song creation started! Processing in background.' } });
      } else {
        // Anonymous user - generate immediately and provide download
        const payload = {
          prompt: formData.prompt,
        };

        const response = await songAPI.createAnonymousSong(payload);
        setDownloadUrl(response.data.download_url);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maxTokensLimit = user?.is_paid ? 4096 : user?.max_tokens || 256;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Song</h1>
          <p className="mt-2 text-gray-600">
            Describe the music you want to create and let AI generate it for you.
          </p>
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" role="note">
              <p className="text-sm text-yellow-800">
                ℹ️ You're creating as a guest. <a href="/signup" className="underline font-semibold">Sign up</a> to save songs to your profile!
              </p>
            </div>
          )}
        </div>

        {success && downloadUrl ? (
          <div className="card space-y-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Song Generated!</h2>
              <p className="text-gray-600 mb-6">Your song is ready to download.</p>
              
              <div className="space-y-4">
                <audio controls className="w-full mb-4" src={downloadUrl}>
                  Your browser does not support the audio element.
                </audio>
                
                <a
                  href={downloadUrl}
                  download
                  className="btn-primary inline-block"
                >
                  Download Song
                </a>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setDownloadUrl(null);
                    setFormData({ title: '', description: '', prompt: '', max_tokens: '' });
                  }}
                  className="btn-secondary ml-4"
                >
                  Create Another
                </button>
              </div>
              
              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <a href="/signup" className="underline font-semibold">Create an account</a> to save your songs and access them anytime!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="card">
              <div className="space-y-6">
                {isAuthenticated && (
                  <>
                    <div>
                      <label htmlFor="title" className="label">
                        Song Title *
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        className="input"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="My Awesome Song"
                        aria-required="true"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="label">
                        Description (optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="input"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="A brief description of your song"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="prompt" className="label">
                    Music Prompt *
                  </label>
                  <textarea
                    id="prompt"
                    name="prompt"
                    rows={4}
                    required
                    className="input"
                    value={formData.prompt}
                    onChange={handleChange}
                    placeholder="90s rock song with loud guitars and heavy drums"
                    aria-required="true"
                    aria-describedby="prompt-help"
                  />
                  <p id="prompt-help" className="mt-2 text-sm text-gray-500">
                    Describe the genre, instruments, mood, tempo, or any specific characteristics you want.
                  </p>
                </div>

                {isAuthenticated && user?.is_paid && (
                  <div>
                    <label htmlFor="max_tokens" className="label">
                      Max Tokens (optional)
                    </label>
                    <input
                      id="max_tokens"
                      name="max_tokens"
                      type="number"
                      min="256"
                      max={maxTokensLimit}
                      className="input"
                      value={formData.max_tokens}
                      onChange={handleChange}
                      placeholder={`Default: ${user.max_tokens}, Max: ${maxTokensLimit}`}
                      aria-describedby="tokens-help"
                    />
                    <p id="tokens-help" className="mt-2 text-sm text-gray-500">
                      Higher values generate longer songs. Range: 256-{maxTokensLimit}
                    </p>
                  </div>
                )}

                {isAuthenticated && !user?.is_paid && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" role="note">
                    <p className="text-sm text-blue-800">
                      <strong>Free users:</strong> Limited to {user?.max_tokens} tokens per song.
                    </p>
                  </div>
                )}
                
                {!isAuthenticated && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" role="note">
                    <p className="text-sm text-blue-800">
                      <strong>Guest users:</strong> Limited to 256 tokens per song. This may take a minute to generate.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                aria-busy={loading}
              >
                {loading ? (isAuthenticated ? 'Creating...' : 'Generating...') : 'Create Song'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default CreateSong;
