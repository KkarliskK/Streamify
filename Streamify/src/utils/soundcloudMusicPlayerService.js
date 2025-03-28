import { Audio } from 'expo-av';
import axios from 'axios';

class MusicPlayerService {
  constructor() {
    this.currentSound = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentPlaylist = [];
    this.currentPlaylistIndex = -1;
    this.clientId = 'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M';
    this.playbackMode = 'default';
    
    this.currentTrackListeners = [];
    this.playbackStatusListeners = [];
  }

  async resolveStreamUrl(fullTrackUrl, trackInfo) {
    try {
      const streamInfoResponse = await axios.get(fullTrackUrl, {
        params: { client_id: this.clientId },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });

      const signedStreamUrl = streamInfoResponse.data?.url;

      if (!signedStreamUrl) {
        throw new Error('Could not resolve stream URL');
      }

      return signedStreamUrl;
    } catch (error) {
      console.error('Stream URL Resolution Error:', error);
      throw error;
    }
  }

  onCurrentTrackUpdate(callback) {
    this.currentTrackListeners.push(callback);
    return {
      remove: () => {
        this.currentTrackListeners = this.currentTrackListeners.filter(
          listener => listener !== callback
        );
      }
    };
  }

  onPlaybackStatusUpdate(callback) {
    this.playbackStatusListeners.push(callback);
    return {
      remove: () => {
        this.playbackStatusListeners = this.playbackStatusListeners.filter(
          listener => listener !== callback
        );
      }
    };
  }

  _notifyCurrentTrackListeners(track) {
    this.currentTrackListeners.forEach(listener => listener(track));
  }

  _notifyPlaybackStatusListeners(status) {
    this.playbackStatusListeners.forEach(listener => listener(status));
  }

  async playStream(fullTrackUrl, trackInfo, playlist = null) {
    try {
      if (this.currentSound) {
        await this.stopSound();
      }

      if (playlist) {
        this.currentPlaylist = playlist;
        this.currentPlaylistIndex = playlist.findIndex(
          track => track.url === fullTrackUrl
        );
      }

      const directStreamUrl = await this.resolveStreamUrl(fullTrackUrl, trackInfo);
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: directStreamUrl },
        { 
          shouldPlay: true,
          volume: 1.0,
          staysActiveInBackground: true,
        }
      );

      sound.setOnPlaybackStatusUpdate(async (status) => {
        this._notifyPlaybackStatusListeners({
          isPlaying: status.isPlaying,
          positionMillis: status.positionMillis,
          durationMillis: status.durationMillis,
          ...status
        });

        if (status.didJustFinish) {
          await this.stopSound();
          await this.playNextTrack();
        }
      });

      this.currentSound = sound;
      this.isPlaying = true;
      this.currentTrack = trackInfo;

      this._notifyCurrentTrackListeners(trackInfo);

      return sound;
    } catch (error) {
      console.error('Audio Playback Error:', error);
      throw error;
    }
  }

  async pauseSound() {
    if (this.currentSound && this.isPlaying) {
      await this.currentSound.pauseAsync();
      this.isPlaying = false;
      this._notifyPlaybackStatusListeners({ isPlaying: false });
    }
  }

  async resumeSound() {
    if (this.currentSound && !this.isPlaying) {
      await this.currentSound.playAsync();
      this.isPlaying = true;
      this._notifyPlaybackStatusListeners({ isPlaying: true });
    }
  }

  async stopSound() {
    if (this.currentSound) {
      await this.currentSound.stopAsync();
      await this.currentSound.unloadAsync();
      this.currentSound = null;
      this.isPlaying = false;
      
      this._notifyPlaybackStatusListeners({ isPlaying: false });
      this._notifyCurrentTrackListeners(null);
      
      this.currentTrack = null;
    }
  }

  async playNextTrack() {
    if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
      return;
    }

    switch (this.playbackMode) {
      case 'repeatOne':
        if (this.currentTrack) {
          await this.playStream(
            this.currentTrack.fullTrackUrl, 
            this.currentTrack, 
            this.currentPlaylist
          );
        }
        break;

      case 'shuffle':
        const randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        const randomTrack = this.currentPlaylist[randomIndex];
        await this.playStream(randomTrack.fullTrackUrl, randomTrack, this.currentPlaylist);
        break;

      case 'repeat':
        this.currentPlaylistIndex = 
          (this.currentPlaylistIndex + 1) % this.currentPlaylist.length;
        const nextTrackRepeat = this.currentPlaylist[this.currentPlaylistIndex];
        await this.playStream(nextTrackRepeat.fullTrackUrl, nextTrackRepeat, this.currentPlaylist);
        break;

      default:
        this.currentPlaylistIndex++;
        if (this.currentPlaylistIndex < this.currentPlaylist.length) {
          const nextTrack = this.currentPlaylist[this.currentPlaylistIndex];
          await this.playStream(nextTrack.fullTrackUrl, nextTrack, this.currentPlaylist);
        }
        break;
    }
  }

  setPlaybackMode(mode) {
    const validModes = ['default', 'repeat', 'repeatOne', 'shuffle'];
    if (validModes.includes(mode)) {
      this.playbackMode = mode;
    } else {
      throw new Error('Invalid playback mode');
    }
  }
}

export default new MusicPlayerService();