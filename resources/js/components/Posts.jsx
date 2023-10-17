import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import Comment from './Comment';

function PostForm({ onPostCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        const requestBody = {
            title: title,
            content: content,
        };

        console.log(requestBody);

        fetch(`/posts/new-post`, {
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
            .then((newPost) => {
                onPostCreated(newPost); // Notify the parent component that a new post was created
                setTitle('');
                setContent('');
            })
            .catch((error) => console.error('Error creating a new post:', error));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title:</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
                <label>Content:</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <button type="submit">Create Post</button>
        </form>
    );
}

function Posts() {
    const [data, setData] = useState([]);
    const [comments, setComments] = useState({});
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [hiddenComments, setHiddenComments] = useState({});

    const fetchData = () => {
        fetch('/posts')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setData(data);

                // Initialize hiddenComments with true for each post
                const initialHiddenComments = {};
                data.forEach((post) => {
                    initialHiddenComments[post.id] = true;
                });
                setHiddenComments(initialHiddenComments);
            })
            .catch((error) => console.error('Error fetching data:', error));
    };

    useEffect(() => {
        fetchData();
    }, []);

    
    const handleInputChange = (commentId, value) => {
        setComments((prevComments) => ({
            ...prevComments,
            [commentId]: value,
        }));
    };

    const handleReplyClick = (commentId) => {
        setReplyToCommentId(commentId);
    };

    const toggleCommentVisibility = (postId) => {
        setHiddenComments((prevHiddenComments) => ({
            ...prevHiddenComments,
            [postId]: !prevHiddenComments[postId],
        }));
    };

    const handleCommentSubmit = (postId, parentCommentId, reply) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        const requestBody = {
            content: reply,
            parent_comment_id: parentCommentId,
        };

        console.log(requestBody);

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
                console.log(parentCommentId, newComment.id);
                if (parentCommentId == null) {
                    setComments((prevComments) => ({
                        ...prevComments,
                        [postId]: '',
                    }));
                } else {
                    setComments((prevComments) => ({
                        ...prevComments,
                        [parentCommentId]: '',
                    }));
                }

                console.log(comments);

                // Fetch the updated posts data, which now includes the new comment
                fetchData();

                setReplyToCommentId(null);
            })
            .catch((error) => console.error('Error submitting comment:', error));
    };
    
    return (
        <div>
            <h1>Create a New Post:</h1>
            <PostForm onPostCreated={(newPost) => setData([...data, newPost])} />
            <h1>Posts:</h1>
            {data.map(function (post) {
                return (
                    <div key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        <ul>
                            {post.authors && post.authors.map(function (author) {
                                return <h3 key={author.id}>Author: {author.name}</h3>;
                            })}
                        </ul>
                        <button
                            onClick={() => toggleCommentVisibility(post.id)}
                        >
                            {!hiddenComments ? "Hide comments" : "Show comments"}
                        </button>
                        {!hiddenComments[post.id] &&
                            <Comment
                                post={post}
                                fetchData={fetchData}
                                parent={null}
                                handleCommentSubmit={handleCommentSubmit}
                                comments={comments}
                                setComments={setComments}
                                handleReplyClick={handleReplyClick}
                                commentId={null}
                                replyToCommentId={replyToCommentId}
                                level={0}
                            />
                        }
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCommentSubmit(post.id, null, comments[post.id]);
                            }}
                        >
                            <label htmlFor={`comment-${post.id}`}>
                                <input
                                    type="text"
                                    name={`comment-${post.id}`}
                                    onChange={(e) => handleInputChange(post.id, e.target.value)}
                                    value={comments[post.id]}
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

if (document.getElementById('app')) {
    const Index = ReactDOM.createRoot(document.getElementById('app'));

    Index.render(
        <React.StrictMode>
            <Posts />
        </React.StrictMode>
    );
}
