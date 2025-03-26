import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyAP4I8RxDfGgLv_JfNkllSlAsF6BDOguh4'; // Replace with your actual API key
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Search for music videos on YouTube
 * @param {string} query - Search query (e.g., "The Weeknd Blinding Lights")
 * @param {number} maxResults - Maximum number of results to fetch
 * @returns {Promise<Array>} List of music videos
 */
export async function searchMusicVideos(query, maxResults = 10) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: `${query} music`,
        type: 'video',
        part: 'snippet',
        maxResults: maxResults,
        videoCategoryId: '10', // Music category
        order: 'relevance'
      }
    });

    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('YouTube API Search Error:', error.response ? error.response.data : error.message);
    return [];
  }
}

/**
 * Get video details including duration
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Detailed video information
 */
export async function getVideoDetails(videoId) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'contentDetails,snippet',
        id: videoId
      }
    });

    const video = response.data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      duration: video.contentDetails.duration
    };
  } catch (error) {
    console.error('YouTube API Details Error:', error.response ? error.response.data : error.message);
    return null;
  }
}