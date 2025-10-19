//
//  ImageCacheService.swift
//  AmrikyyTravelAgent
//
//  Created by CURSERO AI Agent
//  Copyright © 2025 AMRIKYY AI Solutions. All rights reserved.
//

import Foundation
import SDWebImageSwiftUI
import SDWebImage

/**
 * @class ImageCacheService
 * @description Enterprise-grade image caching service using SDWebImage
 * Provides high-performance image loading with memory and disk caching
 */
class ImageCacheService: ObservableObject {
    
    // MARK: - Singleton
    static let shared = ImageCacheService()
    
    // MARK: - Properties
    @Published var cacheSize: String = "0 MB"
    @Published var isCacheClearing = false
    
    private let imageCache = SDImageCache.shared
    private let imageManager = SDWebImageManager.shared
    
    // MARK: - Initialization
    private init() {
        configureCache()
        updateCacheSize()
    }
    
    // MARK: - Cache Configuration
    private func configureCache() {
        // Configure memory cache (50MB)
        imageCache.config.maxMemoryCost = 50 * 1024 * 1024
        
        // Configure disk cache (200MB)
        imageCache.config.maxDiskSize = 200 * 1024 * 1024
        
        // Set cache expiration (7 days)
        imageCache.config.maxDiskAge = 7 * 24 * 60 * 60
        
        // Enable automatic cleanup
        imageCache.config.shouldRemoveExpiredDataWhenEnterBackground = true
    }
    
    // MARK: - Public Methods
    
    /**
     * Load image with caching
     * @param url: Image URL string
     * @param placeholder: Placeholder image name
     * @param completion: Completion handler with UIImage
     */
    func loadImage(
        from url: String?,
        placeholder: String = "photo",
        completion: @escaping (UIImage?) -> Void
    ) {
        guard let urlString = url, !urlString.isEmpty,
              let imageURL = URL(string: urlString) else {
            completion(UIImage(systemName: placeholder))
            return
        }
        
        imageManager.loadImage(
            with: imageURL,
            options: [.retryFailed, .refreshCached],
            progress: nil
        ) { image, _, error, _, _, _ in
            DispatchQueue.main.async {
                if let error = error {
                    print("ImageCacheService: Failed to load image from \(urlString) - \(error.localizedDescription)")
                    completion(UIImage(systemName: placeholder))
                } else {
                    completion(image)
                }
            }
        }
    }
    
    /**
     * Preload images for better performance
     * @param urls: Array of image URL strings
     */
    func preloadImages(urls: [String]) {
        let validURLs = urls.compactMap { URL(string: $0) }
        
        imageManager.imageDownloader?.downloadImage(
            with: validURLs,
            options: [.retryFailed],
            progress: nil
        ) { _, _, _, _ in
            // Preload completed
        }
    }
    
    /**
     * Clear memory cache
     */
    func clearMemoryCache() {
        imageCache.clearMemory()
        updateCacheSize()
    }
    
    /**
     * Clear disk cache
     */
    func clearDiskCache() {
        isCacheClearing = true
        
        imageCache.clearDisk {
            DispatchQueue.main.async {
                self.isCacheClearing = false
                self.updateCacheSize()
            }
        }
    }
    
    /**
     * Clear all caches (memory + disk)
     */
    func clearAllCaches() {
        isCacheClearing = true
        
        imageCache.clearMemory()
        imageCache.clearDisk {
            DispatchQueue.main.async {
                self.isCacheClearing = false
                self.updateCacheSize()
            }
        }
    }
    
    /**
     * Get cache size information
     */
    func getCacheSize() -> String {
        let diskSize = imageCache.diskCache.totalSize()
        let memorySize = imageCache.memoryCache.totalCost()
        
        let totalSize = diskSize + memorySize
        return ByteCountFormatter.string(fromByteCount: Int64(totalSize), countStyle: .file)
    }
    
    /**
     * Check if image is cached
     * @param url: Image URL string
     * @return: Boolean indicating if image is cached
     */
    func isImageCached(url: String) -> Bool {
        guard let imageURL = URL(string: url) else { return false }
        
        let cacheKey = imageManager.cacheKey(for: imageURL)
        return imageCache.diskImageExists(forKey: cacheKey) || 
               imageCache.memoryImageExists(forKey: cacheKey)
    }
    
    // MARK: - Private Methods
    
    private func updateCacheSize() {
        cacheSize = getCacheSize()
    }
    
    /**
     * Clean expired cache data
     */
    func cleanExpiredCache() {
        imageCache.cleanExpiredDiskCache {
            DispatchQueue.main.async {
                self.updateCacheSize()
            }
        }
    }
}

// MARK: - SwiftUI Integration

/**
 * SwiftUI view modifier for cached images
 */
struct CachedImageView: View {
    let url: String?
    let placeholder: String
    let contentMode: ContentMode
    
    init(
        url: String?,
        placeholder: String = "photo",
        contentMode: ContentMode = .fit
    ) {
        self.url = url
        self.placeholder = placeholder
        self.contentMode = contentMode
    }
    
    var body: some View {
        AsyncImage(url: URL(string: url ?? "")) { image in
            image
                .resizable()
                .aspectRatio(contentMode: contentMode)
        } placeholder: {
            Image(systemName: placeholder)
                .foregroundColor(.gray)
                .aspectRatio(contentMode: contentMode)
        }
        .onAppear {
            // Preload image for better performance
            if let url = url {
                ImageCacheService.shared.preloadImages(urls: [url])
            }
        }
    }
}

// MARK: - Extensions

extension ImageCacheService {
    
    /**
     * Configure cache for different image types
     */
    func configureForImageType(_ type: ImageType) {
        switch type {
        case .avatar:
            imageCache.config.maxMemoryCost = 10 * 1024 * 1024 // 10MB for avatars
            imageCache.config.maxDiskSize = 50 * 1024 * 1024   // 50MB for avatars
            
        case .destination:
            imageCache.config.maxMemoryCost = 100 * 1024 * 1024 // 100MB for destinations
            imageCache.config.maxDiskSize = 500 * 1024 * 1024   // 500MB for destinations
            
        case .general:
            configureCache() // Use default configuration
        }
    }
}

enum ImageType {
    case avatar
    case destination
    case general
}
