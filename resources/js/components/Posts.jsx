import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

function Posts() {
    const [data, setData] = useState([]);
    const [comment, setComment] = useState('');
    const commentInputRef = useRef(null);
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        // Fetch data when the component mounts
        fetch('/posts')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setData(data);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const handleCommentSubmit = (postId, reply) => {
        // Get the CSRF token from the meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        const requestBody = {
            content: reply,
            parent_comment_id: replyToCommentId,
        };

        console.log(requestBody);

        // Send the comment to the Laravel backend
        fetch(`/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((newComment) => {
                setData((prevData) => {
                    const newData = prevData.map((post) => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                comments: [...post.comments, newComment],
                            };
                        }
                        return post;
                    });
                    return newData;
                });

                setComment('');
                commentInputRef.current.value = '';
                setReplyToCommentId(null);
            })
            .catch((error) => console.error('Error submitting comment:', error));
    };

    const handleReplyClick = (commentId) => {
        setReplyToCommentId(commentId);
        setIsReplying(true);
    };

    return (
        <div>
            <h1>Posts:</h1>
            {data.map(function (post) {
                return (
                    <div key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <ul>
                            {post.authors.map(function (author) {
                                return (
                                    <h3 key={author.id}>Author: {author.name}</h3>
                                );
                            })}
                        </ul>
                        <div>
                            {post.comments && Array.isArray(post.comments) && post.comments
                                .filter(comment => comment.parent_comment_id == null)
                                .map(function (comment) {
                                let commentId = comment.id;
                                return (
                                    <>
                                        <div key={comment.id}>
                                            <p>{comment.content}</p>
                                        <button onClick={() => handleReplyClick(comment.id)}>Reply</button>
                                        {!isReplying && (
                                            <div>
                                                <input
                                                    type="text"
                                                    ref={commentInputRef}
                                                    onChange={(e) => setComment(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleCommentSubmit(post.id, comment)}
                                                >
                                                    Submit Reply
                                                </button>
                                            </div>
                                        )}
                                        </div>
                                        {post.comments && Array.isArray(post.comments) && post.comments
                                            .filter(comment => commentId === comment.parent_comment_id)
                                            .map(comment => (
                                                <div key={comment.id}>
                                                    <p>{comment.content}</p>
                                                    <button onClick={() => handleReplyClick(comment.id)}>Reply</button>
                                                    <div style={{ backgroundColor: "red" }}>
                                                        <input
                                                            type="text"
                                                            ref={commentInputRef}
                                                            onChange={(e) => setComment(e.target.value)}
                                                        />
                                                        <button onClick={() => handleCommentSubmit(post.id, comment)}>
                                                            Submit Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </>
                                );
                            })}
                                                    </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCommentSubmit(post.id, comment);
                            }}
                        >
                            <label htmlFor="comment">
                                <input
                                    type="text"
                                    name="comment"
                                    ref={commentInputRef}
                                    onChange={(e) => setComment(e.target.value)}
                                    value={comment}
                                />
                            </label>
                            <button type="submit">Submit Comment</button>
                        </form>
                    </div>
                );
            })}
        </div>
    );
}

export default Posts;

if (document.getElementById('app')) {
    const Index = ReactDOM.createRoot(document.getElementById('app'));

    Index.render(
        <React.StrictMode>
            <Posts />
        </React.StrictMode>
    );
}
