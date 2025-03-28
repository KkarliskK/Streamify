import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LibraryProvider } from '@/src/utils/LibraryContext';
import { MiniPlayer } from '@/components/mini-player';
import MusicPlayerService from '@/src/utils/soundcloudMusicPlayerService';
import { usePathname } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const pathname = usePathname();


  React.useEffect(() => {
    const subscription = MusicPlayerService.onCurrentTrackUpdate((track) => {
      setCurrentSong(track);
    });
    const playbackSubscription = MusicPlayerService.onPlaybackStatusUpdate((status) => {
      setIsPlaying(status.isPlaying);
    });
    return () => {
      subscription.remove();
      playbackSubscription.remove();
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      MusicPlayerService.pauseSound();
    } else {
      MusicPlayerService.resumeSound();
    }
  };

  return (
    <LibraryProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
                paddingBottom: currentSong ? 60 : 0, // Add padding when MiniPlayer is present
              },
              default: {
                paddingBottom: currentSong ? 60 : 0,
              },
            }),
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
            }}
          />
          <Tabs.Screen
            name="library"
            options={{
              title: 'Library',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.stack.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
            }}
          />
          <Tabs.Screen
            name="album-detail"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="song-detail"
            options={{
              href: null,
              headerShown: false,
            }}
          />
        </Tabs>
        
        {currentSong && pathname !== '/song-detail' && (
          <View style={{
            position: 'absolute',
            bottom: 100,
            left: 10,
            right: 10,
            zIndex: 1000,
          }}>
            <MiniPlayer 
              currentSong={currentSong}
              onPlayPause={handlePlayPause}
              isPlaying={isPlaying}
            />
          </View>
        )}
      </View>
    </LibraryProvider>
  );
}