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
      `SELECT DISTINCT(c.id)
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

sqlDB.addPost = (creatorId, communityId, image, text, link, type, title, creatorName) => {
  return new Promise((resolve, reject) => {
    db.query(`INSERT into posts (creatorId, communityId, image, text, link, type, title, creatorName) VALUES (?,?,?,?,?,?,?,?)`, [creatorId, communityId, image, text, link, type, title, creatorName],
    (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    }
    )
  })
}

sqlDB.deletePost = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM posts WHERE id=?`,
      [id],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

sqlDB.addPostVote = (postId, userId, vote) => {
  return new Promise((resolve, reject) => {
    db.query(`INSERT into post_vote (postId, userId, vote ) VALUES (?,?,?)`, [postId, userId, vote],
    (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    }
    )
  })
}

sqlDB.addCommentVote = (commentId, userId, vote, update) => {
  return new Promise((resolve, reject) => {
  if(update === true){
    db.query(`UPDATE comment_votes SET vote = ? where commentId= ? and userId = ?`, [vote, commentId, userId],
    (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    })
  }
  else {
    db.query(`INSERT into comment_votes (commentId, userId, vote ) VALUES (?,?,?)`, [commentId, userId, vote],
    (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    })
  }
})
}

sqlDB.getCommentVoteCount = (commentId, userId) => {
  let voteCount = {};
  return new Promise((resolve, reject) => {
      db.query(`SELECT COUNT(vote) as upvotes from comment_votes where commentId = ? and vote = ?`, [commentId, 1],
      (err, result) => {
        if(err){
          return reject(err);
        }
        voteCount.upvotes = result[0].upvotes;
      db.query(`SELECT COUNT(vote) as downvotes from comment_votes where commentId = ? and vote = ?`, [commentId, 0],
      (err, result2) => {
        if(err){
          return reject(err);
        }
      voteCount.downvotes = result2[0].downvotes;
      db.query(`SELECT COUNT(userId) as user from comment_votes where userId=? and commentId =?`, [userId, commentId],
      (err, result3) => {
        if(result3[0].user) voteCount.user = true;
        else voteCount.user = false;
        return resolve(voteCount);
      })
      })
      })      
  })
}

sqlDB.getPostVoteCount = (postId, userId) => {
  let voteCount = {};
  return new Promise((resolve, reject) => {
      db.query(`SELECT COUNT(vote) as upvotes from post_vote where postId = ? and vote = ?`, [postId, 1],
      (err, result) => {
        if(err){
          return reject(err);
        }
      voteCount.upvotes = result[0].upvotes;
      db.query(`SELECT COUNT(vote) as downvotes from post_vote where postId = ? and vote = ?`, [postId, 0],
      (err, result2) => {
        if(err){
          return reject(err);
        }
        voteCount.downvotes = result2[0].downvotes;
        db.query(`SELECT COUNT(userId) as user from post_vote where userId=? and postId =?`, [userId, postId],
       (err, result3) => {
        if(result3[0].user) voteCount.user = true;
        else voteCount.user = false;
        return resolve(voteCount);
      })
      })
      }) 
    })
  }