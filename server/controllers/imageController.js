import dotenv from 'dotenv';
import { S3 } from '../config/s3.js';

dotenv.config({ path: '.env' });

export let imageController = {};

imageController.getSingleImage = async (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: req.params.imageId,
  };

  S3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ errors: [{ msg: 'Error retrieving file' }] });
    }
    res.write(data.Body, 'binary');
    res.end(null, 'binary');
  });
};
