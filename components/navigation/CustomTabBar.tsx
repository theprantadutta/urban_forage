import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/themeStore';

const { width: screenWidth } = Dimensions.get('window');

interface TabConfig {
  name: string;
  title: string;
  icon: string;
  iconFocused: string;
  isFloatingButton?: boolean;
}

const tabConfigs: Record<string, TabConfig> = {
  index: {
    name: 'index',
    title: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  explore: {
    name: 'explore',
    title: 'Explore',
    icon: 'search-outline',
    iconFocused: 'search',
  },
  add: {
    name: 'add',
    title: 'Share',
    icon: 'add-circle-outline',
    iconFocused: 'add-circle',
    isFloatingButton: true,
  },
  messages: {
    name: 'messages',
    title: 'Messages',
    icon: 'chatbubbles-outline',
    iconFocused: 'chatbubbles',
  },
  profile: {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline',
    iconFocused: 'person',
  },
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const { colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const tabWidth = screenWidth / state.routes.length;

  // Animated values
  const indicatorPosition = useSharedValue(0);

  // Create animated values for each tab
  const tabScale0 = useSharedValue(1);
  const tabScale1 = useSharedValue(1);
  const tabScale2 = useSharedValue(1);
  const tabScale3 = useSharedValue(1);
  const tabScale4 = useSharedValue(1);

  const tabOpacity0 = useSharedValue(0.6);
  const tabOpacity1 = useSharedValue(0.6);
  const tabOpacity2 = useSharedValue(0.6);
  const tabOpacity3 = useSharedValue(0.6);
  const tabOpacity4 = useSharedValue(0.6);

  const tabScales = useMemo(() => [tabScale0, tabScale1, tabScale2, tabScale3, tabScale4], [
    tabScale0, tabScale1, tabScale2, tabScale3, tabScale4
  ]);
  const tabOpacities = useMemo(() => [tabOpacity0, tabOpacity1, tabOpacity2, tabOpacity3, tabOpacity4], [
    tabOpacity0, tabOpacity1, tabOpacity2, tabOpacity3, tabOpacity4
  ]);

  // Update indicator position when active tab changes
  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 200,
    });

    // Update tab animations
    tabScales.forEach((scale: Animated.SharedValue<number>, index: number) => {
      scale.value = withSpring(index === state.index ? 1.1 : 1, {
        damping: 15,
        stiffness: 300,
      });
    });

    tabOpacities.forEach((opacity: Animated.SharedValue<number>, index: number) => {
      opacity.value = withTiming(index === state.index ? 1 : 0.6, {
        duration: 200,
      });
    });
  }, [state.index, tabWidth, indicatorPosition, tabScales, tabOpacities]);

  // Animated styles for indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  const handleTabPress = (route: any) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      navigation.navigate(route.name);
    }
  };

  return (
    <View style={{ 
      backgroundColor: colors.surface, 
      borderTopColor: colors.border, 
      borderTopWidth: 1,
      paddingBottom: insets.bottom,
    }}>
      {/* Animated Indicator */}
      <Animated.View
        style={[
          indicatorStyle,
          {
            position: 'absolute',
            top: 0,
            width: tabWidth,
            height: 3,
            backgroundColor: colors.primary,
          },
        ]}
      />

      {/* Tab Bar Content */}
      <View style={{ flexDirection: 'row', height: 80, paddingBottom: 8 }}>
        {state.routes.map((route, index) => (
          <TabButton
            key={route.key}
            route={route}
            index={index}
            isFocused={state.index === index}
            tabConfig={tabConfigs[route.name]}
            colors={colors}
            tabScale={tabScales[index]}
            tabOpacity={tabOpacities[index]}
            onPress={() => handleTabPress(route)}
          />
        ))}
      </View>
    </View>
  );
};

// Separate component for individual tabs to avoid hooks in callbacks
interface TabButtonProps {
  route: any;
  index: number;
  isFocused: boolean;
  tabConfig: TabConfig | undefined;
  colors: any;
  tabScale: Animated.SharedValue<number>;
  tabOpacity: Animated.SharedValue<number>;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  route,
  isFocused,
  tabConfig,
  colors,
  tabScale,
  tabOpacity,
  onPress,
}) => {
  // Always call hooks first, before any early returns
  const tabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: tabScale.value }],
      opacity: tabOpacity.value,
    };
  });

  const floatingButtonStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      tabScale.value,
      [1, 1.1],
      [1, 1.05]
    );

    return {
      transform: [
        { scale },
        { translateY: isFocused ? -8 : -4 },
      ],
    };
  });

  // Fallback if tabConfig doesn't exist
  if (!tabConfig) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}
      >
        <View style={{ alignItems: 'center' }}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: colors.textSecondary,
              marginTop: 4,
            }}
          >
            {route.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const isFloatingButton = tabConfig?.isFloatingButton;

  if (isFloatingButton) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={floatingButtonStyle}>
          <TouchableOpacity
            onPress={onPress}
            style={{
              width: 56,
              height: 56,
              backgroundColor: colors.primary,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons
              name={isFocused ? tabConfig.iconFocused as any : tabConfig.icon as any}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
        <Text style={{
          fontSize: 12,
          color: colors.primary,
          fontWeight: '500',
          marginTop: 4
        }}>
          {tabConfig.title}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}
    >
      <Animated.View style={[tabAnimatedStyle, { alignItems: 'center' }]}>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 4, position: 'relative' }}>
          <Ionicons
            name={isFocused ? tabConfig.iconFocused as any : tabConfig.icon as any}
            size={24}
            color={isFocused ? colors.primary : colors.textSecondary}
          />

          {/* Badge for messages (example) */}
          {route.name === 'messages' && (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -8,
              width: 16,
              height: 16,
              backgroundColor: colors.error,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                2
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: isFocused ? colors.primary : colors.textSecondary,
          }}
        >
          {tabConfig.title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};