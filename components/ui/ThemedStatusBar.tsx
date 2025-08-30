import { StatusBar, StatusBarStyle } from "expo-status-bar";
import React from "react";
import { useTheme } from "../../providers/ThemeProvider";

interface ThemedStatusBarProps {
  style?: StatusBarStyle;
}

export const ThemedStatusBar: React.FC<ThemedStatusBarProps> = ({ style }) => {
  const { isDark } = useTheme();

  // Determine status bar style based on theme
  const statusBarStyle: StatusBarStyle = style || (isDark ? "light" : "dark");

  return <StatusBar style={statusBarStyle} />;
};
