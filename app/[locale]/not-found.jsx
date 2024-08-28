const NotFound = () => {
  return (
    <div className=" flex justify-center items-center flex-col my-32">
          <h2 className="heading-bold text-center text-gray-500 text-3xl">Not Found</h2>
          <img src="/notfound.svg" alt="Not-found" className='lg:w-1/3 w-3/3'/>
    </div>
  );  
};

export default NotFound;