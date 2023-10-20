import React, { useState } from 'react';

export default function PostForm({ onPostCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('thumbnail', image);

        fetch(`/posts/new-post`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            body: formData, // Use the FormData object as the request body
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
                setImage(null);
            })
            .catch((error) => console.error('Error creating a new post:', error));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
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
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button type="submit">Create Post</button>
        </form>
    );
}
