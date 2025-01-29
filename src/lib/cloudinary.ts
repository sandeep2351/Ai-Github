import axios, { AxiosRequestConfig } from "axios";

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dijphuo8u/upload";
            const CLOUDINARY_UPLOAD_PRESET = "githubsaas";

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const config: AxiosRequestConfig = {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        if (setProgress) setProgress(progress);
                    }
                },
            };

            axios
                .post(CLOUDINARY_UPLOAD_URL, formData, config)
                .then((response) => {
                    console.log("File uploaded successfully");
                    resolve(response.data.secure_url as string);
                })
                .catch((error) => {
                    console.error("Error uploading file:", error);
                    reject(error);
                });
        } catch (error) {
            console.error("Error in uploadFile:", error);
            reject(error);
        }
    });
}
