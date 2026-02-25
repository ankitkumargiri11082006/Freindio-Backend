const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, folder = "chat-app/messages") => {
  const mimeType = file.mimetype || "image/png";
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
  });

  return result.secure_url;
};

module.exports = { cloudinary, uploadToCloudinary };