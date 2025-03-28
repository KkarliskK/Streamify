import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import SoundCloudMusicService from '@/src/utils/soundcloudMusicService';
import MusicPlayerService from '@/src/utils/soundcloudMusicPlayerService';
import { useLibrary } from '@/src/utils/LibraryContext';

const { width } = Dimensions.get('window');

const MusicPlayerScreen = () => {
  const { 
    songId, 
    songTitle, 
    songArtist, 
    songThumbnail, 
    fullTrackUrl 
  } = useLocalSearchParams();

  const { 
    likedSongs, 
    likeSong, 
  } = useLibrary();

  const isLiked = (song) => likedSongs.some((s) => s.id === song?.id);

  const navigation = useNavigation();

  const initialTrack = {
    id: songId || 'unknown', // Fallback to 'unknown' if songId is undefined
    title: songTitle || 'Unknown Title', // Fallback to 'Unknown Title'
    artist: songArtist || 'Unknown Artist', // Fallback to 'Unknown Artist'
    thumbnail: songThumbnail || '', // Fallback to an empty string
    fullTrackUrl: fullTrackUrl || '', // Fallback to an empty string
    duration: 0,
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(initialTrack);
  const [playlist, setPlaylist] = useState([]);
  const [playbackStatus, setPlaybackStatus] = useState({
    positionMillis: 0,
    durationMillis: initialTrack.duration || 0
  });
  const [playbackMode, setPlaybackMode] = useState('default');

  useEffect(() => {
    let trackListener, statusListener;

    const setupPlayback = async () => {
      try {
        const relatedTracks = await SoundCloudMusicService.searchTracks(
          initialTrack.artist, 
          10
        );
        
        const fullPlaylist = [initialTrack, ...relatedTracks];
        setPlaylist(fullPlaylist);

        await MusicPlayerService.playStream(
          initialTrack.fullTrackUrl, 
          initialTrack, 
          fullPlaylist
        );

        trackListener = MusicPlayerService.onCurrentTrackUpdate((updatedTrack) => {
          setCurrentTrack(updatedTrack);
        });

        statusListener = MusicPlayerService.onPlaybackStatusUpdate((status) => {
          setIsPlaying(status.isPlaying);
          setPlaybackStatus({
            positionMillis: status.positionMillis || 0,
            durationMillis: status.durationMillis || initialTrack.duration
          });
        });
      } catch (error) {
        console.error('Playback setup error:', error);
      }
    };

    setupPlayback();

    return () => {
      if (trackListener) trackListener.remove();
      if (statusListener) statusListener.remove();
    };
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      MusicPlayerService.pauseSound();
    } else {
      MusicPlayerService.resumeSound();
    }
  };

  const handleNextTrack = () => {
    MusicPlayerService.playNextTrack();
  };

  const handlePreviousTrack = () => {
    if (playlist.length > 0) {
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
      const previousTrack = playlist[previousIndex];
      
      MusicPlayerService.playStream(
        previousTrack.fullTrackUrl, 
        previousTrack, 
        playlist
      );
    }
  };

  const cyclePlaybackMode = () => {
    const modes = ['default', 'repeat', 'repeatOne', 'shuffle'];
    const currentIndex = modes.indexOf(playbackMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    MusicPlayerService.setPlaybackMode(nextMode);
    setPlaybackMode(nextMode);
  };

  const getPlaybackModeIcon = () => {
    switch(playbackMode) {
      case 'repeat': return 'repeat';
      case 'repeatOne': return 'repeat-one';
      case 'shuffle': return 'shuffle';
      default: return 'repeat';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.artworkContainer}>
        <Image 
          source={{ uri: currentTrack?.thumbnail }} 
          style={styles.artwork} 
        />
      </View>

      <View style={styles.trackInfoContainer}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {currentTrack?.title}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {currentTrack?.artist}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>
          {formatTime(playbackStatus.positionMillis)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={playbackStatus.durationMillis}
          value={playbackStatus.positionMillis}
          minimumTrackTintColor="#1ED760"
          maximumTrackTintColor="#535353"
          thumbTintColor="#1ED760"
        />
        <Text style={styles.timeText}>
          {formatTime(playbackStatus.durationMillis)}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={cyclePlaybackMode}
        >
          <Ionicons 
            name={getPlaybackModeIcon()} 
            size={24} 
            color={playbackMode !== 'default' ? "#1ED760" : "white"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handlePreviousTrack}
        >
          <Ionicons name="play-skip-back" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playPauseButton}
          onPress={handlePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={48} 
            color="black" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleNextTrack}
        >
          <Ionicons name="play-skip-forward" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => likeSong(currentTrack)}
          style={styles.actionButton}
        >
          <Ionicons 
            name={isLiked(currentTrack) ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked(currentTrack) ? "red" : "white"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
  },
  artworkContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 30,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  trackInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trackTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  artistName: {
    color: '#b3b3b3',
    fontSize: 18,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  controlButton: {
    padding: 10,
  },
  playPauseButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 15,
  },
});

export default MusicPlayerScreen;