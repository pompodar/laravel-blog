import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

function Posts() {
    const [data, setData] = useState([]);
    const [comment, setComment] = useState('');
    const commentInputRef = useRef(null);
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [commentLevel, setCommentLevel] = useState(0);

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

    const handleCommentSubmit = (postId, parentCommentId, reply) => {
        // Get the CSRF token from the meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        const requestBody = {
            content: reply,
            parent_comment_id: parentCommentId,
        };

        console.log(postId);

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
    };

    let level = 0;

    const Comment = ({ post, parent, handleReplyClick, handleCommentSubmit, commentInputRef, replyToCommentId, level }) => {
        let postId = post;
        let postIdId = post.id;

        return (
            <div key={post.id}
                style={{
                    marginLeft: 20 * level,
                }}
            >
                {post.comments && 
                    post.comments
                        .filter((reply) => reply.parent_comment_id === parent)
                    .map((reply) => (
                        <>
                            <p>{reply.content}</p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCommentSubmit(postIdId, reply.id, comment);
                                }}
                            >
                                <label
                                    htmlFor="comment">
                                    <input
                                        type="text"
                                        name="comment"
                                        onChange={(e) => setComment(e.target.value)}
                                        value={comment}
                                    />
                                </label>
                                <button type="submit">Submit Comment</button>
                            </form>
                            <Comment
                                key={reply.id}
                                parent={reply.id}
                                post={postId}
                                handleReplyClick={handleReplyClick}
                                handleCommentSubmit={handleCommentSubmit}
                                commentInputRef={commentInputRef}
                                replyToCommentId={replyToCommentId}
                                level={level + 1}
                                style={{
                                    marginLeft: 100,
                                backgroundColor: "red"}}
                            />
                        </>
                        ))}
            </div>
        );
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
                                return <h3 key={author.id}>Author: {author.name}</h3>;
                            })}
                        </ul>
                        <Comment
                            post={post}
                            parent={null}
                            handleReplyClick={handleReplyClick}
                            handleCommentSubmit={handleCommentSubmit}
                            commentInputRef={commentInputRef}
                            replyToCommentId={replyToCommentId}
                            level={0} // Initialize comment level as 0
                        />
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCommentSubmit(post.id, null, comment);
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
