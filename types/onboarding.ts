export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  illustration: string;
  backgroundColor: string;
  textColor: string;
}

export interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}