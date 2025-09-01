import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
    ACCESSIBILITY_ROLES,
    getLoadingAccessibilityLabel
} from '../../utils/accessibility';
import {
    DotsLoading,
    PulseLoading,
    SkeletonCard,
    SkeletonCircle,
    SkeletonLine,
    SkeletonList,
    SkeletonProfile,
    SpinnerLoading,
    WaveLoading
} from './LoadingStates';

interface AccessibleLoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  context?: string;
  announceOnMount?: boolean;
  showMessage?: boolean;
  color?: string;
  style?: any;
}

export const AccessibleLoading: React.FC<AccessibleLoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  message,
  context = 'content',
  announceOnMount = true,
  showMessage = true,
  color,
  style,
}) => {
  const { isScreenReaderEnabled, announceMessage } = useAccessibility();

  const loadingMessage = message || getLoadingAccessibilityLabel(context);

  useEffect(() => {
    if (announceOnMount && isScreenReaderEnabled) {
      announceMessage(loadingMessage);
    }
  }, [announceOnMount, isScreenReaderEnabled, announceMessage, loadingMessage]);

  const renderLoader = () => {
    const commonProps = { size, color, style };
    
    switch (type) {
      case 'dots':
        return <DotsLoading {...commonProps} />;
      case 'pulse':
        return <PulseLoading {...commonProps} />;
      case 'wave':
        return <WaveLoading {...commonProps} />;
      case 'skeleton':
        return <SkeletonLine width="100%" height={size === 'small' ? 20 : size === 'large' ? 40 : 30} />;
      default:
        return <SpinnerLoading {...commonProps} />;
    }
  };

  return (
    <View 
      style={[{ alignItems: 'center', justifyContent: 'center', padding: 16 }, style]}
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={loadingMessage}
      accessibilityState={{ busy: true }}
    >
      {renderLoader()}
      {showMessage && (
        <Text 
          className="text-gray-600 text-sm mt-3 text-center"
          accessible={true}
          accessibilityRole={ACCESSIBILITY_ROLES.TEXT}
        >
          {loadingMessage}
        </Text>
      )}
    </View>
  );
};

// Accessible skeleton components with proper ARIA labels
interface AccessibleSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  accessibilityLabel?: string;
}

export const AccessibleSkeletonLine: React.FC<AccessibleSkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
  accessibilityLabel = 'Loading content',
}) => {
  return (
    <View
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
    >
      <SkeletonLine 
        width={width} 
        height={height} 
        borderRadius={borderRadius} 
        style={style} 
      />
    </View>
  );
};

export const AccessibleSkeletonCircle: React.FC<{ 
  size: number; 
  style?: any; 
  accessibilityLabel?: string;
}> = ({
  size,
  style,
  accessibilityLabel = 'Loading profile image',
}) => {
  return (
    <View
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
    >
      <SkeletonCircle size={size} style={style} />
    </View>
  );
};

export const AccessibleSkeletonCard: React.FC<{ 
  style?: any; 
  accessibilityLabel?: string;
}> = ({
  style,
  accessibilityLabel = 'Loading food listing card',
}) => {
  const { announceMessage, isScreenReaderEnabled } = useAccessibility();

  useEffect(() => {
    if (isScreenReaderEnabled) {
      announceMessage(accessibilityLabel);
    }
  }, [isScreenReaderEnabled, announceMessage, accessibilityLabel]);

  return (
    <View
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
    >
      <SkeletonCard style={style} />
    </View>
  );
};

export const AccessibleSkeletonList: React.FC<{ 
  itemCount?: number; 
  style?: any; 
  accessibilityLabel?: string;
}> = ({
  itemCount = 5,
  style,
  accessibilityLabel,
}) => {
  const { announceMessage, isScreenReaderEnabled } = useAccessibility();
  const label = accessibilityLabel || `Loading list with ${itemCount} items`;

  useEffect(() => {
    if (isScreenReaderEnabled) {
      announceMessage(label);
    }
  }, [isScreenReaderEnabled, announceMessage, label]);

  return (
    <View
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <SkeletonList itemCount={itemCount} style={style} />
    </View>
  );
};

export const AccessibleSkeletonProfile: React.FC<{ 
  style?: any; 
  accessibilityLabel?: string;
}> = ({
  style,
  accessibilityLabel = 'Loading user profile',
}) => {
  const { announceMessage, isScreenReaderEnabled } = useAccessibility();

  useEffect(() => {
    if (isScreenReaderEnabled) {
      announceMessage(accessibilityLabel);
    }
  }, [isScreenReaderEnabled, announceMessage, accessibilityLabel]);

  return (
    <View
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
    >
      <SkeletonProfile style={style} />
    </View>
  );
};

// Full screen accessible loading
interface AccessibleFullScreenLoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'wave';
  message?: string;
  showMessage?: boolean;
  onMount?: () => void;
}

export const AccessibleFullScreenLoading: React.FC<AccessibleFullScreenLoadingProps> = ({
  type = 'spinner',
  message = 'Loading...',
  showMessage = true,
  onMount,
}) => {
  const { isScreenReaderEnabled, announceMessage } = useAccessibility();

  useEffect(() => {
    if (isScreenReaderEnabled) {
      announceMessage(`Full screen loading. ${message}`);
    }
    onMount?.();
  }, [isScreenReaderEnabled, announceMessage, message, onMount]);

  return (
    <View 
      className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6"
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={`Loading screen. ${message}`}
      accessibilityState={{ busy: true }}
    >
      <AccessibleLoading 
        type={type}
        size="large"
        message={message}
        showMessage={showMessage}
        announceOnMount={false} // Already announced above
      />
    </View>
  );
};

// Loading overlay with backdrop
interface AccessibleLoadingOverlayProps {
  visible: boolean;
  message?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'wave';
  onShow?: () => void;
  onHide?: () => void;
}

export const AccessibleLoadingOverlay: React.FC<AccessibleLoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  type = 'spinner',
  onShow,
  onHide,
}) => {
  const { isScreenReaderEnabled, announceMessage } = useAccessibility();

  useEffect(() => {
    if (visible) {
      if (isScreenReaderEnabled) {
        announceMessage(`Loading overlay shown. ${message}`);
      }
      onShow?.();
    } else {
      if (isScreenReaderEnabled) {
        announceMessage('Loading completed');
      }
      onHide?.();
    }
  }, [visible, isScreenReaderEnabled, announceMessage, message, onShow, onHide]);

  if (!visible) return null;

  return (
    <View 
      className="absolute inset-0 bg-black/50 items-center justify-center z-50"
      accessible={true}
      accessibilityRole={ACCESSIBILITY_ROLES.PROGRESSBAR}
      accessibilityLabel={`Loading overlay. ${message}`}
      accessibilityState={{ busy: true }}
      accessibilityViewIsModal={true}
    >
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-6 shadow-2xl">
        <AccessibleLoading 
          type={type}
          size="large"
          message={message}
          showMessage={true}
          announceOnMount={false} // Already announced above
        />
      </View>
    </View>
  );
};

export default {
  AccessibleLoading,
  AccessibleSkeletonLine,
  AccessibleSkeletonCircle,
  AccessibleSkeletonCard,
  AccessibleSkeletonList,
  AccessibleSkeletonProfile,
  AccessibleFullScreenLoading,
  AccessibleLoadingOverlay,
};