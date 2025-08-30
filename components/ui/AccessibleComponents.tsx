import React, { useEffect, useRef } from 'react';
import {
    Image,
    ImageProps,
    ScrollView,
    ScrollViewProps,
    Switch,
    SwitchProps,
    Text,
    TextInput,
    TextInputProps,
    TextProps,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewProps,
    findNodeHandle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import {
    AccessibilityHelpers,
    AccessibilityRoles,
    buildAccessibilityProps,
    useAccessibility,
} from '../../utils/accessibility';

// Accessible Button Component
interface AccessibleButtonProps extends TouchableOpacityProps {
  label: string;
  hint?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  label,
  hint,
  onPress,
  disabled = false,
  loading = false,
  children,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const { announceMessage } = useAccessibility();
  const buttonRef = useRef<any>(null);

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
      // Announce button press for screen readers
      announceMessage(`${label} activated`);
    }
  };

  const accessibilityProps = buildAccessibilityProps({
    label: loading ? `${label}, loading` : label,
    hint: hint || (disabled ? 'Button is disabled' : 'Double tap to activate'),
    role: AccessibilityRoles.BUTTON,
    state: {
      disabled: disabled || loading,
      busy: loading,
    },
  });

  return (
    <TouchableOpacity
      ref={buttonRef}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        {
          minWidth: AccessibilityHelpers.getTouchTargetSize(44),
          minHeight: AccessibilityHelpers.getTouchTargetSize(44),
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// Accessible Text Component with semantic roles
interface AccessibleTextProps extends Omit<TextProps, 'role'> {
  children: React.ReactNode;
  role?: 'heading' | 'text' | 'label';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  announce?: boolean;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  role = 'text',
  level,
  announce = false,
  style,
  ...props
}) => {
  const { announceMessage } = useAccessibility();
  const textContent = typeof children === 'string' ? children : '';

  useEffect(() => {
    if (announce && textContent) {
      announceMessage(textContent);
    }
  }, [announce, textContent, announceMessage]);

  const accessibilityProps = buildAccessibilityProps({
    role: role === 'heading' ? AccessibilityRoles.HEADING : AccessibilityRoles.TEXT,
  });

  // Add heading level for iOS
  if (role === 'heading' && level) {
    accessibilityProps.accessibilityLevel = level;
  }

  return (
    <Text
      style={style}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </Text>
  );
};

// Accessible Input Component
interface AccessibleInputProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  hint,
  error,
  required = false,
  value,
  onChangeText,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const { announceMessage } = useAccessibility();
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    
    // Announce validation errors
    if (error) {
      announceMessage(`Error: ${error}`);
    }
  };

  const accessibilityLabel = AccessibilityHelpers.createLabel(
    label,
    required ? 'required' : undefined,
    error ? `Error: ${error}` : undefined
  );

  const accessibilityHint = hint || 'Text input field';

  const accessibilityProps = buildAccessibilityProps({
    label: accessibilityLabel,
    hint: accessibilityHint,
    state: {
      invalid: !!error,
    },
    value: value,
  });

  return (
    <View>
      <AccessibleText role="label" style={{ marginBottom: 4, color: colors.text }}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </AccessibleText>
      
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        style={[
          {
            minHeight: AccessibilityHelpers.getTouchTargetSize(44),
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: colors.text,
            backgroundColor: colors.background,
          },
          style,
        ]}
        {...accessibilityProps}
        {...props}
      />
      
      {error && (
        <AccessibleText
          role="text"
          style={{ color: colors.error, fontSize: 12, marginTop: 4 }}
          announce={true}
        >
          {error}
        </AccessibleText>
      )}
    </View>
  );
};

// Accessible Image Component
interface AccessibleImageProps extends ImageProps {
  alt: string;
  decorative?: boolean;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  alt,
  decorative = false,
  style,
  ...props
}) => {
  const accessibilityProps = decorative
    ? { accessible: false }
    : buildAccessibilityProps({
        label: alt,
        role: AccessibilityRoles.IMAGE,
      });

  return (
    <Image
      style={style}
      {...accessibilityProps}
      {...props}
    />
  );
};

// Accessible Switch Component
interface AccessibleSwitchProps extends SwitchProps {
  label: string;
  description?: string;
}

export const AccessibleSwitch: React.FC<AccessibleSwitchProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  ...props
}) => {
  const { colors } = useTheme();
  const { announceMessage } = useAccessibility();

  const handleValueChange = (newValue: boolean) => {
    onValueChange?.(newValue);
    announceMessage(`${label} ${newValue ? 'enabled' : 'disabled'}`);
  };

  const accessibilityProps = buildAccessibilityProps({
    label,
    hint: description || 'Double tap to toggle',
    role: AccessibilityRoles.SWITCH,
    state: {
      checked: value,
      disabled,
    },
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <AccessibleText role="label" style={{ color: colors.text }}>
          {label}
        </AccessibleText>
        {description && (
          <AccessibleText style={{ color: colors.textSecondary, fontSize: 12 }}>
            {description}
          </AccessibleText>
        )}
      </View>
      
      <Switch
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...accessibilityProps}
        {...props}
      />
    </View>
  );
};

// Accessible List Component
interface AccessibleListProps extends ScrollViewProps {
  children: React.ReactNode;
  announcement?: string;
}

export const AccessibleList: React.FC<AccessibleListProps> = ({
  children,
  announcement,
  ...props
}) => {
  const { announceMessage } = useAccessibility();

  useEffect(() => {
    if (announcement) {
      announceMessage(announcement);
    }
  }, [announcement, announceMessage]);

  const accessibilityProps = buildAccessibilityProps({
    role: AccessibilityRoles.LIST,
  });

  return (
    <ScrollView
      {...accessibilityProps}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

// Accessible List Item Component
interface AccessibleListItemProps extends TouchableOpacityProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  index?: number;
  totalItems?: number;
}

export const AccessibleListItem: React.FC<AccessibleListItemProps> = ({
  children,
  onPress,
  selected = false,
  index,
  totalItems,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const positionInfo = index !== undefined && totalItems !== undefined
    ? `${index + 1} of ${totalItems}`
    : undefined;

  const accessibilityProps = buildAccessibilityProps({
    role: AccessibilityRoles.LIST_ITEM,
    hint: onPress ? 'Double tap to select' : undefined,
    state: {
      selected,
    },
  });

  if (positionInfo) {
    accessibilityProps.accessibilityValue = { text: positionInfo };
  }

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      style={[
        {
          minHeight: AccessibilityHelpers.getTouchTargetSize(44),
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: selected ? colors.primary + '20' : 'transparent',
        },
        style,
      ]}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </Component>
  );
};

// Accessible Modal/Dialog Component
interface AccessibleModalProps extends ViewProps {
  children: React.ReactNode;
  title: string;
  visible: boolean;
  onClose?: () => void;
  closeButtonLabel?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  children,
  title,
  visible,
  onClose,
  closeButtonLabel = 'Close',
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const { announceMessage, setFocus } = useAccessibility();
  const modalRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      // Announce modal opening
      announceMessage(`${title} dialog opened`);
      
      // Set focus to modal
      setTimeout(() => {
        const reactTag = findNodeHandle(modalRef.current);
        if (reactTag) {
          setFocus(reactTag);
        }
      }, 100);
    }
  }, [visible, title, announceMessage, setFocus]);

  if (!visible) return null;

  const accessibilityProps = buildAccessibilityProps({
    role: AccessibilityRoles.DIALOG,
    label: title,
  });

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        ref={modalRef}
        style={[
          {
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 20,
            margin: 20,
            maxWidth: '90%',
            maxHeight: '80%',
          },
          style,
        ]}
        {...accessibilityProps}
        {...props}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <AccessibleText role="heading" level={2} style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
            {title}
          </AccessibleText>
          
          {onClose && (
            <AccessibleButton
              label={closeButtonLabel}
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: colors.text }}>✕</Text>
            </AccessibleButton>
          )}
        </View>
        
        {children}
      </View>
    </View>
  );
};

// Accessible Progress Bar Component
interface AccessibleProgressBarProps extends ViewProps {
  progress: number; // 0 to 1
  label?: string;
  showPercentage?: boolean;
}

export const AccessibleProgressBar: React.FC<AccessibleProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const percentage = Math.round(progress * 100);

  const accessibilityProps = buildAccessibilityProps({
    role: AccessibilityRoles.PROGRESS_BAR,
    label: label || 'Progress',
    value: `${percentage} percent`,
  });

  return (
    <View style={style} {...props}>
      {label && (
        <AccessibleText style={{ marginBottom: 8, color: colors.text }}>
          {label}
          {showPercentage && ` (${percentage}%)`}
        </AccessibleText>
      )}
      
      <View
        style={{
          height: 8,
          backgroundColor: colors.border,
          borderRadius: 4,
          overflow: 'hidden',
        }}
        {...accessibilityProps}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
};