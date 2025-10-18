class ContentChunker {
  /**
   * Splits text into chunks of a specified size with overlap.
   * @param {object} content - The content object from ContentExtractor { title, content, url }.
   * @param {number} chunkSize - The target size of each chunk.
   * @param {number} overlap - The number of characters to overlap between chunks.
   * @returns {Array<object>} An array of chunk objects.
   */
  chunk(content, chunkSize = 1500, overlap = 150) {
    const text = content.content;
    if (!text) return [];

    const chunks = [];
    let index = 0;
    let chunkIndex = 0;

    while (index < text.length) {
      const end = Math.min(index + chunkSize, text.length);
      chunks.push({
        chunk_id: `${content.url}-${chunkIndex}`,
        source_url: content.url,
        source_title: content.title,
        chunk_text: text.substring(index, end),
        chunk_index: chunkIndex++,
      });
      index += chunkSize - overlap;
    }
    return chunks;
  }
}

module.exports = ContentChunker;
