const AWS = require('aws-sdk');

/**
 * Copy from: https://github.com/strapi/strapi/issues/5868#issuecomment-618250024
 */

module.exports = {
  init(providerOptions) {
    const s3 = new AWS.S3({
      accessKeyId: providerOptions.accessKeyId,
      secretAccessKey: providerOptions.secretAccessKey,
      region: providerOptions.region,
    });
    const Bucket = providerOptions.params.bucket;
    const folder = providerOptions.params.folder;
    const cdnUrl = providerOptions.params.cdnUrl;

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          const Key = `${folder}/${file.hash}${file.ext}`;

          s3.upload(
            {
              Key,
              Body: Buffer.from(file.buffer, 'binary'),
              // ACL: 'public-read', // don't use this
              ContentType: file.mime,
              Bucket,
              ...customParams,
            },
            (err, _data) => {
              if (err) return reject(err);
              // set the file url to the CDN instead of the bucket itself
              file.url = `https://${cdnUrl}/${Key}`;
              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          const Key = `${folder}/${file.hash}${file.ext}`;

          s3.deleteObject(
            {
              Key,
              Bucket,
              ...customParams,
            },
            (err, _data) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      },
    };
  },
};