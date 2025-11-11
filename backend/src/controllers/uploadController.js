const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'ไม่พบไฟล์ภาพที่ส่งมา' });
    }

    const folder = req.body.folder || 'teeyai/articles';

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder,
      resource_type: 'image'
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'อัพโหลดภาพไม่สำเร็จ', error: error.message });
  } finally {
    if (req.file && req.file.path) {
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});
    }
  }
};

module.exports = {
  uploadImage
};
