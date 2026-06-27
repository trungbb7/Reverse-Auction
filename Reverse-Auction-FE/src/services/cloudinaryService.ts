const presetName = import.meta.env.VITE_CLOUDINARY_PRESET_NAME || "";

export type CloudinaryMediaType = "image" | "video";

export interface CloudinaryUploadResult {
  type: CloudinaryMediaType;
  url: string;
}

class CloudinaryService {
  private getMediaType(file: File): CloudinaryMediaType {
    return file.type.startsWith("video/") ? "video" : "image";
  }

  async uploadSingleMedia(file: File): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", presetName);
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/di9ni12yj/auto/upload",
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await response.json();
    if (!response.ok || !data.secure_url) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return {
      type: data.resource_type === "video" ? "video" : this.getMediaType(file),
      url: data.secure_url as string,
    };
  }

  async uploadSingleImage(file: File) {
    const data = await this.uploadSingleMedia(file);
    return data.url;
  }

  async uploadMultiImages(files: FileList) {
    const uploadPromise = Array.from(files, (f) => this.uploadSingleImage(f));
    const fileURLs = await Promise.all(uploadPromise);
    return fileURLs;
  }

  async uploadMultiMedia(files: FileList | File[]) {
    const uploadPromise = Array.from(files, (f) => this.uploadSingleMedia(f));
    return Promise.all(uploadPromise);
  }
}

export const cloudinaryService = new CloudinaryService();
