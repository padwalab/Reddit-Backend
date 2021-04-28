import db from './connection.js';

export let sqlDB = {};

sqlDB.deletePosts = (communityID) => {
  return new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM posts WHERE communityId=?`,
      [communityID],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};
