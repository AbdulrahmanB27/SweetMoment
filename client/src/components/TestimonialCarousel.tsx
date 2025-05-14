import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Testimonial from './Testimonial';

interface TestimonialData {
  id?: number;
  text: string;
  name?: string;
  author?: string;
  location?: string;
  rating: number;
  date?: string;
  avatar?: string;
  initial?: string;
}

interface TestimonialCarouselProps {
  testimonials: TestimonialData[];
  autoplayInterval?: number;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ 
  testimonials, 
  autoplayInterval = 5000 // Default to 5 seconds if not specified
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false
  });
  
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
    // Temporarily pause autoplay when manually navigating
    setAutoplayEnabled(false);
    // Resume autoplay after a short delay
    setTimeout(() => setAutoplayEnabled(true), autoplayInterval);
  }, [emblaApi, autoplayInterval]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
    // Temporarily pause autoplay when manually navigating
    setAutoplayEnabled(false);
    // Resume autoplay after a short delay
    setTimeout(() => setAutoplayEnabled(true), autoplayInterval);
  }, [emblaApi, autoplayInterval]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Setup initial event listeners
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Setup autoplay
  useEffect(() => {
    if (!emblaApi || !autoplayEnabled) return;
    
    const autoplayTimer = setInterval(() => {
      if (emblaApi && autoplayEnabled) {
        emblaApi.scrollNext();
      }
    }, autoplayInterval);
    
    // For handling timeout for resuming autoplay
    let resumeTimer: ReturnType<typeof setTimeout>;
    
    // Pause autoplay when user interacts with the carousel
    const pauseAutoPlay = () => {
      setAutoplayEnabled(false);
      // Resume after interaction stops
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => setAutoplayEnabled(true), 5000);
    };
    
    emblaApi.on('pointerDown', pauseAutoPlay);
    
    return () => {
      clearInterval(autoplayTimer);
      clearTimeout(resumeTimer);
      if (emblaApi) {
        emblaApi.off('pointerDown', pauseAutoPlay);
      }
    };
  }, [emblaApi, autoplayEnabled, autoplayInterval]);

  return (
    <div className="relative max-w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {testimonials.map((testimonial, index) => (
            <div
              key={`testimonial-carousel-${index}`}
              className="flex-[0_0_100%] min-w-0 pl-4 pr-4"
            >
              <div className="mx-auto max-w-md">
                <Testimonial
                  text={testimonial.text}
                  name={testimonial.name}
                  author={testimonial.author}
                  location={testimonial.location}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  avatar={testimonial.avatar}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons removed as requested */}

      {/* Dots indicator */}
      <div className="flex justify-center mt-4">
        {testimonials.map((_, index) => (
          <button
            key={`dot-${index}`}
            className={`w-2 h-2 mx-1 rounded-full transition-colors ${
              index === selectedIndex
                ? 'bg-[#6F4E37]'
                : 'bg-[#D4C3A3] hover:bg-[#6F4E37]/50'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
            onClick={() => {
              if (emblaApi) emblaApi.scrollTo(index);
              // Temporarily pause autoplay when manually navigating
              setAutoplayEnabled(false);
              // Resume autoplay after a short delay
              setTimeout(() => setAutoplayEnabled(true), autoplayInterval);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;