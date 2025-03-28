import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import SoundCloudMusicService from '@/src/utils/soundcloudMusicService';
import MusicPlayerService from '@/src/utils/soundcloudMusicPlayerService';
import { useLibrary } from '@/src/utils/LibraryContext';

const QUICK_SEARCH_CATEGORIES = [
  { 
    id: 'pop', 
    name: 'Pop', 
    image: 'https://images.unsplash.com/photo-1512830414785-9928e23475dc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 'hip-hop', 
    name: 'Hip Hop', 
    image: 'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 'electronic', 
    name: 'Electronic', 
    image: 'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 'indie', 
    name: 'Indie', 
    image: 'https://plus.unsplash.com/premium_photo-1661377339902-4aae67410d8b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 'rock', 
    name: 'Rock', 
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 'mood', 
    name: 'Mood', 
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' 
  },
  { 
    id: 'rap', 
    name: 'Rap', 
    image: 'https://images.unsplash.com/photo-1541788968749-7683d395688d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
];

const { width } = Dimensions.get('window');

const SEARCH_TYPES = [
  { id: 'tracks', name: 'Tracks', icon: 'musical-notes' },
  { id: 'artists', name: 'Artists', icon: 'people' },
  { id: 'playlists', name: 'Playlists', icon: 'list' }
];

const SEARCH_HISTORY_KEY = 'MUSIC_SEARCH_HISTORY';
const MAX_SEARCH_HISTORY = 10;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchInputPosition, setSearchInputPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [searchType, setSearchType] = useState('tracks');

  const { 
    likedSongs, 
    likeSong, 
    albums,
    addSongToAlbum 
  } = useLibrary();

  const [selectedSongForAlbum, setSelectedSongForAlbum] = useState(null);

  const isLiked = (song) => likedSongs.some(s => s.id === song.id);

  // Effect to trigger search when search type changes
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery);
    }
  }, [searchType]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchToHistory = async (query) => {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      let updatedHistory = [
        trimmedQuery,
        ...searchHistory.filter(item => item !== trimmedQuery)
      ];

      updatedHistory = updatedHistory.slice(0, MAX_SEARCH_HISTORY);

      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const removeHistoryItem = async (itemToRemove) => {
    try {
      const updatedHistory = searchHistory.filter(item => item !== itemToRemove);
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const performSearch = async (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setArtistResults([]);
      setPlaylistResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // Perform comprehensive search
      const results = await SoundCloudMusicService.searchAll(query);
      
      switch(searchType) {
        case 'tracks':
          setSearchResults(results.tracks);
          setArtistResults(results.artists);
          setPlaylistResults(results.playlists);
          break;
        case 'artists':
          setSearchResults([]);
          setArtistResults(results.artists);
          setPlaylistResults([]);
          break;
        case 'playlists':
          setSearchResults([]);
          setArtistResults([]);
          setPlaylistResults(results.playlists);
          break;
        default:
          setSearchResults(results.tracks);
          setArtistResults(results.artists);
          setPlaylistResults(results.playlists);
      }
      
      await saveSearchToHistory(query);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Unable to perform search. Check your connection or try a different query.');
    } finally {
      setIsLoading(false);
      setIsSearchFocused(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };
  
  const handleCategorySearch = (category) => {
    setSearchQuery(category);
    performSearch(category);
  };

  const handleHistoryItemPress = (historyItem) => {
    setSearchQuery(historyItem);
    performSearch(historyItem);
  };

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

  // Album Selection Modal
  const renderAlbumSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={selectedSongForAlbum !== null}
      onRequestClose={() => setSelectedSongForAlbum(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ThemedText style={styles.modalTitle}>Add to Album</ThemedText>
          <ScrollView>
            {albums.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumSelectionItem}
                onPress={() => {
                  addSongToAlbum(album.id, selectedSongForAlbum);
                  setSelectedSongForAlbum(null);
                }}
              >
                <ThemedText style={styles.albumSelectionText}>
                  {album.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setSelectedSongForAlbum(null)}
          >
            <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Category Item Rendering
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => handleCategorySearch(item.name)}
    >
      <ImageBackground 
        source={{ uri: item.image }}
        style={styles.categoryImage}
        imageStyle={styles.categoryImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.categoryTextOverlay}
        >
          <ThemedText style={styles.categoryText}>
            {item.name}
          </ThemedText>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Track Result Rendering
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => handlePlayPause(item)}
    >
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.resultThumbnail} 
        blurRadius={currentlyPlaying?.id === item.id ? 5 : 0}
      />
      <View style={styles.resultTextContainer}>
        <ThemedText style={[styles.resultTitle, currentlyPlaying?.id === item.id && styles.playingTitle]} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.resultArtist} numberOfLines={1}>
          {item.artist}
        </ThemedText>
      </View>
      <View style={styles.resultActionContainer}>
        <TouchableOpacity 
          onPress={() => likeSong(item)}
          style={styles.actionButton}
        >
          <Ionicons 
            name={isLiked(item) ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked(item) ? "red" : "white"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSelectedSongForAlbum(item)}
          style={styles.actionButton}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        <Ionicons 
          name={currentlyPlaying?.id === item.id ? "pause" : "play"} 
          size={24} 
          color="white" 
        />
      </View>
    </TouchableOpacity>
  );

  // Artist Result Rendering
  const renderArtistResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => {
        // Optional: Navigate to artist details page
        // navigation.navigate('ArtistDetails', { artistId: item.id });
      }}
    >
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.resultThumbnail} 
      />
      <View style={styles.resultTextContainer}>
        <ThemedText style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.resultArtist} numberOfLines={1}>
          {item.followers.toLocaleString()} Followers
          {item.city && item.country ? ` • ${item.city}, ${item.country}` : ''}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  // Playlist Result Rendering
  const renderPlaylistResult = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.resultThumbnail} 
      />
      <View style={styles.resultTextContainer}>
        <ThemedText style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.resultArtist} numberOfLines={1}>
          {item.creator} • {item.trackCount} Tracks
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  // Search History Dropdown
  const renderSearchHistoryDropdown = () => {
    if (!isSearchFocused || searchHistory.length === 0) return null;

    return (
      <View 
        style={[
          styles.searchHistoryDropdown, 
          { 
            top: searchInputPosition.y + searchInputPosition.height,
            left: searchInputPosition.x,
            width: searchInputPosition.width 
          }
        ]}
      >
        <View style={styles.searchHistoryHeader}>
          <ThemedText style={styles.searchHistoryTitle}>Recent Searches</ThemedText>
          <TouchableOpacity onPress={clearSearchHistory}>
            <ThemedText style={styles.clearHistoryText}>Clear</ThemedText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={searchHistory}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.historyDropdownItem}
              onPress={() => handleHistoryItemPress(item)}
            >
              <Ionicons name="time" size={18} color="white" style={styles.historyItemIcon} />
              <ThemedText style={styles.historyDropdownItemText} numberOfLines={1}>
                {item}
              </ThemedText>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  removeHistoryItem(item);
                }}
                style={styles.removeHistoryItemButton}
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          style={styles.searchHistoryList}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1D2B3A', '#0F1624']}
        style={styles.container}
      >
        <View 
          style={styles.searchContainer}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setSearchInputPosition({ x, y, width, height });
          }}
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Search for songs, artists"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => {
              setIsSearchFocused(true);
              loadSearchHistory();
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsSearchFocused(false);
              }, 300);
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setArtistResults([]);
                setPlaylistResults([]);
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {renderSearchHistoryDropdown()}

        {/* Search Type Selector */}
        <View style={styles.searchTypeContainer}>
          {SEARCH_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.searchTypeButton,
                searchType === type.id && styles.searchTypeButtonActive
              ]}
              onPress={() => setSearchType(type.id)}
            >
              <Ionicons 
                name={type.icon} 
                size={20} 
                color={searchType === type.id ? 'white' : 'rgba(255,255,255,0.5)'} 
              />
              <ThemedText 
                style={[
                  styles.searchTypeText,
                  searchType === type.id && styles.searchTypeTextActive
                ]}
              >
                {type.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Grid */}
        {(searchQuery.trim() === '' || 
          (searchResults.length === 0 && artistResults.length === 0 && playlistResults.length === 0)) && 
          !isLoading && (
          <FlatList
            data={QUICK_SEARCH_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.categoryRow}
            style={styles.categoriesContainer}
          />
        )}

        {/* Search Results */}
        {isLoading ? (
          <ActivityIndicator 
            size="large" 
            color="white" 
            style={styles.loadingIndicator} 
          />
        ) : (
          <FlatList
            data={
              searchType === 'tracks' ? searchResults : 
              searchType === 'artists' ? artistResults : 
              playlistResults
            }
            renderItem={
              searchType === 'tracks' ? renderSearchResult : 
              searchType === 'artists' ? renderArtistResult : 
              renderPlaylistResult
            }
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            ListEmptyComponent={
              (searchType === 'artists' && artistResults.length === 0) ||
              (searchType === 'playlists' && playlistResults.length === 0) ||
              (searchType === 'tracks' && searchResults.length === 0) ? (
                <ThemedText style={styles.noResultsText}>
                  No results found for "{searchQuery}"
                </ThemedText>
              ) : (
                <ThemedText style={styles.noResultsText}>
                  Explore music by selecting a category or searching
                </ThemedText>
              )
            }
          />
        )}
      </LinearGradient>
      {renderAlbumSelectionModal()} 
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  searchContainer: {
    marginTop: 10,
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  clearButton: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  categoryRow: {
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 40) / 2 - 10,
    aspectRatio: 1.5,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  categoryImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  categoryImageStyle: {
    borderRadius: 15,
  },
  categoryTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsList: {
    paddingHorizontal: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 100,
    opacity: 0.7,
  },
  // Dropdown Search History Styles
  searchHistoryDropdown: {
    position: 'absolute',
    backgroundColor: 'rgba(29, 43, 58, 0.95)',
    borderRadius: 15,
    zIndex: 1000,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchHistoryTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearHistoryText: {
    color: 'rgba(255,255,255,0.7)',
  },
  historyDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  historyDropdownItemText: {
    color: 'white',
    flex: 1,
    marginLeft: 10,
  },
  removeHistoryItemButton: {
    marginLeft: 10,
  },
  resultActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1D2B3A',
    borderRadius: 15,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  albumSelectionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  albumSelectionText: {
    color: 'white',
    textAlign: 'center',
  },
  modalCancelButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: 'white',
  },
  searchTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  searchTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchTypeButtonActive: {
    backgroundColor: '#3498db',
  },
  searchTypeText: {
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 5,
  },
  searchTypeTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});