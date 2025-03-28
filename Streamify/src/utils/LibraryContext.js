import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [albums, setAlbums] = useState([]);

  // Load library data on initialization
  useEffect(() => {
    loadLibraryData();
  }, []);

  
  const loadLibraryData = async () => {
    try {
      const storedLikedSongs = await AsyncStorage.getItem('LIKED_SONGS');
      const storedAlbums = await AsyncStorage.getItem('USER_ALBUMS');

      if (storedLikedSongs) {
        setLikedSongs(JSON.parse(storedLikedSongs));
      }

      if (storedAlbums) {
        setAlbums(JSON.parse(storedAlbums));
      }
    } catch (error) {
      console.error('Error loading library data:', error);
    }
  };

  const likeSong = async (song) => {
    const isAlreadyLiked = likedSongs.some(s => s.id === song.id);
    
    let updatedLikedSongs;
    if (isAlreadyLiked) {
      updatedLikedSongs = likedSongs.filter(s => s.id !== song.id);
    } else {
      updatedLikedSongs = [...likedSongs, song];
    }

    setLikedSongs(updatedLikedSongs);
    await AsyncStorage.setItem('LIKED_SONGS', JSON.stringify(updatedLikedSongs));
  };

  const createAlbum = async (albumName) => {
    const newAlbum = {
      id: Date.now().toString(),
      name: albumName,
      songs: [],
      createdAt: new Date().toISOString(),
    };

    const updatedAlbums = [...albums, newAlbum];
    setAlbums(updatedAlbums);
    await AsyncStorage.setItem('USER_ALBUMS', JSON.stringify(updatedAlbums));
    return newAlbum;
  };

  const addSongToAlbum = async (albumId, song) => {
    const updatedAlbums = albums.map(album => {
      if (album.id === albumId) {
        const isAlreadyInAlbum = album.songs.some(s => s.id === song.id);
        if (!isAlreadyInAlbum) {
          return {
            ...album,
            songs: [...album.songs, song]
          };
        }
      }
      return album;
    });

    setAlbums(updatedAlbums);
    await AsyncStorage.setItem('USER_ALBUMS', JSON.stringify(updatedAlbums));
  };

  const removeAlbum = async (albumId) => {
    const updatedAlbums = albums.filter(album => album.id !== albumId);
    setAlbums(updatedAlbums);
    await AsyncStorage.setItem('USER_ALBUMS', JSON.stringify(updatedAlbums));
  };

  const removeSongFromAlbum = async (albumId, songId) => {
    const updatedAlbums = albums.map(album => {
      if (album.id === albumId) {
        return {
          ...album,
          songs: album.songs.filter(song => song.id !== songId)
        };
      }
      return album;
    });

    setAlbums(updatedAlbums);
    await AsyncStorage.setItem('USER_ALBUMS', JSON.stringify(updatedAlbums));
  };

  return (
    <LibraryContext.Provider value={{
      likedSongs,
      albums,
      likeSong,
      createAlbum,
      addSongToAlbum,
      removeAlbum,
      removeSongFromAlbum
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};