import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary } from '@/src/utils/LibraryContext';
import { useNavigation } from '@react-navigation/native';

export default function LibraryScreen() {
  const navigation = useNavigation();
  const { 
    likedSongs, 
    albums, 
    createAlbum, 
    removeAlbum,
    likeSong 
  } = useLibrary();
  

  const [isCreateAlbumModalVisible, setIsCreateAlbumModalVisible] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const handleCreateAlbum = async () => {
    if (newAlbumName.trim() === '') {
      Alert.alert('Invalid Album Name', 'Please enter a name for the album');
      return;
    }

    await createAlbum(newAlbumName);
    setNewAlbumName('');
    setIsCreateAlbumModalVisible(false);
  };

  const renderLikedSongsSection = () => (
    <View style={[styles.sectionContainer, { marginTop: 60 }]}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Liked Songs</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          {likedSongs.length} Songs
        </ThemedText>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {likedSongs.map((song) => (
          <TouchableOpacity key={song.id} style={styles.likedSongItem}>
            <Image 
              source={{ uri: song.thumbnail }} 
              style={styles.likedSongCover} 
            />
            <ThemedText style={styles.likedSongTitle} numberOfLines={1}>
              {song.title}
            </ThemedText>
            <ThemedText style={styles.likedSongArtist} numberOfLines={1}>
              {song.artist}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAlbumsSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>My Albums</ThemedText>
        <TouchableOpacity onPress={() => setIsCreateAlbumModalVisible(true)}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {albums.map((album) => (
        <TouchableOpacity 
          key={album.id} 
          style={styles.albumItem}
          onPress={() => navigation.navigate('album-detail', { album })}
        >
          <Image 
            source={
              album.songs.length > 0 
                ? { uri: album.songs[0].thumbnail } 
                : require('@/assets/images/react-logo.png')
            } 
            style={styles.albumCover} 
          />
          <View style={styles.albumInfo}>
            <ThemedText style={styles.albumTitle}>
              {album.name}
            </ThemedText>
            <ThemedText style={styles.albumTracks}>
              {album.songs.length} Tracks
            </ThemedText>
          </View>
          <TouchableOpacity 
            onPress={() => removeAlbum(album.id)}
            style={styles.deleteAlbumButton}
          >
            <Ionicons name="trash" size={20} color="red" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCreateAlbumModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isCreateAlbumModalVisible}
      onRequestClose={() => setIsCreateAlbumModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ThemedText style={styles.modalTitle}>Create New Album</ThemedText>
          <TextInput
            style={styles.albumNameInput}
            placeholder="Enter album name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={newAlbumName}
            onChangeText={setNewAlbumName}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setIsCreateAlbumModalVisible(false)}
            >
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCreateButton}
              onPress={handleCreateAlbum}
            >
              <ThemedText style={styles.modalCreateText}>Create</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
      <LinearGradient
        colors={['#1D2B3A', '#0F1624']}
        style={styles.container}
      >
      <ScrollView style={styles.contentContainer}>
        {renderLikedSongsSection()}
        {renderAlbumsSection()}
      </ScrollView>
      {renderCreateAlbumModal()}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Existing styles from the previous library screen...
  container: {
    flex: 1,
    paddingTop: 0,
  },
  sectionContainer: {
    marginBottom: 30,
    MarginLeft: 10,
    marginRight: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  likedSongItem: {
    marginRight: 15,
    width: 150,
    paddingLeft: 10,
  },
  likedSongCover: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  likedSongTitle: {
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  },
  likedSongArtist: {
    color: 'rgba(255,255,255,0.7)',
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 10,
    marginLeft: 10,
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  albumTracks: {
    color: 'rgba(255,255,255,0.7)',
  },
  deleteAlbumButton: {
    padding: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#1D2B3A',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    height: "90%",
    display: 'flex',
    justifyContent: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  albumNameInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCreateButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: 'white',
  },
  modalCreateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});