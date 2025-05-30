
import { validateAndSanitizeText, checkRateLimit, createSafeErrorMessage } from '../utils/security';

// API configuration with timeouts and retry logic
const API_CONFIG = {
  baseUrl: 'https://api.mymemory.translated.net',
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Implements exponential backoff for retries
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Secure translation service with input validation and error handling
 */
export class TranslationService {
  private static async makeRequest(
    url: string, 
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic with exponential backoff
      if (retryCount < API_CONFIG.maxRetries && 
          (error as Error).name !== 'AbortError') {
        await delay(API_CONFIG.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  static async translateText(
    text: string, 
    targetLanguage: string
  ): Promise<{ success: boolean; translation?: string; error?: string }> {
    try {
      // Rate limiting check
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        const resetTime = rateLimitCheck.resetTime;
        const waitTime = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
        
        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`
        };
      }

      // Input validation and sanitization
      const validation = validateAndSanitizeText(text);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Invalid input'
        };
      }

      // Validate target language
      const allowedLanguages = ['en', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ko', 'hi', 'th', 'vi', 'nl', 'sv'];
      if (!allowedLanguages.includes(targetLanguage)) {
        return {
          success: false,
          error: 'Unsupported target language'
        };
      }

      // Make the API request
      const url = `${API_CONFIG.baseUrl}/get?q=${encodeURIComponent(validation.sanitizedText)}&langpair=ja|${targetLanguage}`;
      const response = await this.makeRequest(url);
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return {
          success: true,
          translation: data.responseData.translatedText
        };
      } else {
        throw new Error('Translation service returned invalid response');
      }

    } catch (error) {
      console.error('Translation error:', error);
      
      return {
        success: false,
        error: createSafeErrorMessage(error)
      };
    }
  }
}
