/**
 * Image Compression Utility
 * Client-side image optimization before upload
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeMB?: number
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  maxSizeMB: 2,
}

/**
 * Compress an image file
 * @param file - Image file to compress
 * @param options - Compression options
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

        // Calculate new dimensions while maintaining aspect ratio
        if (width > opts.maxWidth! || height > opts.maxHeight!) {
          const aspectRatio = width / height

          if (width > height) {
            width = opts.maxWidth!
            height = width / aspectRatio
          } else {
            height = opts.maxHeight!
            width = height * aspectRatio
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"))
              return
            }

            // Check if compressed size is acceptable
            const sizeMB = blob.size / (1024 * 1024)
            if (sizeMB > opts.maxSizeMB! && opts.quality! > 0.1) {
              // Recursively compress with lower quality
              const newQuality = Math.max(0.1, opts.quality! - 0.1)
              compressImage(file, { ...opts, quality: newQuality })
                .then(resolve)
                .catch(reject)
            } else {
              resolve(blob)
            }
          },
          "image/jpeg",
          opts.quality
        )
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

/**
 * Convert image file to base64 string
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  isValid: boolean
  error?: string
} {
  const validTypes = ["image/jpeg", "image/png", "image/webp"]
  const maxSizeMB = 10

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Please upload JPEG, PNG, or WebP images.",
    }
  }

  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `File size (${sizeMB.toFixed(1)}MB) exceeds maximum allowed size of ${maxSizeMB}MB.`,
    }
  }

  return { isValid: true }
}

/**
 * Batch compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<Blob[]> {
  const compressionPromises = files.map((file) => compressImage(file, options))
  return Promise.all(compressionPromises)
}
