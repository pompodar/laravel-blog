import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

function Posts() {
    const [data, setData] = useState([]);
    const [comments, setComments] = useState({}); // Use an object to store comments by comment ID
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
                setComments((prevComments) => ({
                    ...prevComments,
                    [newComment.id]: '', // Initialize the new comment with an empty string
                }));
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

                setReplyToCommentId(null);
            })
            .catch((error) => console.error('Error submitting comment:', error));
    };

    const handleReplyClick = (commentId) => {
        setReplyToCommentId(commentId);
    };

    const Comment = ({ post, parent, handleReplyClick, commentId, commentInputRef, replyToCommentId, level }) => {
        let postId = post;
        let postIdId = post.id;

        return (
            <div key={post.id} style={{ marginLeft: 20 * level }}>
                {post.comments &&
                    post.comments
                        .filter((reply) => reply.parent_comment_id === parent)
                        .map((reply) => (
                            <div key={reply.id}>
                                <p>{reply.content}</p>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleCommentSubmit(postIdId, reply.id, comments[reply.id]);
                                    }}
                                >
                                    <label htmlFor={`comment-${reply.id}`}>
                                        <input
                                            type="text"
                                            name={`comment-${reply.id}`}
                                            ref={commentInputRef}
                                            onChange={(e) => setComments({ ...comments, [reply.id]: e.target.value })}
                                            value={comments[reply.id]}
                                        />
                                    </label>
                                    <button type="submit">Submit Comment</button>
                                </form>
                                <Comment
                                    key={reply.id}
                                    parent={reply.id}
                                    post={postId}
                                    handleReplyClick={handleReplyClick}
                                    commentId={reply.id}
                                    commentInputRef={commentInputRef}
                                    replyToCommentId={replyToCommentId}
                                    level={level + 1}
                                    style={{
                                        marginLeft: 100,
                                        backgroundColor: "red"
                                    }}
                                />
                            </div>
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
                            commentId={null}
                            commentInputRef={commentInputRef}
                            replyToCommentId={replyToCommentId}
                            level={0} // Initialize comment level as 0
                        />
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCommentSubmit(post.id, null, comments[null]);
                            }}
                        >
                            <label htmlFor={`comment-${null}`}>
                                <input
                                    type="text"
                                    name={`comment-${null}`}
                                    ref={commentInputRef}
                                    onChange={(e) => setComments({ ...comments, [null]: e.target.value })}
                                    value={comments[null]}
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
