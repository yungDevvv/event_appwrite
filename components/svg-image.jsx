import { useEffect, useRef } from 'react';

const SVGComponent = ({ url, className, type }) => {
    const containerRef = useRef();

    useEffect(() => {
        if (!url) return;

        if (type === 'email') {
            if (containerRef.current) {
                containerRef.current.innerHTML = ''; 
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'SVG for email';
                img.style.width = '100%';
                img.style.height = '100%';
                containerRef.current.appendChild(img);
            }
            return;
        }

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Не удалось загрузить SVG: ${response.statusText}`);
                return response.text();
            })
            .then(text => {
                console.log('SVG content:', text); 
                const cleanSvg = text
                    .replace(/<\?xml.*?\?>/, '') 
                    .replace(/<!--.*?-->/g, '') 
                    .trim();

                if (containerRef.current) {
                    containerRef.current.innerHTML = cleanSvg; 
                    console.log('Inserted HTML:', containerRef.current.innerHTML); 

                    const svgElement = containerRef.current.querySelector('svg');
                    if (svgElement && className) {
                        svgElement.setAttribute('class', className);
                        svgElement.style.width = '100%';
                        svgElement.style.height = '100%';
                    }
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки SVG:', error);
                if (containerRef.current) {
                    containerRef.current.innerHTML = '<p>Ошибка загрузки SVG</p>';
                }
            });
    }, [url, className, type]);

    return <div ref={containerRef} className={className} />;
};

export default SVGComponent;
