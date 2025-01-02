"use client"
import { useEffect, useRef } from 'react';

const SVGComponent = ({ url, className }) => {
    const containerRef = useRef();

    useEffect(() => {
        fetch(url)
            .then(response => response.text())
            .then(text => {
         
                const cleanSvg = text
                    .replace(/<\?xml.*?\?>/, '')
                    .replace(/<!--.*?-->/, '')
                    .trim();
                
                if (containerRef.current) {
                    containerRef.current.innerHTML = cleanSvg;
                }

                // Находим SVG элемент и добавляем классы
                const svgElement = containerRef.current.querySelector('svg');
                if (svgElement && className) {
                    svgElement.setAttribute('class', className);
                  
                    svgElement.style.width = '100%';
                    svgElement.style.height = '100%';
                }
            });
    }, [url, className]);

    return <div ref={containerRef} className={className} />;
};

export default SVGComponent;