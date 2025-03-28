import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary } from '@/src/utils/LibraryContext';
import MusicPlayerService from '@/src/utils/soundcloudMusicPlayerService';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AlbumDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { album } = route.params;

  const { 
    removeSongFromAlbum, 
    likeSong,
    likedSongs 
  } = useLibrary();

  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const isLiked = (song) => likedSongs.some(s => s.id === song.id);

  const handlePlayPause = async (item) => {
    try {
      if (currentlyPlaying?.id === item.id) {
        await MusicPlayerService.pauseSound();
        setCurrentlyPlaying(null);
      } else {
        if (!item.fullTrackUrl) {
          Alert.alert('Playback Error', 'No stream URL available for this track.');
          return;
        }
        await MusicPlayerService.playStream(item.fullTrackUrl, item);
        setCurrentlyPlaying(item);
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Playback Error', 'Could not play the track.');
    }
  };

  const handleRemoveSong = (songId) => {
    Alert.alert(
      'Remove Song',
      'Are you sure you want to remove this song from the album?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // Update the local state instantly
            const updatedSongs = album.songs.filter((song) => song.id !== songId);
            album.songs = updatedSongs; // Update the album object directly

            // Call the context function to persist the change
            removeSongFromAlbum(album.id, songId);
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#1D2B3A', '#0F1624']}
      style={styles.container}
    >
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('library')}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.albumHeader}>
          <Image 
            source={
              album.songs.length > 0 
                ? { uri: album.songs[0].thumbnail } 
                : require('@/assets/images/react-logo.png')
            } 
            style={styles.albumCover} 
          />
          <ThemedText style={styles.albumTitle}>{album.name}</ThemedText>
          <ThemedText style={styles.albumSubtitle}>
            {album.songs.length} Tracks
          </ThemedText>
        </View>

        {album.songs.map((song) => (
          <TouchableOpacity 
            key={song.id} 
            style={styles.songItem}
            onPress={() => handlePlayPause(song)}
          >
            <Image 
              source={{ uri: song.thumbnail }} 
              style={styles.songThumbnail} 
              blurRadius={currentlyPlaying?.id === song.id ? 5 : 0}
            />
            <View style={styles.songTextContainer}>
              <ThemedText 
                style={[
                  styles.songTitle, 
                  currentlyPlaying?.id === song.id && styles.playingTitle
                ]}
                numberOfLines={1}
              >
                {song.title}
              </ThemedText>
              <ThemedText style={styles.songArtist} numberOfLines={1}>
                {song.artist}
              </ThemedText>
            </View>
            <View style={styles.songActions}>
              <TouchableOpacity 
                onPress={() => likeSong(song)}
                style={styles.actionButton}
              >
                <Ionicons 
                  name={isLiked(song) ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked(song) ? "red" : "white"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleRemoveSong(song.id)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
              <Ionicons 
                name={currentlyPlaying?.id === song.id ? "pause" : "play"} 
                size={24} 
                color="white" 
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  scrollContainer: {
    paddingTop: 100,
    paddingBottom: 50,
  },
  albumHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  albumCover: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 20,
  },
  albumTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  albumSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 10,
  },
  songThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  songTextContainer: {
    flex: 1,
  },
  songTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playingTitle: {
    color: '#4CAF50',
  },
  songArtist: {
    color: 'rgba(255,255,255,0.7)',
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginHorizontal: 5,
  },
});