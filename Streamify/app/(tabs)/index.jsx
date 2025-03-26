import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { searchMusicVideos, getVideoDetails } from '@/src/utils/youtubeApi';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [quickPicks, setQuickPicks] = useState([]);
  const [featuredTrack, setFeaturedTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch music content
  const fetchMusicContent = async () => {
    try {
      setLoading(true);
      
      // Fetch recent tracks (top current hits)
      const recentTracksResults = await searchMusicVideos('Top Hits 2024', 10);
      const detailedRecentTracks = await Promise.all(
        recentTracksResults.map(async (video) => {
          const details = await getVideoDetails(video.videoId);
          return {
            id: video.videoId,
            title: video.title,
            artist: video.channelTitle,
            cover: video.thumbnail,
            ...details
          };
        })
      );
      setRecentTracks(detailedRecentTracks.slice(0, 5));

      // Fetch quick pick playlists (different genres)
      const playlistQueries = [
        'Chill Lofi Playlist',
        'Workout Music Mix',
        'Acoustic Covers'
      ];

      const quickPickResults = await Promise.all(
        playlistQueries.map(async (query) => {
          const videos = await searchMusicVideos(query, 5);
          return {
            id: query.replace(/\s+/g, '-').toLowerCase(),
            title: query,
            cover: videos[0]?.thumbnail || require('@/assets/images/react-logo.png')
          };
        })
      );
      setQuickPicks(quickPickResults);

      // Set a featured track (first result from recent tracks)
      if (detailedRecentTracks.length > 0) {
        setFeaturedTrack(detailedRecentTracks[0]);
      }

    } catch (error) {
      Alert.alert('Content Fetch Error', 'Could not load music content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch content when component mounts
  useEffect(() => {
    fetchMusicContent();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <LinearGradient
        colors={['#1D2B3A', '#0F1624']}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />
      </LinearGradient>
    );
  }

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
        {featuredTrack && (
          <View style={styles.featuredTrack}>
            <Image 
              source={{ uri: featuredTrack.cover }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredOverlay}>
              <ThemedText style={styles.featuredTitle}>Now Playing</ThemedText>
              <ThemedText style={styles.featuredSubtitle}>
                {featuredTrack.title}
              </ThemedText>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={24} color="black" />
                <ThemedText style={styles.playButtonText}>Play</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
                <Image 
                  source={{ uri: track.cover }} 
                  style={styles.trackCover} 
                />
                <ThemedText style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </ThemedText>
                <ThemedText style={styles.trackArtist} numberOfLines={1}>
                  {track.artist}
                </ThemedText>
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
                <Image 
                  source={typeof playlist.cover === 'string' 
                    ? { uri: playlist.cover } 
                    : playlist.cover
                  } 
                  style={styles.playlistCover} 
                />
                <ThemedText style={styles.playlistTitle}>
                  {playlist.title}
                </ThemedText>
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