const presetName = "unsinged_demo_preset";

class CloudinaryService {
  async uploadSingleImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", presetName);
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/di9ni12yj/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await response.json();
    return data.secure_url as string;
  }

  async uploadMultiImages(files: FileList) {
    const uploadPromise = Array.from(files, (f) => this.uploadSingleImage(f));
    const fileURLs = await Promise.all(uploadPromise);
    return fileURLs;
  }
}

export const cloudinaryService = new CloudinaryService();
