import React from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function LibraryScreen() {
  const playlists = [
    { 
      id: 1, 
      title: 'Favorite Songs', 
      trackCount: 45,
      cover: require('@/assets/images/react-logo.png')
    },
    { 
      id: 2, 
      title: 'Workout Mix', 
      trackCount: 32,
      cover: require('@/assets/images/react-logo.png')
    },
    { 
      id: 3, 
      title: 'Chill Vibes', 
      trackCount: 28,
      cover: require('@/assets/images/react-logo.png')
    }
  ];

  return (
    <LinearGradient
      colors={['#1D2B3A', '#0F1624']}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Library</ThemedText>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Playlists</ThemedText>
          {playlists.map((playlist) => (
            <TouchableOpacity key={playlist.id} style={styles.playlistItem}>
              <Image source={playlist.cover} style={styles.playlistCover} />
              <View style={styles.playlistInfo}>
                <ThemedText style={styles.playlistTitle}>
                  {playlist.title}
                </ThemedText>
                <ThemedText style={styles.playlistTracks}>
                  {playlist.trackCount} Tracks
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  playlistCover: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistTracks: {
    color: 'rgba(255,255,255,0.7)',
  },
});