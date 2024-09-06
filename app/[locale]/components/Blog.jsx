'use client'

import React, { useEffect , useState} from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';


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
        <div className='flex justify-center items-center w-full flex-col'>
          <h2 className="heading-bold text-3xl lg:text-5xl md:text-5xl mb-6 text-blue-600">Blogs</h2>
        <div className='flex gap-4 flex-wrap justify-center'>
        {blogs.map((blog) => (
            <div className="blog-child" style={{flex:"none", padding:"10px", border:"1px solid #CCCCCC", borderRadius:"10px" , width:"80vw" , maxWidth:"350px"}}>
            <img src={blog.image} alt="" style={{borderRadius:"10px", aspectRatio:"3/2", objectFit:"cover"}}/>
            <p style={{marginTop:"10px"}}>{blog.text}</p>
        </div>
        ))}
        </div>
        </div>
    )
}

export default Blog;
