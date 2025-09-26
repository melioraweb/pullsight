import { Loader } from "lucide-react";

const PageLoader = () => {
    return (
        <div className="h-full flex items-center justify-center">
            <Loader className="animate-spin" />
        </div>
    );
};

export default PageLoader;
