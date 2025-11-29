
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { Image, FileCode, Loader2, Layers, Smartphone, MessageCircle, ChevronDown, Grid, Eye, ChevronLeft, ChevronRight, Package, Images, User, Upload, X, Move, Type, Settings2, GripVertical } from 'lucide-react';
import { CardContent, CardStyle, UserInfo, UserInfoPosition } from '../types';
import CardRenderer from './CardRenderer';

interface CardGridProps {
  content: CardContent;
}

type Platform = 'XIAOHONGSHU' | 'WECHAT';

interface ExportTask {
  platform: Platform;
  pages: Array<{
    renderMode: 'cover' | 'slide';
    sectionIndex: number;
    index: number;
    total: number;
  }>;
}

// --- Text Wrapping Helper for SVG ---
const wrapText = (text: string, maxCharsPerLine: number) => {
  const words = text.split('');
  const lines = [];
  let currentLine = '';

  words.forEach((char) => {
    if ((currentLine + char).length > maxCharsPerLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine += char;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
};

// --- Manual SVG Generator ---
// This ensures 100% native SVG elements for editability, bypassing html-to-image for SVG exports.
const generateEditableSvg = (
  content: CardContent, 
  style: CardStyle, 
  renderMode: 'cover' | 'slide', 
  sectionIndex: number, 
  width: number, 
  height: number,
  userInfo: UserInfo
): string => {
  
  // Style Configuration Map
  const styleMap: Record<CardStyle, any> = {
    [CardStyle.MINIMALIST]: { bg: '#ffffff', text: '#111827', accent: '#e5e7eb', font: 'Inter, sans-serif' },
    [CardStyle.MODERN_GRADIENT]: { bg: 'url(#gradient-bg)', text: '#ffffff', accent: 'rgba(255,255,255,0.2)', font: 'Inter, sans-serif' },
    [CardStyle.CYBERPUNK]: { bg: '#09090b', text: '#06b6d4', accent: '#ec4899', font: 'JetBrains Mono, monospace' },
    [CardStyle.NEO_BRUTALISM]: { bg: '#FFDEE9', text: '#000000', accent: '#FEFF9C', font: 'Inter, sans-serif', stroke: 4 },
    [CardStyle.ELEGANT_LUXURY]: { bg: '#0a0a0a', text: '#f0f0f0', accent: '#C5A059', font: 'Playfair Display, serif' },
    [CardStyle.NATURE_ORGANIC]: { bg: '#f5f5f0', text: '#2d342d', accent: '#6b8e6b', font: 'Noto Serif SC, serif' },
    [CardStyle.GLASSMORPHISM]: { bg: 'url(#glass-gradient)', text: '#ffffff', accent: 'rgba(255,255,255,0.1)', font: 'Inter, sans-serif' },
    [CardStyle.NEWSPAPER]: { bg: '#F0EAD6', text: '#111827', accent: '#000000', font: 'Playfair Display, serif' },
  };

  const s = styleMap[style];
  const padding = 60;
  const isCover = renderMode === 'cover';
  const currentSection = !isCover && content.sections[sectionIndex] ? content.sections[sectionIndex] : null;

  // Definitions (Gradients)
  const defs = `
    <defs>
      <linearGradient id="gradient-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c3aed" />
        <stop offset="50%" stop-color="#c026d3" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>
      <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4facfe" />
        <stop offset="100%" stop-color="#00f2fe" />
      </linearGradient>
      <clipPath id="avatar-clip">
        <circle cx="25" cy="25" r="25" />
      </clipPath>
    </defs>
  `;

  // Background
  let bgElement = `<rect width="100%" height="100%" fill="${s.bg}" />`;
  if (style === CardStyle.NEO_BRUTALISM) {
    bgElement = `<rect width="100%" height="100%" fill="${s.bg}" /><rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#000" stroke-width="12" />`;
  }

  // Content Rendering
  let mainContent = '';
  
  if (isCover) {
    // Title
    const titleLines = wrapText(content.title, 12);
    const titleSvg = titleLines.map((line, i) => 
      `<tspan x="${padding}" dy="${i === 0 ? 0 : 70}">${line}</tspan>`
    ).join('');
    
    mainContent += `<text x="${padding}" y="${200}" font-family="${s.font}" font-size="60" font-weight="800" fill="${s.text}">${titleSvg}</text>`;

    // Summary
    const summaryLines = wrapText(content.summary, 18);
    mainContent += `<text x="${padding}" y="${450}" font-family="${s.font}" font-size="28" font-weight="400" fill="${s.text}" opacity="0.9">
      ${summaryLines.map((line, i) => `<tspan x="${padding}" dy="${i === 0 ? 0 : 40}">${line}</tspan>`).join('')}
    </text>`;

    // Key Points
    content.keyPoints.forEach((point, i) => {
       mainContent += `<circle cx="${padding + 10}" cy="${700 + (i * 50)}" r="6" fill="${s.accent}" />`;
       mainContent += `<text x="${padding + 40}" y="${708 + (i * 50)}" font-family="${s.font}" font-size="24" fill="${s.text}">${point}</text>`;
    });
  } else if (currentSection) {
    // Slide Number
    mainContent += `<text x="${width - padding}" y="120" font-family="${s.font}" font-size="100" font-weight="900" fill="${s.text}" opacity="0.1" text-anchor="end">${(sectionIndex + 1).toString().padStart(2, '0')}</text>`;

    // Section Title
    const secTitleLines = wrapText(currentSection.title, 14);
    mainContent += `<text x="${width / 2}" y="250" font-family="${s.font}" font-size="48" font-weight="bold" fill="${s.text}" text-anchor="middle">
      ${secTitleLines.map((line, i) => `<tspan x="${width/2}" dy="${i === 0 ? 0 : 60}">${line}</tspan>`).join('')}
    </text>`;
    
    // Separator
    mainContent += `<line x1="${width/2 - 50}" y1="320" x2="${width/2 + 50}" y2="320" stroke="${s.accent}" stroke-width="4" />`;

    // Content Paragraph
    const lines = wrapText(currentSection.content, 22);
    mainContent += `<text x="${width / 2}" y="400" font-family="${s.font}" font-size="30" fill="${s.text}" text-anchor="middle">
      ${lines.map((line, i) => `<tspan x="${width/2}" dy="${i === 0 ? 0 : 48}">${line}</tspan>`).join('')}
    </text>`;
  }

  // User Info Layer
  let userInfoLayer = '';
  if (userInfo.enabled && userInfo.avatar) {
     const uSize = 50 * userInfo.scale;
     const uFontSize = 20 * userInfo.scale;
     let ux = 0, uy = 0;
     let textAnchor = 'start';
     let textX = 0;

     // Calculate Coords
     const margin = 30;
     if (userInfo.position === 'custom') {
        ux = width * (userInfo.customPos.x / 100);
        uy = height * (userInfo.customPos.y / 100);
        // HTML renderer puts top-left at customPos%. Let's match that.
        textX = ux + uSize + 15;
     } else {
        if (userInfo.position === 'top-left') { ux = margin; uy = margin; textX = ux + uSize + 15; }
        if (userInfo.position === 'top-right') { ux = width - margin - uSize; uy = margin; textAnchor = 'end'; textX = ux - 15; }
        if (userInfo.position === 'bottom-left') { ux = margin; uy = height - margin - uSize; textX = ux + uSize + 15; }
        if (userInfo.position === 'bottom-right') { ux = width - margin - uSize; uy = height - margin - uSize; textAnchor = 'end'; textX = ux - 15; }
     }

     // Determine text color for user info
     const isDarkBg = [CardStyle.CYBERPUNK, CardStyle.ELEGANT_LUXURY, CardStyle.MODERN_GRADIENT, CardStyle.GLASSMORPHISM].includes(style);
     const uTextColor = isDarkBg ? '#ffffff' : '#333333';
     const uStroke = isDarkBg ? `stroke="rgba(0,0,0,0.5)" stroke-width="0.5"` : '';

     userInfoLayer = `
       <g id="layer-user-info" opacity="${userInfo.opacity}">
          <defs>
             <clipPath id="u-clip-${sectionIndex}">
                <circle cx="${ux + uSize/2}" cy="${uy + uSize/2}" r="${uSize/2}" />
             </clipPath>
          </defs>
          <circle cx="${ux + uSize/2}" cy="${uy + uSize/2}" r="${uSize/2}" fill="#ddd" stroke="#fff" stroke-width="2" />
          <image href="${userInfo.avatar}" x="${ux}" y="${uy}" width="${uSize}" height="${uSize}" clip-path="url(#u-clip-${sectionIndex})" preserveAspectRatio="xMidYMid slice" />
          <text x="${textX}" y="${uy + uSize/2 + uFontSize/3}" font-family="${s.font}" font-size="${uFontSize}" font-weight="bold" fill="${uTextColor}" text-anchor="${textAnchor}" ${uStroke}>
             ${userInfo.nickname}
          </text>
       </g>
     `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${defs}
  <g id="layer-background">${bgElement}</g>
  <g id="layer-content">${mainContent}</g>
  ${userInfoLayer}
</svg>`;
};


// --- Sub-Components ---

const SlidePreview: React.FC<{ content: CardContent; style: CardStyle; styleName: string; userInfo: UserInfo }> = ({ content, style, userInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 1 + content.sections.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const exportWidth = 750;
  const exportHeight = 1000;
  const displayWidth = 280;
  const scale = displayWidth / exportWidth;
  const displayHeight = exportHeight * scale;
  const isCover = currentIndex === 0;
  
  return (
    <div className="w-full flex flex-col items-center pb-4 pt-2 bg-gray-50/50 rounded-lg select-none">
       <div 
         className="relative shadow-sm rounded-lg overflow-hidden bg-white group transition-all duration-300 ease-in-out"
         style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
       >
          <div style={{ width: `${exportWidth}px`, height: `${exportHeight}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
             <CardRenderer 
                content={content} 
                style={style} 
                renderMode={isCover ? 'cover' : 'slide'} 
                sectionIndex={isCover ? -1 : currentIndex - 1}
                fixedAspectRatioClass="w-full h-full"
                footerNote={`${currentIndex + 1}/${totalSlides}`}
                userInfo={userInfo}
             />
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
             <button onClick={handlePrev} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm shadow-lg"><ChevronLeft size={20} /></button>
             <button onClick={handleNext} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm shadow-lg"><ChevronRight size={20} /></button>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-md pointer-events-none z-50">
             {currentIndex + 1} / {totalSlides}
          </div>
       </div>
       <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4 no-scrollbar h-4 items-center justify-center">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)} className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 h-1.5 bg-indigo-600' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`} />
          ))}
       </div>
    </div>
  );
};

const PositionEditor: React.FC<{ 
  userInfo: UserInfo; 
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>; 
  content: CardContent 
}> = ({ userInfo, setUserInfo, content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate position relative to container
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Convert to percentage
    let xPercent = (x / rect.width) * 100;
    let yPercent = (y / rect.height) * 100;

    // Clamp values (keep inside)
    xPercent = Math.max(2, Math.min(90, xPercent));
    yPercent = Math.max(2, Math.min(90, yPercent));

    setUserInfo(prev => ({
      ...prev,
      customPos: { x: xPercent, y: yPercent }
    }));
  }, [setUserInfo]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
       <div className="text-xs text-indigo-600 font-bold flex justify-between">
          <span>拖拽头像调整位置</span>
          <span>X: {Math.round(userInfo.customPos.x)}%, Y: {Math.round(userInfo.customPos.y)}%</span>
       </div>
       <div 
         ref={containerRef}
         className="relative w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-indigo-200 cursor-crosshair group"
       >
          {/* Static Background Preview (Minimalist Style) */}
          <div className="absolute inset-0 pointer-events-none opacity-50 scale-[0.35] origin-top-left w-[285%] h-[285%]">
             <CardRenderer 
               content={content} 
               style={CardStyle.MINIMALIST} 
               renderMode="cover" 
               // Disable internal user info to prevent double rendering
               userInfo={{...userInfo, enabled: false}} 
             />
          </div>
          
          {/* Draggable Overlay */}
          <div 
             className={`absolute flex items-center gap-2 p-1 rounded border-2 z-50 transition-transform duration-75 select-none ${isDragging ? 'border-indigo-500 bg-white/80 scale-110 shadow-xl cursor-grabbing' : 'border-indigo-500/0 hover:border-indigo-500/50 cursor-grab bg-white/40 backdrop-blur-sm'}`}
             style={{ 
               left: `${userInfo.customPos.x}%`, 
               top: `${userInfo.customPos.y}%`,
               transform: 'translate(0, 0)' // Origin handled by left/top
             }}
             onMouseDown={handleMouseDown}
             onTouchStart={handleTouchStart}
          >
             {userInfo.avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm">
                   <img src={userInfo.avatar} className="w-full h-full object-cover" />
                </div>
             ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><User size={16} /></div>
             )}
             <span className="text-[10px] font-bold text-gray-800 whitespace-nowrap">{userInfo.nickname}</span>
             
             {isDragging && (
                <>
                   {/* Guides */}
                   <div className="fixed top-0 left-[-1000px] right-[-1000px] h-px bg-indigo-500 border-t border-dashed opacity-50 pointer-events-none"></div>
                   <div className="fixed top-[-1000px] bottom-[-1000px] left-0 w-px bg-indigo-500 border-l border-dashed opacity-50 pointer-events-none"></div>
                </>
             )}
          </div>
       </div>
    </div>
  );
};

const CardWrapper: React.FC<{ content: CardContent; style: CardStyle; styleName: string; userInfo: UserInfo }> = ({ content, style, styleName, userInfo }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const hiddenExportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'total' | 'slides'>('total');
  
  const [exportState, setExportState] = useState<{ isActive: boolean; platform: Platform; pageConfig: ExportTask['pages'][0] | null; }>({ isActive: false, platform: 'XIAOHONGSHU', pageConfig: null });

  const handleDownloadSingle = async (format: 'png' | 'svg') => {
    if (viewMode === 'slides') {
       if (!confirm("即将下载长图，是否继续？")) return;
       setViewMode('total');
       await new Promise(r => setTimeout(r, 200));
    }

    if (!cardRef.current) return;
    setIsDownloading(format);
    
    try {
      const timestamp = new Date().getTime();
      const fileName = `magic-card-${style.toLowerCase()}-${timestamp}.${format}`;
      const node = cardRef.current;

      let dataUrl = '';
      if (format === 'svg') {
         // Use manual generator for single SVG
         const svgString = generateEditableSvg(content, style, 'cover', 0, 750, 1000, userInfo);
         const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
         dataUrl = URL.createObjectURL(blob);
      } else {
        dataUrl = await toPng(node, { quality: 1.0, pixelRatio: 2 });
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      if (format === 'svg') URL.revokeObjectURL(dataUrl);

    } catch (err) {
      console.error('Export failed', err);
      alert('生成失败，请重试。');
    } finally {
      setIsDownloading(null);
    }
  };

  const calculatePages = (platform: Platform): ExportTask => {
    const pages: ExportTask['pages'] = [];
    const totalSections = content.sections ? content.sections.length : 0;
    pages.push({ renderMode: 'cover', sectionIndex: -1, index: 1, total: 1 });
    if (totalSections > 0) {
      for (let i = 0; i < totalSections; i++) {
        pages.push({ renderMode: 'slide', sectionIndex: i, index: pages.length + 1, total: 1 });
      }
    }
    const total = pages.length;
    pages.forEach(p => p.total = total);
    return { platform, pages };
  };

  const handleDownloadSeries = async (platform: Platform, method: 'zip' | 'individual', format: 'png' | 'svg') => {
    setShowMenu(false);
    setIsDownloading('series');
    
    const task = calculatePages(platform);
    const width = platform === 'XIAOHONGSHU' ? 750 : 640;
    const height = platform === 'XIAOHONGSHU' ? 1000 : 960;

    let zip: JSZip | null = null;
    let imgFolder: JSZip | null = null;
    if (method === 'zip') {
      zip = new JSZip();
      imgFolder = zip.folder(`magic-cards-${style.toLowerCase()}`);
    }

    try {
      for (const page of task.pages) {
        let fileContent: string | Blob = '';
        const ext = format;

        if (format === 'svg') {
           // Use the Native SVG Generator
           const svgString = generateEditableSvg(content, style, page.renderMode, page.sectionIndex, width, height, userInfo);
           fileContent = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        } else {
           // Use HTML-to-Image for PNG
           setExportState({ isActive: true, platform, pageConfig: page });
           await new Promise(resolve => setTimeout(resolve, 250)); // Wait for render
           if (hiddenExportRef.current) {
             const node = hiddenExportRef.current.firstElementChild as HTMLElement;
             if (node) {
                const dataUrl = await toPng(node, { width, height, pixelRatio: 2 });
                fileContent = dataUrl;
             }
           }
        }

        // Handle Download
        if (method === 'individual') {
           const link = document.createElement('a');
           link.download = `card-${style.toLowerCase()}-${page.index}.${ext}`;
           
           if (fileContent instanceof Blob) {
              const url = URL.createObjectURL(fileContent);
              link.href = url;
              link.click();
              await new Promise(r => setTimeout(() => { URL.revokeObjectURL(url); r(true); }, 200));
           } else {
              link.href = fileContent as string;
              link.click();
              await new Promise(r => setTimeout(r, 200));
           }
        } else if (method === 'zip' && imgFolder) {
           if (fileContent instanceof Blob) {
              imgFolder.file(`card-${page.index.toString().padStart(2, '0')}.svg`, fileContent);
           } else {
              imgFolder.file(`card-${page.index.toString().padStart(2, '0')}.png`, (fileContent as string).split(',')[1], {base64: true});
           }
        }
      }

      if (method === 'zip' && zip) {
        const content = await zip.generateAsync({type: "blob"});
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.download = `magic-cards-${style.toLowerCase()}-${format}-pack.zip`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("Series export failed", err);
      alert("批量生成失败");
    } finally {
      setIsDownloading(null);
      setExportState(prev => ({ ...prev, isActive: false }));
    }
  };

  return (
    <div className="flex flex-col gap-3 group relative">
      <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden pointer-events-none z-0" ref={hiddenExportRef}>
        {exportState.isActive && exportState.pageConfig && (
          <div style={{ width: exportState.platform === 'XIAOHONGSHU' ? '750px' : '640px', height: exportState.platform === 'XIAOHONGSHU' ? '1000px' : '960px' }}>
            <CardRenderer content={content} style={style} renderMode={exportState.pageConfig.renderMode} sectionIndex={exportState.pageConfig.sectionIndex} footerNote={`${exportState.pageConfig.index}/${exportState.pageConfig.total}`} fixedAspectRatioClass="w-full h-full" userInfo={userInfo} />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-mono text-gray-400 group-hover:text-gray-800 transition-colors">{styleName}</span>
        <button onClick={() => setViewMode(prev => prev === 'total' ? 'slides' : 'total')} className="text-xs font-medium text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
           {viewMode === 'total' ? <Eye size={14} /> : <Grid size={14} />} {viewMode === 'total' ? '预览多图' : '预览长图'}
        </button>
      </div>
      
      <div className="relative shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg bg-white border border-gray-100">
        {viewMode === 'total' ? (
           <div ref={cardRef} className="w-full bg-white overflow-hidden rounded-lg">
             <CardRenderer content={content} style={style} renderMode="total" userInfo={userInfo} />
           </div>
        ) : (
           <div className="w-full bg-white rounded-lg p-1">
             <SlidePreview content={content} style={style} styleName={styleName} userInfo={userInfo} />
           </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button onClick={() => handleDownloadSingle('png')} disabled={!!isDownloading} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50">
          {isDownloading === 'png' ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />} 长图
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} disabled={!!isDownloading} className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium border rounded-lg transition-all disabled:opacity-50 ${showMenu ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
             {isDownloading === 'series' ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />} <ChevronDown size={12} />
          </button>
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
               <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-600"><Smartphone size={14} /> 小红书 (3:4)</div>
               <div className="p-2 space-y-2 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'zip', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium"><Package size={12} /> PNG包</button>
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'individual', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><Images size={12} /> PNG逐张</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'zip', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG包</button>
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'individual', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG逐张</button>
                  </div>
               </div>
               <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-600"><MessageCircle size={14} /> 公众号 (2:3)</div>
               <div className="p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('WECHAT', 'zip', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium"><Package size={12} /> PNG包</button>
                    <button onClick={() => handleDownloadSeries('WECHAT', 'individual', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><Images size={12} /> PNG逐张</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('WECHAT', 'zip', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG包</button>
                    <button onClick={() => handleDownloadSeries('WECHAT', 'individual', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG逐张</button>
                  </div>
               </div>
            </div>
          )}
          {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>}
        </div>
      </div>
    </div>
  );
};

const CardGrid: React.FC<CardGridProps> = ({ content }) => {
  const styles = [
    { id: CardStyle.MINIMALIST, name: "极简白 (Minimalist)" },
    { id: CardStyle.MODERN_GRADIENT, name: "现代渐变 (Gradient)" },
    { id: CardStyle.CYBERPUNK, name: "赛博朋克 (Cyberpunk)" },
    { id: CardStyle.NEO_BRUTALISM, name: "新丑主义 (Neo-Brutalism)" },
    { id: CardStyle.ELEGANT_LUXURY, name: "奢华暗金 (Luxury)" },
    { id: CardStyle.NATURE_ORGANIC, name: "自然森系 (Organic)" },
    { id: CardStyle.GLASSMORPHISM, name: "磨砂玻璃 (Glass)" },
    { id: CardStyle.NEWSPAPER, name: "复古报纸 (Newspaper)" },
  ];

  // User Info State
  const [userInfo, setUserInfo] = useState<UserInfo>({
    enabled: false,
    avatar: null,
    nickname: 'User Name',
    position: 'bottom-left',
    customPos: { x: 10, y: 85 }, // Default custom position
    scale: 1,
    opacity: 0.9
  });
  const [showUserPanel, setShowUserPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      {/* User Info Control Panel */}
      <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><User size={20} /></div>
               <span className="font-bold text-gray-800">个人身份标识</span>
               <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">SVG Editable</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={userInfo.enabled} onChange={e => setUserInfo(p => ({ ...p, enabled: e.target.checked }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
         </div>

         {userInfo.enabled && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-500 cursor-pointer flex items-center justify-center overflow-hidden group transition-colors"
                    >
                       {userInfo.avatar ? <img src={userInfo.avatar} className="w-full h-full object-cover" /> : <Upload size={20} className="text-gray-400 group-hover:text-indigo-500" />}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/png, image/jpeg" />
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 mb-1 block">昵称</label>
                       <input 
                         type="text" 
                         value={userInfo.nickname} 
                         onChange={e => setUserInfo(p => ({ ...p, nickname: e.target.value.slice(0, 12) }))}
                         className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                         placeholder="输入昵称"
                       />
                    </div>
                 </div>

                 {userInfo.position === 'custom' && (
                    <PositionEditor userInfo={userInfo} setUserInfo={setUserInfo} content={content} />
                 )}
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center gap-1"><Move size={12} /> 位置布局</label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as UserInfoPosition[]).map(pos => (
                          <button 
                            key={pos}
                            onClick={() => setUserInfo(p => ({ ...p, position: pos }))}
                            className={`px-3 py-2 text-xs rounded border transition-all ${userInfo.position === pos ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                             {pos.replace('-', ' ')}
                          </button>
                       ))}
                       <button 
                          onClick={() => setUserInfo(p => ({ ...p, position: 'custom' }))}
                          className={`px-3 py-2 text-xs rounded border transition-all col-span-2 ${userInfo.position === 'custom' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                       >
                          自定义位置
                       </button>
                    </div>
                 </div>
                 
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 mb-1 block">大小 ({Math.round(userInfo.scale * 100)}%)</label>
                       <input type="range" min="0.8" max="1.5" step="0.1" value={userInfo.scale} onChange={e => setUserInfo(p => ({ ...p, scale: parseFloat(e.target.value) }))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    </div>
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 mb-1 block">透明度 ({Math.round(userInfo.opacity * 100)}%)</label>
                       <input type="range" min="0.5" max="1" step="0.1" value={userInfo.opacity} onChange={e => setUserInfo(p => ({ ...p, opacity: parseFloat(e.target.value) }))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="text-slate-400 font-medium text-sm uppercase tracking-widest">选择一种风格并下载</span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {styles.map((style) => (
          <CardWrapper key={style.id} content={content} style={style.id} styleName={style.name} userInfo={userInfo} />
        ))}
      </div>
    </div>
  );
};

export default CardGrid;
