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

sqlDB.insertComment = (postId, text, creatorId, parentId, creatorName) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT into comments (postId, text, creatorId, creatorName ) VALUES (?,?,?, ?)`,
      [postId, text, creatorId, creatorName],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        db.query(
          `INSERT into comments_tree (parentId, childId) SELECT parentId, ? from comments_tree where childId = ? UNION select all ?,?`,
          [result.insertId, parentId, result.insertId, result.insertId],
          (error, result2) => {
            if (error) return reject(err);
            if (parentId == null) {
              db.query(
                `INSERT into comment_votes (commentId, userId) VALUES (?,?)`,
                [result.insertId, creatorId],
                (err, result3) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(result3);
                }
              );
            } else {
              return resolve(result2);
            }
          }
        );
      }
    );
  });
};

sqlDB.getRootCommentIds = (communityID) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT c.id
      FROM comments c
      inner JOIN comment_votes cv ON cv.commentId=c.id
      inner join posts p on p.id = c.postId
      WHERE p.communityId = ?`,
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

sqlDB.getAllComments = (parentId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT c.id, c.postId, c.text, c.date, c.creatorId, c.creatorName from comments c
      JOIN comments_tree t ON (c.id=t.childId)
      WHERE t.parentId = ?`,
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

sqlDB.getSequences = (parentId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT c.id, c.postId,GROUP_CONCAT(crumbs.parentId) AS seq
      FROM comments AS c
      JOIN comments_tree AS p ON c.id = p.childId
      JOIN comments_tree AS crumbs ON crumbs.childId = p.childId
      WHERE p.parentId = ?
      GROUP BY c.id
      ORDER BY seq`,
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

sqlDB.getAllPosts = (communityID) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM posts where communityId= ? `,
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
