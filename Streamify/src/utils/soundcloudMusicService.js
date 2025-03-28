import axios from 'axios';

class SoundCloudMusicService {
  constructor() {
    this.clientId = 'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M';
    this.baseUrl = 'https://api.soundcloud.com';
  }

  async searchSongs(query) {
    try {
      const response = await axios.get('https://api-v2.soundcloud.com/search', {
        params: {
          q: query,
          client_id: this.clientId,
          limit: 40,
          kind: 'track',
        }
      });

      return response.data.collection
        .map(track => {
          // Add more fallback options for stream URL resolution
          const transcodings = track.media?.transcodings || [];
          const progressiveTranscoding = 
            transcodings.find(t => 
              t.format?.protocol === 'progressive' && 
              t.format?.mime_type === 'audio/mpeg'
            ) ||
            transcodings.find(t => 
              t.format?.protocol === 'progressive'
            ) ||
            transcodings[0];

          return {
            id: track.id.toString(),
            title: track.title,
            artist: track.user?.username || 'Unknown Artist',
            fullTrackUrl: progressiveTranscoding?.url || null,
            thumbnail: track.artwork_url || track.user?.avatar_url || 'https://via.placeholder.com/150',
            duration: track.duration,
            permalink: track.permalink_url // Add permalink for debugging
          };
        })
        .filter(track => track.fullTrackUrl);
    } catch (error) {
      console.error('SoundCloud Search Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new SoundCloudMusicService();