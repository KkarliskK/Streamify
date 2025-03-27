import React from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const recentTracks = [
    { 
      id: 1, 
      title: 'Blinding Lights', 
      artist: 'The Weeknd', 
      cover: require('@/assets/images/react-logo.png')
    },
    { 
      id: 2, 
      title: 'Shape of You', 
      artist: 'Ed Sheeran', 
      cover: require('@/assets/images/react-logo.png')
    },
    { 
      id: 3, 
      title: 'Memories',  
      artist: 'Maroon 5', 
      cover: require('@/assets/images/react-logo.png')
    }
  ];

  const quickPicks = [
    { 
      id: 1, 
      title: 'Chill Hits', 
      cover: require('@/assets/images/react-logo.png')
    },
    { 
      id: 2, 
      title: 'Top 50', 
      cover: require('@/assets/images/react-logo.png')
    },
    { 
      id: 3, 
      title: 'Workout Mix', 
      cover: require('@/assets/images/react-logo.png')
    }
  ];

  return (
    <LinearGradient
      colors={['#1D2B3A', '#0F1624']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.appTitle}>Streamify</ThemedText>
          <View style={styles.headerIcons}>
            <Ionicons name="notifications-outline" size={24} color="white" style={styles.headerIcon} />
            <Ionicons name="settings-outline" size={24} color="white" />
          </View>
        </View>

        {/* Featured Track */}
        <View style={styles.featuredTrack}>
          <Image 
            source={require('@/assets/images/react-logo.png')}
            style={styles.featuredImage}
          />
          <View style={styles.featuredOverlay}>
            <ThemedText style={styles.featuredTitle}>Now Playing</ThemedText>
            <ThemedText style={styles.featuredSubtitle}>Starboy - The Weeknd</ThemedText>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color="black" />
              <ThemedText style={styles.playButtonText}>Play</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Tracks */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Recent Tracks</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {recentTracks.map((track) => (
              <TouchableOpacity key={track.id} style={styles.trackItem}>
                <Image source={track.cover} style={styles.trackCover} />
                <ThemedText style={styles.trackTitle}>{track.title}</ThemedText>
                <ThemedText style={styles.trackArtist}>{track.artist}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Picks */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Quick Picks</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {quickPicks.map((playlist) => (
              <TouchableOpacity key={playlist.id} style={styles.playlistItem}>
                <Image source={playlist.cover} style={styles.playlistCover} />
                <ThemedText style={styles.playlistTitle}>{playlist.title}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D2B3A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  appTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 15,
  },
  featuredTrack: {
    position: 'relative',
    height: 400,
    marginBottom: 20,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  featuredTitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.7,
  },
  featuredSubtitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  trackItem: {
    marginRight: 15,
    width: 150,
  },
  trackCover: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  trackTitle: {
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.7)',
  },
  playlistItem: {
    marginRight: 15,
    width: 180,
  },
  playlistCover: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  playlistTitle: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});