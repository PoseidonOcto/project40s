import React, { useState, useEffect, ReactElement } from "react";


export const getFaviconOfWebsite = (url: string): string => {
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`
}

const FaviconDisplay = ( {url}: {url: string} ) => {
    const [image, setImage] = useState<ReactElement | undefined>(undefined);

    useEffect(() => {
        setImage(React.createElement("img", {
            src: getFaviconOfWebsite(url),
            onError: ({ currentTarget }: any) => {
                currentTarget.onerror = null; // prevents looping
                // currentTarget.src="image_path_here";
                console.log(currentTarget);
                console.log("foo");
                displayDefaultImage();
            },
        }));
    }, []);

    const displayDefaultImage = () => {
        setImage(React.createElement("img", {src: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://edition.cnn.com/&size=64"}));
    }

    return (
        <>
            {image === undefined && <div className="loadingIcon"></div>}
            {image !== undefined && image}
        </>
    );
};


            // <img src={getFaviconOfWebsite(url)} 
            //     onError={({ currentTarget }) => {
            //         currentTarget.onerror = null; // prevents looping
            //         // currentTarget.src="image_path_here";
            //     }}
            // />
export default FaviconDisplay;
