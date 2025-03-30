// src/services/contentful.ts
// This file contains utility functions for working with the Contentful API
// Note: This is a placeholder implementation. In a production environment,
// you would need to implement proper authentication and error handling.

/**
 * Configuration options for Contentful API
 */
interface ContentfulConfig {
  spaceId: string;
  accessToken: string;
  environmentId: string;
}

/**
 * Simple client for interacting with Contentful CMS
 */
export class ContentfulClient {
  private spaceId: string;
  private accessToken: string;
  private environmentId: string;
  private baseUrl: string;

  constructor(config: ContentfulConfig) {
    this.spaceId = config.spaceId;
    this.accessToken = config.accessToken;
    this.environmentId = config.environmentId || 'master';
    this.baseUrl = `https://api.contentful.com/spaces/${this.spaceId}/environments/${this.environmentId}`;
  }

  /**
   * Get headers for Contentful API requests
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new entry in Contentful
   * @param contentTypeId Content type ID
   * @param fields Entry fields
   * @returns Promise with the created entry
   */
  async createEntry(contentTypeId: string, fields: Record<string, any>) {
    try {
      const response = await fetch(`${this.baseUrl}/entries`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'X-Contentful-Content-Type': contentTypeId
        },
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        throw new Error(`Failed to create entry: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Contentful entry:', error);
      throw error;
    }
  }

  /**
   * Upload an asset to Contentful
   * @param file File to upload
   * @param title Asset title
   * @param description Asset description
   * @returns Promise with the uploaded asset
   */
  async uploadAsset(file: File, title: string, description: string) {
    try {
      // Create upload
      const createUploadResponse = await fetch(`https://upload.contentful.com/spaces/${this.spaceId}/uploads`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: file
      });

      if (!createUploadResponse.ok) {
        throw new Error(`Failed to create upload: ${createUploadResponse.statusText}`);
      }

      const uploadData = await createUploadResponse.json();

      // Create asset
      const assetData = {
        fields: {
          title: {
            'en-US': title
          },
          description: {
            'en-US': description
          },
          file: {
            'en-US': {
              contentType: file.type,
              fileName: file.name,
              uploadFrom: {
                sys: {
                  type: 'Link',
                  linkType: 'Upload',
                  id: uploadData.sys.id
                }
              }
            }
          }
        }
      };

      const createAssetResponse = await fetch(`${this.baseUrl}/assets`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(assetData)
      });

      if (!createAssetResponse.ok) {
        throw new Error(`Failed to create asset: ${createAssetResponse.statusText}`);
      }

      const asset = await createAssetResponse.json();

      // Process asset
      const processResponse = await fetch(`${this.baseUrl}/assets/${asset.sys.id}/files/en-US/process`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!processResponse.ok) {
        throw new Error(`Failed to process asset: ${processResponse.statusText}`);
      }

      return asset;
    } catch (error) {
      console.error('Error uploading asset to Contentful:', error);
      throw error;
    }
  }

  /**
   * Convert formatted HTML to Contentful Rich Text format
   * This is a simplified version - a real implementation would need to properly
   * parse HTML and convert it to Contentful's Rich Text format
   * 
   * @param html HTML content
   * @returns Contentful Rich Text data structure
   */
  convertHtmlToRichText(html: string) {
    // This is a placeholder. In a real implementation, you would:
    // 1. Parse the HTML
    // 2. Convert it to Contentful's Rich Text format
    // 3. Return the structured data
    console.warn('HTML to Rich Text conversion is not fully implemented');
    
    return {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Placeholder for Rich Text conversion',
              marks: [],
              data: {}
            }
          ]
        }
      ]
    };
  }

  /**
   * Create an article in Contentful
   * @param title Article title
   * @param content Formatted HTML content
   * @param tags Article tags
   * @returns Promise with the created article
   */
  async createArticle(title: string, content: string, tags: string[] = []) {
    try {
      // Convert HTML to Rich Text
      const richTextContent = this.convertHtmlToRichText(content);
      
      // Create entry
      const entry = await this.createEntry('article', {
        title: { 'en-US': title },
        content: { 'en-US': richTextContent },
        tags: { 'en-US': tags }
      });
      
      return entry;
    } catch (error) {
      console.error('Error creating article in Contentful:', error);
      throw error;
    }
  }
}

/**
 * Initialize a Contentful client
 * @param spaceId Contentful space ID
 * @param accessToken Contentful access token
 * @param environmentId Contentful environment ID (defaults to 'master')
 * @returns ContentfulClient instance
 */
export function initContentful(spaceId: string, accessToken: string, environmentId: string = 'master') {
  return new ContentfulClient({
    spaceId,
    accessToken,
    environmentId
  });
}

// Export functions for future implementation
export const contentfulUtils = {
  /**
   * Prepare document for Contentful import
   * @param html Formatted HTML
   * @returns Content prepared for Contentful
   */
  prepareForContentful: (html: string) => {
    // This would convert the HTML to a format suitable for Contentful
    // This is a placeholder for future implementation
    return html;
  },
  
  /**
   * Get link to an image in Contentful
   * @param assetId Contentful asset ID
   * @returns URL to the image
   */
  getImageLink: (assetId: string) => {
    // This would generate a link to an image in Contentful
    // This is a placeholder for future implementation
    return `https://images.ctfassets.net/[space-id]/[asset-id]/${assetId}/[filename]`;
  }
};
