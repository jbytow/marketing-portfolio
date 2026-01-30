import { Link } from 'react-router-dom';

interface HashtagListProps {
  hashtags: string[];
  clickable?: boolean;
  limit?: number;
  className?: string;
}

export default function HashtagList({
  hashtags,
  clickable = true,
  limit,
  className = '',
}: HashtagListProps) {
  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  const displayHashtags = limit ? hashtags.slice(0, limit) : hashtags;
  const remainingCount = limit && hashtags.length > limit ? hashtags.length - limit : 0;

  if (clickable) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {displayHashtags.map((hashtag) => (
          <Link
            key={hashtag}
            to={`/projects?hashtag=${encodeURIComponent(hashtag)}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors"
          >
            #{hashtag}
          </Link>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-dark-700 text-dark-400">
            +{remainingCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayHashtags.map((hashtag) => (
        <span
          key={hashtag}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-dark-700 text-dark-300"
        >
          #{hashtag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-dark-700 text-dark-400">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
