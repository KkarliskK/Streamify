import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import SoundCloudMusicService from '@/src/utils/soundcloudMusicService';
import MusicPlayerService from '@/src/utils/soundcloudMusicPlayerService';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const performSearch = async () => {
    if (searchQuery.trim() === '') return;
    
    setIsLoading(true);
    try {
      const results = await SoundCloudMusicService.searchSongs(searchQuery);
      
      if (results.length === 0) {
        Alert.alert('No Results', 'No tracks found for your search.');
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Unable to perform search. Check your connection or try a different query.', [
        { 
          text: 'OK', 
          style: 'cancel' 
        },
        { 
          text: 'More Info', 
          onPress: () => Alert.alert('Error Details', error.message) 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayPause = async (item) => {
    try {
      if (currentlyPlaying?.id === item.id) {
        await MusicPlayerService.pauseSound();
        setCurrentlyPlaying(null);
      } else {
        if (!item.fullTrackUrl) {
          Alert.alert('Playback Error', 'No stream URL available for this track. Try another track.');
          return;
        }
        await MusicPlayerService.playStream(item.fullTrackUrl, item);
        setCurrentlyPlaying(item);
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert(
        'Playback Error', 
        'Could not play the track. This might be due to streaming restrictions or network issues.',
        [
          { 
            text: 'OK', 
            style: 'cancel' 
          },
          { 
            text: 'View Details', 
            onPress: () => Alert.alert('Error Details', error.message) 
          }
        ]
      );
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => handlePlayPause(item)}
    >
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.resultThumbnail} 
      />
      <View style={styles.resultTextContainer}>
        <ThemedText style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.resultArtist} numberOfLines={1}>
          {item.artist}
        </ThemedText>
      </View>
      <Ionicons 
        name={currentlyPlaying?.id === item.id ? "pause" : "play"} 
        size={24} 
        color="white" 
      />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1D2B3A', '#0F1624']}
      style={styles.container}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for songs, artists"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={performSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={performSearch}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator 
          size="large" 
          color="white" 
          style={styles.loadingIndicator} 
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          ListEmptyComponent={
            searchResults.length === 0 && !isLoading ? (
              <ThemedText style={styles.noResultsText}>
                No results found. Try a different search.
              </ThemedText>
            ) : null
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  resultsList: {
    paddingHorizontal: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultArtist: {
    color: 'rgba(255,255,255,0.7)',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
});