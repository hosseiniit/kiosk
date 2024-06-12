import Lottie from "react-lottie-player";
import json from "./payloading.json";
const LoadingPayment = ({ isOpen = false }) => {
  return (
    <>
      {isOpen && (
        <Lottie
          loop
          animationData={json}
          play
          speed="1"
          style={{ background: "#fafafa", width: "100%", height: "100%", position: "fixed", top: 0, left: 0, zIndex: 999 }}
        />
      )}
    </>
  );
};

export default LoadingPayment;
