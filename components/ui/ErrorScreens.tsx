import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { AnimatedButton, AnimatedView } from './AnimatedComponents';

// Base error screen props
interface BaseErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
}

// Network error screen
export const NetworkErrorScreen: React.FC<BaseErrorScreenProps> = ({
  title = "No Internet Connection",
  message = "Please check your internet connection and try again.",
  onRetry,
  onGoBack,
  showRetry = true,
  showGoBack = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedView entrance="fade" style={styles.content}>
        {/* Network Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.icon, { color: colors.warning }]}>📡</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <AnimatedButton
              onPress={onRetry}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Try Again
              </Text>
            </AnimatedButton>
          )}

          {showGoBack && onGoBack && (
            <AnimatedButton
              onPress={onGoBack}
              style={[styles.secondaryButton, { 
                borderColor: colors.border,
                backgroundColor: 'transparent',
              }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Go Back
              </Text>
            </AnimatedButton>
          )}
        </View>
      </AnimatedView>
    </View>
  );
};

// Not found error screen (404)
export const NotFoundErrorScreen: React.FC<BaseErrorScreenProps> = ({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  onRetry,
  onGoBack,
  showRetry = false,
  showGoBack = true,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedView entrance="fade" style={styles.content}>
        {/* 404 Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.icon, { color: colors.error }]}>🔍</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

        <View style={styles.buttonContainer}>
          {showGoBack && onGoBack && (
            <AnimatedButton
              onPress={onGoBack}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Go Back
              </Text>
            </AnimatedButton>
          )}

          {showRetry && onRetry && (
            <AnimatedButton
              onPress={onRetry}
              style={[styles.secondaryButton, { 
                borderColor: colors.border,
                backgroundColor: 'transparent',
              }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Try Again
              </Text>
            </AnimatedButton>
          )}
        </View>
      </AnimatedView>
    </View>
  );
};

// Server error screen (500)
export const ServerErrorScreen: React.FC<BaseErrorScreenProps> = ({
  title = "Server Error",
  message = "Something went wrong on our end. Please try again later.",
  onRetry,
  onGoBack,
  showRetry = true,
  showGoBack = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedView entrance="fade" style={styles.content}>
        {/* Server Error Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.icon, { color: colors.error }]}>⚠️</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <AnimatedButton
              onPress={onRetry}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Try Again
              </Text>
            </AnimatedButton>
          )}

          {showGoBack && onGoBack && (
            <AnimatedButton
              onPress={onGoBack}
              style={[styles.secondaryButton, { 
                borderColor: colors.border,
                backgroundColor: 'transparent',
              }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Go Back
              </Text>
            </AnimatedButton>
          )}
        </View>
      </AnimatedView>
    </View>
  );
};

// Permission denied error screen
export const PermissionErrorScreen: React.FC<BaseErrorScreenProps & {
  permissionType?: string;
}> = ({
  title = "Permission Required",
  message = "This feature requires permission to work properly.",
  permissionType,
  onRetry,
  onGoBack,
  showRetry = true,
  showGoBack = false,
}) => {
  const { colors } = useTheme();

  const getPermissionMessage = () => {
    if (permissionType) {
      return `This feature requires ${permissionType} permission to work properly. Please grant permission in your device settings.`;
    }
    return message;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedView entrance="fade" style={styles.content}>
        {/* Permission Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.icon, { color: colors.warning }]}>🔒</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {getPermissionMessage()}
        </Text>

        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <AnimatedButton
              onPress={onRetry}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Grant Permission
              </Text>
            </AnimatedButton>
          )}

          {showGoBack && onGoBack && (
            <AnimatedButton
              onPress={onGoBack}
              style={[styles.secondaryButton, { 
                borderColor: colors.border,
                backgroundColor: 'transparent',
              }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Go Back
              </Text>
            </AnimatedButton>
          )}
        </View>
      </AnimatedView>
    </View>
  );
};

// Empty state screen (not exactly an error, but similar pattern)
export const EmptyStateScreen: React.FC<BaseErrorScreenProps & {
  emptyStateType?: 'search' | 'data' | 'favorites' | 'notifications';
}> = ({
  title,
  message,
  emptyStateType = 'data',
  onRetry,
  onGoBack,
  showRetry = false,
  showGoBack = false,
}) => {
  const { colors } = useTheme();

  const getEmptyStateContent = () => {
    switch (emptyStateType) {
      case 'search':
        return {
          icon: '🔍',
          defaultTitle: 'No Results Found',
          defaultMessage: 'Try adjusting your search terms or filters.',
        };
      case 'favorites':
        return {
          icon: '❤️',
          defaultTitle: 'No Favorites Yet',
          defaultMessage: 'Items you favorite will appear here.',
        };
      case 'notifications':
        return {
          icon: '🔔',
          defaultTitle: 'No Notifications',
          defaultMessage: 'You\'re all caught up! New notifications will appear here.',
        };
      default:
        return {
          icon: '📭',
          defaultTitle: 'No Data Available',
          defaultMessage: 'There\'s nothing to show right now.',
        };
    }
  };

  const { icon, defaultTitle, defaultMessage } = getEmptyStateContent();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedView entrance="fade" style={styles.content}>
        {/* Empty State Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.textSecondary + '20' }]}>
          <Text style={[styles.icon, { color: colors.textSecondary }]}>{icon}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {title || defaultTitle}
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message || defaultMessage}
        </Text>

        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <AnimatedButton
              onPress={onRetry}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Refresh
              </Text>
            </AnimatedButton>
          )}

          {showGoBack && onGoBack && (
            <AnimatedButton
              onPress={onGoBack}
              style={[styles.secondaryButton, { 
                borderColor: colors.border,
                backgroundColor: 'transparent',
              }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Go Back
              </Text>
            </AnimatedButton>
          )}
        </View>
      </AnimatedView>
    </View>
  );
};

// Generic error screen
export const GenericErrorScreen: React.FC<BaseErrorScreenProps> = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  onGoBack,
  showRetry = true,
  showGoBack = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedView entrance="fade" style={styles.content}>
        {/* Generic Error Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.icon, { color: colors.error }]}>😵</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <AnimatedButton
              onPress={onRetry}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Try Again
              </Text>
            </AnimatedButton>
          )}

          {showGoBack && onGoBack && (
            <AnimatedButton
              onPress={onGoBack}
              style={[styles.secondaryButton, { 
                borderColor: colors.border,
                backgroundColor: 'transparent',
              }]}
              pressAnimation="both"
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Go Back
              </Text>
            </AnimatedButton>
          )}
        </View>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});