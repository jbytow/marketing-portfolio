import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Media, MediaType } from '@/types';
import { getMediaUrl } from '@/lib/mediaUrl';

interface MediaCarouselProps {
  media: Media[];
  className?: string;
}

export default function MediaCarousel({ media, className = '' }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentMedia = media[currentIndex];

  const renderMedia = (item: Media) => {
    if (item.type === MediaType.YOUTUBE) {
      // YouTube URLs are already embed URLs, no need to transform
      return (
        <iframe
          src={item.url}
          title={item.altText || 'YouTube video'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (item.type === MediaType.VIDEO) {
      return (
        <video
          src={getMediaUrl(item.url)}
          controls
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        src={getMediaUrl(item.url)}
        alt={item.altText || ''}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main carousel */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {renderMedia(currentMedia)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - only show if more than 1 item */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-900/70 text-white hover:bg-dark-900/90 transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark-900/70 text-white hover:bg-dark-900/90 transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails - only show if 3+ items */}
      {media.length >= 3 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary-500'
                  : 'border-transparent hover:border-dark-500'
              }`}
            >
              {item.type === MediaType.YOUTUBE ? (
                <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
              ) : (
                <img
                  src={getMediaUrl(item.url)}
                  alt={item.altText || ''}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
