import React from 'react';
import { Link } from 'react-router-dom';

const SongCard = ({ song }) => {
  const getStatusBadge = () => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[song.status]}`}
        role="status"
        aria-label={`Song status: ${song.status}`}
      >
        {song.status.charAt(0).toUpperCase() + song.status.slice(1)}
      </span>
    );
  };

  return (
    <article className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{song.title}</h3>
          {song.description && (
            <p className="text-gray-600 text-sm mb-3">{song.description}</p>
          )}
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-medium">Prompt:</span> {song.prompt}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-medium">Max Tokens:</span> {song.max_tokens}
        </p>
      </div>

      {song.gcs_url && (
        <div className="mb-4">
          <audio
            controls
            className="w-full"
            aria-label={`Audio player for ${song.title}`}
          >
            <source src={song.gcs_url} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {song.error_message && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-sm text-red-600">
            <span className="font-medium">Error:</span> {song.error_message}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Link
          to={`/song/${song.id}`}
          className="btn-primary text-sm"
          aria-label={`View details for ${song.title}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
};

export default SongCard;
