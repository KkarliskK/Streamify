import { Audio } from 'expo-av';
import axios from 'axios';

class MusicPlayerService {
  constructor() {
    this.currentSound = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.clientId = 'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M';
  }

  async resolveStreamUrl(fullTrackUrl, trackInfo) {
    try {
      // First, fetch the actual streaming information
      const streamInfoResponse = await axios.get(fullTrackUrl, {
        params: { client_id: this.clientId },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });

      // Extract the signed URL from the response
      const signedStreamUrl = streamInfoResponse.data?.url;

      if (!signedStreamUrl) {
        throw new Error('Could not resolve stream URL');
      }

      console.log('Resolved Signed Stream URL:', signedStreamUrl);
      return signedStreamUrl;
    } catch (error) {
      console.error('Stream URL Resolution Error:', {
        message: error.message,
        response: error.response?.data,
        url: fullTrackUrl
      });
      throw error;
    }
  }

  async playStream(fullTrackUrl, trackInfo) {
    try {
      // Stop any currently playing sound
      if (this.currentSound) {
        await this.stopSound();
      }

      // More verbose logging for debugging
      console.log('Attempting to play track:', {
        title: trackInfo.title,
        artist: trackInfo.artist,
        originalUrl: fullTrackUrl
      });

      // Resolve the actual stream URL
      const directStreamUrl = await this.resolveStreamUrl(fullTrackUrl, trackInfo);
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load and play the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: directStreamUrl },
        { 
          shouldPlay: true,
          volume: 1.0,
          staysActiveInBackground: true,
        }
      );

      // Setup playback status update
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await this.stopSound();
        }
      });

      this.currentSound = sound;
      this.isPlaying = true;
      this.currentTrack = trackInfo;

      return sound;
    } catch (error) {
      console.error('Audio Playback Error:', {
        message: error.message,
        response: error.response?.data,
        trackInfo: trackInfo
      });
      throw error;
    }
  }

  async pauseSound() {
    if (this.currentSound && this.isPlaying) {
      await this.currentSound.pauseAsync();
      this.isPlaying = false;
    }
  }

  async resumeSound() {
    if (this.currentSound && !this.isPlaying) {
      await this.currentSound.playAsync();
      this.isPlaying = true;
    }
  }

  async stopSound() {
    if (this.currentSound) {
      await this.currentSound.stopAsync();
      await this.currentSound.unloadAsync();
      this.currentSound = null;
      this.isPlaying = false;
      this.currentTrack = null;
    }
  }
}

export default new MusicPlayerService();