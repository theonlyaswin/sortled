
const CircleImageLabel = ({ src, alt, label }) => {
  return (
    <div className="flex flex-col items-center w-28">
      <div className="relative border-2 hover:border-dashed border-blue-500 w-28 h-28 rounded-full overflow-hidden group cursor-pointer">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover dim transition-all duration-300 group-hover:brightness-75"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white font-bold text-center text-lg">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default CircleImageLabel;

