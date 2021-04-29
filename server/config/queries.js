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

sqlDB.getChildCommentIDs = (parentId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT childId from comments_tree where parentId = ?`,
      [parentId],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

sqlDB.deleteSubComments = (id_list) => {
  return new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM comments WHERE id IN (?)`,
      [id_list],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};
