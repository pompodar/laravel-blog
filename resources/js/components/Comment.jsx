import React, { useState } from 'react';

export default function Comment ({ handleCommentSubmit, fetchData, post, parent, handleReplyClick, level }) {
    const [comments, setComments] = useState({});
    
    return (
        <div key={post.id} style={{ marginLeft: 20 * level + 6 }}>
                <>
                    {comments && post.comments &&
                        post.comments
                            .filter((reply) => reply.parent_comment_id === parent)
                            .map((reply) => (
                                <div key={reply.id}>
                                    <p>{reply.content}</p>
                                    <p>Author: {reply.author_name}</p> 
                                    <Comment
                                        key={reply.id}
                                        parent={reply.id}
                                        post={post}
                                        handleReplyClick={handleReplyClick}
                                        handleCommentSubmit={handleCommentSubmit}
                                        fetchData={fetchData}
                                        comments={comments}
                                        commentId={reply.id}
                                        level={level + 1}
                                        style={{
                                            marginLeft: 100,
                                            backgroundColor: 'red',
                                        }}
                                    />
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleCommentSubmit(post.id, reply.id, comments[reply.id]);
                                            setComments({ ...comments, [reply.id]: "" })
                                        }}
                                    >
                                        <label htmlFor={`comment-${reply.id}`}>
                                            <input
                                                type="text"
                                                name={`comment-${reply.id}`}
                                                onChange={(e) =>
                                                    setComments({ ...comments, [reply.id]: e.target.value })
                                                }
                                                value={comments[reply.id]}
                                            />
                                        </label>
                                        <button type="submit">Submit Comment</button>
                                    </form>
                                </div>
                            )
                        )
                    }
                </>
        </div>
    );
};