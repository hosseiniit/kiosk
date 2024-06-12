import Lottie from "react-lottie-player";
import json from "./loading.json";
import "./loadingpage.css";

const LoadingPage = ({ isOpen = false }) => {
  return (
    <>
      {isOpen && (
        <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", background: "#fff", zIndex: "9999" }}>
          <svg
            className="spinner"
            id="evhkDbM1JZa1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1080 1920"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
          >
            <g id="evhkDbM1JZa2">
              <path
                d="M490.41,846.39v0l20.31-48.16c13.38-31.72,44.45-52.34,78.87-52.34v0l-20.31,48.16c-13.37,31.71-44.44,52.34-78.87,52.34Z"
                opacity="0.25"
                fill="var(--min-color)"
              />
              <path
                d="M490.41,1174.11v0l20.31-48.16c13.38-31.72,44.45-52.34,78.87-52.34v0l-20.31,48.16c-13.37,31.72-44.44,52.34-78.87,52.34Z"
                opacity="0.65"
                fill="var(--min-color)"
              />
              <path
                d="M653.61,910.41v0l48.16,20.31c31.72,13.37,52.34,44.45,52.34,78.87v0l-48.16-20.31c-31.72-13.37-52.34-44.45-52.34-78.87Z"
                opacity="0.85"
                fill="var(--min-color)"
              />
              <path
                d="M325.89,910.41v0l48.16,20.31c31.72,13.37,52.34,44.45,52.34,78.87v0l-48.16-20.31c-31.72-13.37-52.34-44.45-52.34-78.87Z"
                opacity="0.45"
                fill="var(--min-color)"
              />
              <path
                d="M585.27,844.6v0l48.41-19.69c31.89-12.97,68.44-5.58,92.78,18.76v0l-48.41,19.69c-31.88,12.97-68.44,5.58-92.78-18.76Z"
                fill="var(--min-color)"
              />
              <path
                d="M353.54,1076.33v0l48.41-19.69c31.89-12.97,68.44-5.58,92.78,18.76v0l-48.41,19.69c-31.89,12.98-68.44,5.59-92.78-18.76Z"
                opacity="0.55"
                fill="var(--min-color)"
              />
              <path
                d="M655.4,1005.27v0l19.69,48.41c12.97,31.89,5.58,68.44-18.76,92.78v0l-19.69-48.41c-12.97-31.88-5.58-68.44,18.76-92.78Z"
                opacity="0.75"
                fill="var(--min-color)"
              />
              <path
                d="M423.67,773.53v0l19.69,48.41c12.97,31.89,5.58,68.44-18.76,92.78v0l-19.69-48.41c-12.98-31.88-5.59-68.43,18.76-92.78Z"
                opacity="0.35"
                fill="var(--min-color)"
              />
            </g>
          </svg>
        </div>
      )}
    </>
  );
};

export default LoadingPage;
