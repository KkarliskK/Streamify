import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export const MiniPlayer = ({ currentSong, onPlayPause, isPlaying }) => {
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: -15,
      left: 0,
      right: 0,
      backgroundColor: '#1D2B3A',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
      marginHorizontal: -10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
          elevation: 4,
    },
    artwork: {
      width: 50,
      height: 50,
      borderRadius: 8,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    songTitle: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    artistName: {
      color: 'gray',
      fontSize: 14,
    },
    playPauseButton: {
      padding: 5,
    },
  });

  if (!currentSong) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push({
        pathname: '/song-detail',
        params: { 
          songId: currentSong.id,
          songTitle: currentSong.title,
          songArtist: currentSong.artist,
          songThumbnail: currentSong.thumbnail,
          fullTrackUrl: currentSong.fullTrackUrl
        }
      })}
    >
      <Image 
        source={{ uri: currentSong.thumbnail }} 
        style={styles.artwork}
      />
      <View style={styles.textContainer}>
        <Text 
          style={styles.songTitle} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {currentSong.title}
        </Text>
        <Text 
          style={styles.artistName} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {currentSong.artist}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.playPauseButton}
        onPress={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};