# Design Document - Social & Community

## Overview

The Social & Community features transform UrbanForage from a simple food sharing app into a vibrant community platform. This phase focuses on creating meaningful connections between users through beautiful profiles, real-time communication, and engaging gamification that motivates continued participation in sustainable food sharing.

## Architecture

### Component Hierarchy
```
CommunityScreen
├── UserProfile
│   ├── ProfileHeader
│   ├── StatsDisplay
│   ├── AchievementBadges
│   └── ActivityFeed
├── MessagingSystem
│   ├── ConversationList
│   ├── ChatInterface
│   ├── MessageBubbles
│   └── MediaSharing
├── GamificationHub
│   ├── AchievementGrid
│   ├── ProgressRings
│   ├── Leaderboards
│   └── ChallengeCards
└── CommunityFeed
    ├── ActivityCards
    ├── SocialActions
    └── ContentFilters
```

### Data Flow Architecture
```
User Actions → State Updates → Real-time Sync → UI Updates → Notifications
     ↓              ↓              ↓              ↓              ↓
Social Interactions → Zustand → Firebase → React Query → Push Notifications
```

## Components and Interfaces

### Profile Components

#### UserProfile
```tsx
interface UserProfileProps {
  userId: string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

interface UserProfileData {
  id: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location: {
    city: string;
    state: string;
  };
  stats: {
    itemsShared: number;
    itemsReceived: number;
    communityRating: number;
    joinedDate: Date;
  };
  achievements: Achievement[];
  interests: string[];
  verification: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  socialConnections: {
    following: number;
    followers: number;
    mutualConnections: number;
  };
}
```

#### ProfileHeader
```tsx
interface ProfileHeaderProps {
  user: UserProfileData;
  isOwnProfile: boolean;
  onEditPress?: () => void;
  onFollowPress?: () => void;
  onMessagePress?: () => void;
  isFollowing?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  onEditPress,
  onFollowPress,
  onMessagePress,
  isFollowing = false
}) => {
  // Beautiful gradient background with user avatar
  // Animated follow/unfollow button
  // Verification badges with tooltips
  // Social connection counts with navigation
};
```

#### AchievementBadges
```tsx
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: {
    current: number;
    total: number;
  };
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  onAchievementPress: (achievement: Achievement) => void;
  showProgress?: boolean;
}
```

### Messaging Components

#### ConversationList
```tsx
interface Conversation {
  id: string;
  participants: User[];
  lastMessage: {
    text: string;
    timestamp: Date;
    senderId: string;
    type: 'text' | 'image' | 'system';
  };
  unreadCount: number;
  listingContext?: {
    id: string;
    title: string;
    image: string;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  onConversationPress: (conversation: Conversation) => void;
  onNewConversation: () => void;
  loading?: boolean;
}
```

#### ChatInterface
```tsx
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system' | 'quick_action';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image';
    url: string;
    thumbnail?: string;
  }[];
}

interface ChatInterfaceProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (text: string, attachments?: File[]) => void;
  onImagePicker: () => void;
  typing?: boolean;
  participant: User;
}
```

#### MessageBubble
```tsx
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onImagePress?: (imageUrl: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = false,
  onImagePress
}) => {
  // Animated message appearance
  // Different styling for own vs received messages
  // Status indicators with animations
  // Image attachments with zoom capability
};
```

### Gamification Components

#### AchievementGrid
```tsx
interface AchievementGridProps {
  achievements: Achievement[];
  onAchievementPress: (achievement: Achievement) => void;
  filter?: 'all' | 'unlocked' | 'locked' | 'recent';
}

const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  onAchievementPress,
  filter = 'all'
}) => {
  // Grid layout with staggered animations
  // Rarity-based styling and effects
  // Progress indicators for locked achievements
  // Celebration animations for newly unlocked
};
```

#### ProgressRing
```tsx
interface ProgressRingProps {
  progress: number;
  total: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
  animated?: boolean;
  showLabel?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  total,
  size,
  strokeWidth,
  color,
  backgroundColor = '#e5e7eb',
  animated = true,
  showLabel = true
}) => {
  // Animated circular progress with smooth transitions
  // Customizable colors and sizing
  // Optional center label with count
  // Celebration effect when completed
};
```

#### Leaderboard
```tsx
interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar?: string;
  score: number;
  rank: number;
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  timeframe: 'weekly' | 'monthly' | 'all-time';
  onTimeframeChange: (timeframe: string) => void;
  onUserPress: (userId: string) => void;
}
```

### Community Feed Components

#### ActivityCard
```tsx
interface ActivityItem {
  id: string;
  type: 'listing_created' | 'exchange_completed' | 'achievement_unlocked' | 'milestone_reached';
  user: User;
  timestamp: Date;
  content: {
    title: string;
    description?: string;
    image?: string;
    metadata?: Record<string, any>;
  };
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    userLiked?: boolean;
  };
}

interface ActivityCardProps {
  activity: ActivityItem;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onUserPress: () => void;
}
```

## Data Models

### User Social Profile
```tsx
interface UserSocialProfile extends UserProfileData {
  socialSettings: {
    profileVisibility: 'public' | 'friends' | 'private';
    showActivity: boolean;
    showAchievements: boolean;
    allowMessages: 'everyone' | 'friends' | 'none';
    showLocation: boolean;
  };
  relationships: {
    following: string[];
    followers: string[];
    blocked: string[];
    mutedConversations: string[];
  };
  activityFeed: {
    showInFeed: boolean;
    shareAchievements: boolean;
    shareExchanges: boolean;
  };
}
```

### Gamification System
```tsx
interface GamificationState {
  user: {
    level: number;
    experience: number;
    experienceToNext: number;
    totalPoints: number;
  };
  achievements: {
    unlocked: Achievement[];
    inProgress: Achievement[];
    available: Achievement[];
  };
  streaks: {
    current: number;
    longest: number;
    type: 'daily_activity' | 'weekly_sharing' | 'monthly_impact';
  };
  challenges: {
    active: Challenge[];
    completed: Challenge[];
    available: Challenge[];
  };
  leaderboards: {
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
    userRank: {
      weekly: number;
      monthly: number;
      allTime: number;
    };
  };
}
```

### Messaging System
```tsx
interface MessagingState {
  conversations: Conversation[];
  activeConversation?: string;
  messages: Record<string, Message[]>;
  typing: Record<string, boolean>;
  unreadCounts: Record<string, number>;
  settings: {
    notifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    previewInNotifications: boolean;
  };
}
```

## Error Handling

### Social Features Error Handling
- **Profile Loading Failures**: Show skeleton with retry option
- **Follow/Unfollow Errors**: Optimistic updates with rollback on failure
- **Image Upload Failures**: Progress indicators with retry mechanism
- **Privacy Setting Conflicts**: Clear explanations and guided resolution

### Messaging Error Handling
- **Message Delivery Failures**: Retry mechanism with exponential backoff
- **Connection Issues**: Offline indicators with message queuing
- **Media Upload Failures**: Progress tracking with error recovery
- **Blocked User Scenarios**: Graceful handling with appropriate messaging

### Gamification Error Handling
- **Achievement Unlock Failures**: Retry with celebration animation delay
- **Leaderboard Loading Issues**: Cached data with refresh indicators
- **Progress Sync Failures**: Local storage with background sync
- **Challenge Completion Errors**: Validation with manual verification option

## Performance Optimizations

### Real-time Updates
```tsx
// Efficient message listening
const useConversationMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    if (!conversationId) return;
    
    const messagesRef = collection(
      db, 
      'conversations', 
      conversationId, 
      'messages'
    );
    
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'), 
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(newMessages.reverse());
    });
    
    return unsubscribe;
  }, [conversationId]);
  
  return messages;
};
```

### Image Optimization
```tsx
// Progressive avatar loading
const useProgressiveAvatar = (userId: string, size: 'small' | 'medium' | 'large') => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const avatarUrl = await getOptimizedAvatar(userId, size);
        setAvatar(avatarUrl);
      } catch (error) {
        setAvatar(getDefaultAvatar(userId));
      } finally {
        setLoading(false);
      }
    };
    
    loadAvatar();
  }, [userId, size]);
  
  return { avatar, loading };
};
```

### List Performance
```tsx
// Virtualized conversation list
const ConversationList = ({ conversations }: { conversations: Conversation[] }) => {
  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        onPress={() => navigateToChat(item.id)}
      />
    ),
    []
  );
  
  return (
    <FlatList
      data={conversations}
      renderItem={renderConversation}
      keyExtractor={(item) => item.id}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
    />
  );
};
```

## Animation Specifications

### Profile Animations
- **Profile Load**: Staggered content appearance with fade-in
- **Follow Button**: Scale animation with color transition
- **Achievement Unlock**: Celebration with particle effects and sound
- **Stats Update**: Counting animation with spring physics

### Messaging Animations
- **Message Send**: Slide-up with fade-in, status indicator updates
- **Typing Indicator**: Pulsing dots with smooth transitions
- **Image Attachment**: Scale animation with progress indicator
- **Conversation Open**: Shared element transition from list to chat

### Gamification Animations
- **Progress Ring**: Smooth arc animation with easing
- **Level Up**: Full-screen celebration with confetti
- **Badge Unlock**: Scale bounce with glow effect
- **Leaderboard Update**: Smooth position changes with highlights

## Security and Privacy

### Message Security
```tsx
// End-to-end encryption for sensitive messages
const encryptMessage = async (message: string, recipientPublicKey: string) => {
  const encrypted = await crypto.encrypt(message, recipientPublicKey);
  return encrypted;
};

// Message reporting and moderation
const reportMessage = async (messageId: string, reason: string) => {
  await addDoc(collection(db, 'reports'), {
    messageId,
    reason,
    reportedBy: auth.currentUser?.uid,
    timestamp: new Date(),
    status: 'pending'
  });
};
```

### Privacy Controls
```tsx
interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showActivity: boolean;
  showAchievements: boolean;
  allowMessages: 'everyone' | 'friends' | 'none';
  showLocation: boolean;
  dataSharing: {
    analytics: boolean;
    improvements: boolean;
    marketing: boolean;
  };
}
```

## Accessibility Features

### Screen Reader Support
```tsx
// Proper accessibility for social interactions
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`Follow ${user.displayName}`}
  accessibilityHint="Double tap to follow this user"
  onPress={handleFollow}
>
  <Text>Follow</Text>
</TouchableOpacity>
```

### Keyboard Navigation
- Tab order optimization for social features
- Keyboard shortcuts for common messaging actions
- Focus management in modal dialogs
- Voice control integration for messaging

### Visual Accessibility
- High contrast mode for all social elements
- Text scaling support for messages and profiles
- Color-blind friendly achievement badges
- Motion reduction preferences for animations