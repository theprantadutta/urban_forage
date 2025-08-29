import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      {/* Button Component Test */}
      <View className="bg-cream-white dark:bg-gray-900 p-4 rounded-2xl shadow-lg mb-4">
        <Text className="text-forest-green text-xl font-bold mb-4 text-center">
          🌱 Button Component Library
        </Text>

        {/* Button Variants */}
        <View className="space-y-3 mb-4">
          <Button title="Primary Button" variant="primary" onPress={() => console.log('Primary pressed')} />
          <Button title="Secondary Button" variant="secondary" onPress={() => console.log('Secondary pressed')} />
          <Button title="Outline Button" variant="outline" onPress={() => console.log('Outline pressed')} />
          <Button title="Ghost Button" variant="ghost" onPress={() => console.log('Ghost pressed')} />
        </View>

        {/* Button Sizes */}
        <View className="space-y-3 mb-4">
          <Button title="Small Button" size="small" onPress={() => console.log('Small pressed')} />
          <Button title="Medium Button" size="medium" onPress={() => console.log('Medium pressed')} />
          <Button title="Large Button" size="large" onPress={() => console.log('Large pressed')} />
        </View>

        {/* Button States */}
        <View className="space-y-3">
          <Button title="Loading Button" loading onPress={() => console.log('Loading pressed')} />
          <Button title="Disabled Button" disabled onPress={() => console.log('Disabled pressed')} />
        </View>
      </View>

      {/* Card Component Test */}
      <View className="space-y-4 mb-4">
        <Text className="text-forest-green text-xl font-bold text-center">
          🃏 Card Component Library
        </Text>

        {/* Default Card */}
        <Card variant="default" padding="medium">
          <Text className="text-forest-green text-lg font-semibold mb-2">
            Default Card
          </Text>
          <Text className="text-sage-green">
            This is a default card with medium padding and standard shadow.
          </Text>
        </Card>

        {/* Glassmorphism Card */}
        <Card variant="glassmorphism" padding="large">
          <Text className="text-forest-green text-lg font-semibold mb-2">
            Glassmorphism Card
          </Text>
          <Text className="text-sage-green">
            This card features a beautiful glassmorphism effect with blur and transparency.
          </Text>
        </Card>

        {/* Elevated Interactive Card */}
        <Card 
          variant="elevated" 
          padding="medium" 
          interactive
          onPress={() => console.log('Card pressed!')}
        >
          <Text className="text-forest-green text-lg font-semibold mb-2">
            Interactive Elevated Card
          </Text>
          <Text className="text-sage-green">
            This card is interactive with press animations and elevated shadow. Tap me!
          </Text>
        </Card>

        {/* Small Padding Card */}
        <Card variant="default" padding="small">
          <Text className="text-forest-green font-semibold">
            Small Padding Card
          </Text>
        </Card>
      </View>

      {/* Input Component Test */}
      <View className="space-y-4 mb-4">
        <Text className="text-forest-green text-xl font-bold text-center">
          📝 Input Component Library
        </Text>

        <Card variant="default" padding="large">
          <View className="space-y-4">
            {/* Basic Text Input */}
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              leftIcon="person"
              success={name.length > 2}
            />

            {/* Email Input with Validation */}
            <Input
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChangeText={validateEmail}
              leftIcon="mail"
              error={emailError}
              success={email.length > 0 && !emailError}
            />

            {/* Password Input */}
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock-closed"
              success={password.length >= 8}
            />

            {/* Phone Input */}
            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              type="phone"
              value={phone}
              onChangeText={setPhone}
              leftIcon="call"
              rightIcon="checkmark-circle"
              success={phone.length > 0}
            />

            {/* Input with Error */}
            <Input
              label="Required Field"
              placeholder="This field has an error"
              error="This field is required"
              leftIcon="alert-circle"
            />
          </View>
        </Card>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
