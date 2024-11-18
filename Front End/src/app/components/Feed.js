// components/Post.js

import React from 'react';
import styles from '../styles/Feed.module.css'; // Import the CSS stylesheet

const Post = ({ post }) => {
    return (
        <div className={styles.post}>
            <div className={styles['post-header']}>
                <span>{post.username}</span>
                <span>{post.title}</span>
                <span>{post.time} ago</span>
            </div>
            <img src={post.image} alt={post.title} width={600} height={400} />
            <p>{post.caption}</p>
            <div className={styles.tags}>
                {post.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                ))}
            </div>
        </div>
    );
};

export default Post;
