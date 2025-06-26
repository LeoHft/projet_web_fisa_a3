import React from "react";
import MessagesPC from "../components/MessagesPC";
import MobileMessagesPage from "../components/MobileMessagesPage";

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export default function MessagesPage() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileMessagesPage /> : <MessagesPC />;
}