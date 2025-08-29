import { OnboardingSlide } from '../types/onboarding';

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Local Food',
    subtitle: 'Fresh & Sustainable',
    description: 'Find fresh, local produce and homemade goods from your neighbors. Support your community while enjoying the best seasonal offerings.',
    illustration: 'discover', // Will be replaced with actual illustrations
    backgroundColor: '#2D5016',
    textColor: '#FDF6E3',
  },
  {
    id: '2',
    title: 'Share Your Harvest',
    subtitle: 'Build Community',
    description: 'Got extra vegetables from your garden? Share them with neighbors and build meaningful connections around food.',
    illustration: 'share',
    backgroundColor: '#87A96B',
    textColor: '#2D5016',
  },
  {
    id: '3',
    title: 'Reduce Food Waste',
    subtitle: 'Make a Difference',
    description: 'Join the movement to reduce food waste while creating a more sustainable and connected community.',
    illustration: 'sustainability',
    backgroundColor: '#D2691E',
    textColor: '#FDF6E3',
  },
];

export const ONBOARDING_CONFIG = {
  SLIDE_DURATION: 300,
  AUTO_ADVANCE_DELAY: 5000,
  ANIMATION_SPRING_CONFIG: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;