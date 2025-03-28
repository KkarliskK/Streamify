import axios from 'axios';

class SoundCloudMusicService {
  constructor() {
    this.clientId = 'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M';
    this.baseUrl = 'https://api-v2.soundcloud.com';
  }

  async searchTracks(query, limit = 40) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          client_id: this.clientId,
          limit: limit,
          kind: 'track',
        }
      });

      return response.data.collection
        .map(track => {
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
            type: 'track',
            id: track.id.toString(),
            title: track.title,
            artist: track.user?.username || 'Unknown Artist',
            fullTrackUrl: progressiveTranscoding?.url || null,
            thumbnail: track.artwork_url || track.user?.avatar_url || 'https://via.placeholder.com/150',
            duration: track.duration,
            permalink: track.permalink_url
          };
        })
        .filter(track => track.fullTrackUrl);
    } catch (error) {
      console.error('SoundCloud Track Search Error:', error.response?.data || error.message);
      throw error;
    }
  }

   async searchArtists(query, limit = 50) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          client_id: this.clientId,
          limit: limit,
          kind: 'user',
        }
      });

      // Filter out artists with zero followers to improve quality
      const filteredArtists = response.data.collection
        .filter(artist => artist.followers_count > 0)
        .map(artist => ({
          type: 'artist',
          id: artist.id.toString(),
          name: artist.username,
          followers: artist.followers_count,
          thumbnail: artist.avatar_url || 'https://via.placeholder.com/150',
          permalink: artist.permalink_url,
          city: artist.city,
          country: artist.country
        }))
        // Sort by number of followers to prioritize more popular artists
        .sort((a, b) => b.followers - a.followers)
        // Limit to top results
        .slice(0, 20);

      // If no artists found, try a broader search
      if (filteredArtists.length === 0) {
        return this.searchArtistsFallback(query);
      }

      return filteredArtists;
    } catch (error) {
      console.error('SoundCloud Artist Search Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchArtistsFallback(query) {
    try {
      // Try a more relaxed search with broader terms
      const broadenedQuery = query.split(/\s+/)[0]; // Use first word
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: broadenedQuery,
          client_id: this.clientId,
          limit: 50,
          kind: 'user',
        }
      });

      return response.data.collection
        .filter(artist => artist.followers_count > 100) // Higher threshold
        .map(artist => ({
          type: 'artist',
          id: artist.id.toString(),
          name: artist.username,
          followers: artist.followers_count,
          thumbnail: artist.avatar_url || 'https://via.placeholder.com/150',
          permalink: artist.permalink_url,
          city: artist.city,
          country: artist.country
        }))
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 20);
    } catch (error) {
      console.error('SoundCloud Artist Fallback Search Error:', error.response?.data || error.message);
      return []; // Return empty array if fallback fails
    }
  }

  // Optional: Add a method to fetch related artists
  async getRelatedArtists(artistId, limit = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${artistId}/related`, {
        params: {
          client_id: this.clientId,
          limit: limit
        }
      });

      return response.data.collection.map(artist => ({
        type: 'artist',
        id: artist.id.toString(),
        name: artist.username,
        followers: artist.followers_count,
        thumbnail: artist.avatar_url || 'https://via.placeholder.com/150',
        permalink: artist.permalink_url
      }));
    } catch (error) {
      console.error('SoundCloud Related Artists Error:', error.response?.data || error.message);
      return [];
    }
  }

  async searchPlaylists(query, limit = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          client_id: this.clientId,
          limit: limit,
          kind: 'playlist',
        }
      });

      return response.data.collection
        .map(playlist => ({
          type: 'playlist',
          id: playlist.id.toString(),
          title: playlist.title,
          creator: playlist.user?.username || 'Unknown',
          trackCount: playlist.track_count,
          thumbnail: playlist.artwork_url || 'https://via.placeholder.com/150',
          permalink: playlist.permalink_url
        }));
    } catch (error) {
      console.error('SoundCloud Playlist Search Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchAll(query) {
    try {
      const [tracks, artists, playlists] = await Promise.all([
        this.searchTracks(query, 20),
        this.searchArtists(query, 10),
        this.searchPlaylists(query, 10)
      ]);

      return {
        tracks,
        artists,
        playlists
      };
    } catch (error) {
      console.error('SoundCloud All Search Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new SoundCloudMusicService();