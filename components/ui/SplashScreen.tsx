import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StatusBar, Text, View } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import { animationTiming, springConfigs } from '../../utils/appPolish';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  showLogo?: boolean;
  showTagline?: boolean;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  showLogo = true,
  showTagline = true,
  duration = 3000,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(30);
  const backgroundOpacity = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const particleRotation = useSharedValue(0);

  useEffect(() => {
    // Start animations sequence
    const startAnimations = () => {
      // Background fade in
      backgroundOpacity.value = withTiming(1, { duration: animationTiming.slow });

      // Logo animation
      logoOpacity.value = withDelay(
        200,
        withTiming(1, { duration: animationTiming.normal })
      );
      logoScale.value = withDelay(
        200,
        withSpring(1, springConfigs.bouncy)
      );

      // Tagline animation
      if (showTagline) {
        taglineOpacity.value = withDelay(
          800,
          withTiming(1, { duration: animationTiming.normal })
        );
        taglineTranslateY.value = withDelay(
          800,
          withSpring(0, springConfigs.gentle)
        );
      }

      // Particle animation
      particleOpacity.value = withDelay(
        400,
        withTiming(0.6, { duration: animationTiming.normal })
      );
      particleRotation.value = withDelay(
        400,
        withTiming(360, { duration: duration - 400 })
      );

      // Complete animation
      setTimeout(() => {
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      }, duration);
    };

    startAnimations();
  }, [duration, onAnimationComplete, showTagline, backgroundOpacity, logoOpacity, logoScale, particleOpacity, particleRotation, taglineOpacity, taglineTranslateY]);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
    transform: [{ rotate: `${particleRotation.value}deg` }],
  }));

  // Floating particle component
  const FloatingParticle: React.FC<{ index: number }> = ({ index }) => {
    const floatY = useSharedValue(0);
    const floatX = useSharedValue(0);
    const particleScale = useSharedValue(0.5);

    useEffect(() => {
      const delay = index * 200;
      
      floatY.value = withDelay(
        delay,
        withSequence(
          withTiming(-20, { duration: 2000 }),
          withTiming(20, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        )
      );
      
      floatX.value = withDelay(
        delay,
        withSequence(
          withTiming(10, { duration: 1500 }),
          withTiming(-10, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        )
      );

      particleScale.value = withDelay(
        delay,
        withSpring(1, springConfigs.gentle)
      );
    }, [index, floatX, floatY, particleScale]);

    const floatingStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: floatY.value },
        { translateX: floatX.value },
        { scale: particleScale.value },
      ],
      opacity: interpolate(
        particleOpacity.value,
        [0, 0.6],
        [0, 0.4],
        Extrapolation.CLAMP
      ),
    }));

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            top: `${20 + (index * 15)}%`,
            left: `${10 + (index * 20)}%`,
          },
          floatingStyle,
        ]}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <Animated.View style={[{ flex: 1 }, backgroundStyle]}>
        <LinearGradient
          colors={['#2D5016', '#87A96B', '#DAA520']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          {/* Floating Particles */}
          {Array.from({ length: 5 }, (_, index) => (
            <FloatingParticle key={index} index={index} />
          ))}

          {/* Main Content */}
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingHorizontal: 32,
            }}
          >
            {/* Logo */}
            {showLogo && (
              <Animated.View style={[logoStyle, { alignItems: 'center' }]}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 16,
                  }}
                >
                  {/* Logo Icon - Using a leaf/plant icon representation */}
                  <Animated.View style={[particleStyle]}>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#FDF6E3',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 32,
                          color: '#2D5016',
                          fontWeight: 'bold',
                        }}
                      >
                        🌱
                      </Text>
                    </View>
                  </Animated.View>
                </View>

                {/* App Name */}
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#FDF6E3',
                    textAlign: 'center',
                    marginBottom: 8,
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  UrbanForage
                </Text>
              </Animated.View>
            )}

            {/* Tagline */}
            {showTagline && (
              <Animated.View style={taglineStyle}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#FDF6E3',
                    textAlign: 'center',
                    opacity: 0.9,
                    fontWeight: '500',
                    letterSpacing: 0.5,
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Discover Local Food Communities
                </Text>
              </Animated.View>
            )}

            {/* Loading Indicator */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 80,
                  alignItems: 'center',
                },
                taglineStyle,
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={[
                    {
                      height: '100%',
                      backgroundColor: '#FDF6E3',
                      borderRadius: 2,
                    },
                    useAnimatedStyle(() => ({
                      width: `${interpolate(
                        backgroundOpacity.value,
                        [0, 1],
                        [0, 100],
                        Extrapolation.CLAMP
                      )}%`,
                    })),
                  ]}
                />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: '#FDF6E3',
                  marginTop: 12,
                  opacity: 0.8,
                }}
              >
                Loading...
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;