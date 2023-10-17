import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Comment from './Comment';
import PostForm from './PostForm';

function Posts() {
    const [data, setData] = useState([]); // State for storing the post data
    const [comments, setComments] = useState({}); // State for comments
    const [replyToCommentId, setReplyToCommentId] = useState(null); // State for tracking replies
    const [hiddenComments, setHiddenComments] = useState({}); // State for hiding/showing comments
    const [currentPage, setCurrentPage] = useState(1); // State for pagination
    const [totalPages, setTotalPages] = useState(1); // Total number of pages

    // Function to fetch data for a specific page
    const fetchData = (page) => {
        fetch(`/posts?page=${page}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((responseData) => {
                setData(responseData.data); // Set the post data
                setTotalPages(responseData.last_page); // Set the total number of pages
                
                // Initialize hiddenComments with true for each post
                const initialHiddenComments = {};
                responseData.data.forEach((post) => {
                    initialHiddenComments[post.id] = true;
                });
                setHiddenComments(initialHiddenComments);
            })
            .catch((error) => console.error('Error fetching data:', error));
    };

    // Effect to fetch data when the currentPage changes
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    // Function to handle changing the page
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Function to handle input changes in the comment form
    const handleInputChange = (commentId, value) => {
        setComments((prevComments) => ({
            ...prevComments,
            [commentId]: value,
        }));
    };

    // Function to handle clicking the "Reply" button
    const handleReplyClick = (commentId) => {
        setReplyToCommentId(commentId);
    };

    // Function to toggle comment visibility
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

                setHiddenComments((prevHiddenComments) => ({
                    ...prevHiddenComments,
                    [postId]: !prevHiddenComments[postId],
                }));

                console.log(comments);

                // Fetch the updated posts data, which now includes the new comment
                fetchData(currentPage);

                setReplyToCommentId(null);
            })
            .catch((error) => console.error('Error submitting comment:', error));
    };

    // Render posts and comments
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
                            {hiddenComments[post.id] ? "Show comments" : "Hide comments"}
                        </button>
                        {/* Render comments here */}
                        {/* You may need to define the "Comment" component for this part */}
                        {!hiddenComments[post.id] && (
                            <Comment
                                post={post}
                                fetchData={fetchData}
                                parent={null}
                                handleCommentSubmit={handleCommentSubmit} // You need to define this function
                                comments={comments}
                                setComments={setComments}
                                handleReplyClick={handleReplyClick}
                                commentId={null}
                                replyToCommentId={replyToCommentId}
                                level={0}
                            />
                        )}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCommentSubmit(post.id, null, comments[post.id]); // You need to define this function
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

            {/* Pagination controls */}
            <div>
                <button onClick={() => handlePageChange(currentPage - 1)}>Previous Page</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)}>Next Page</button>
            </div>
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
