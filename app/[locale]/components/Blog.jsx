'use client'

import React, { useEffect , useState} from 'react';

function Blog(){
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
          try {
            const blogCollection = collection(db, 'blogs');
            const snapshot = await getDocs(blogCollection);
            const blogData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setBlogs(blogData);
          } catch (error) {
            console.error('Error fetching categories: ', error);
          }
        };
    
        fetchBlogs();
      }, []);
    return (
        <>
        {blogs.map((blog) => (
            <div className="blog-child" style={{flex:"none", padding:"10px", border:"1px solid #CCCCCC", borderRadius:"10px" , width:"80vw" , maxWidth:"350px"}}>
            <img src={blog.image} alt="" style={{borderRadius:"10px", aspectRatio:"3/2", objectFit:"cover"}}/>
            <p style={{marginTop:"10px"}}>{blog.text}</p>
        </div>
        ))}
        </>
        
    )
}

export default Blog;