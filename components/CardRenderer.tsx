
import React from 'react';
import { CardContent, CardStyle, ContentSection, UserInfo } from '../types';
import { Quote, Check, Clock, Hash, Share2, MoreHorizontal, Bookmark, List, Feather, Layers, Star, ArrowRight, Grip } from 'lucide-react';

interface CardRendererProps {
  content: CardContent;
  style: CardStyle;
  renderMode?: 'total' | 'cover' | 'slide';
  sectionIndex?: number;
  footerNote?: string;
  fixedAspectRatioClass?: string;
  userInfo?: UserInfo;
}

const CardRenderer: React.FC<CardRendererProps> = ({ 
  content, 
  style, 
  renderMode = 'total',
  sectionIndex = 0,
  footerNote,
  fixedAspectRatioClass,
  userInfo
}) => {
  
  const isHighRes = !!fixedAspectRatioClass; // Assume export mode if fixed aspect ratio is present

  const baseCardClass = fixedAspectRatioClass 
    ? `w-full h-full overflow-hidden relative flex flex-col ${fixedAspectRatioClass}`
    : "min-h-[600px] h-auto w-full overflow-hidden relative flex flex-col transition-all duration-300";

  // Helper: Determine what to show based on mode
  const showCoverElements = renderMode === 'total' || renderMode === 'cover';
  const showAllSections = renderMode === 'total';
  const showSingleSection = renderMode === 'slide';
  
  const currentSection = showSingleSection && content.sections[sectionIndex] 
    ? content.sections[sectionIndex] 
    : null;

  // Dynamic sizing helper
  // Adjusted highRes font sizes to be slightly smaller to ensure fit (text-2xl instead of 4xl for body)
  const s = (normal: string, large: string) => isHighRes ? large : normal;

  const renderPagination = (textColor: string = "text-gray-500") => {
    if (!footerNote) return null;
    return (
      <div className={`absolute bottom-4 right-6 ${s('text-[10px]', 'text-xl')} font-mono opacity-60 ${textColor} z-50 bg-black/5 px-3 py-1 rounded-full backdrop-blur-sm`}>
        {footerNote}
      </div>
    );
  };

  // --- User Info Rendering (HTML/Tailwind) ---
  const renderUserInfo = () => {
    if (!userInfo || !userInfo.enabled) return null;

    const { avatar, nickname, position, customPos, scale, opacity } = userInfo;
    
    // Determine text color based on style (heuristic)
    const isDarkStyle = [CardStyle.CYBERPUNK, CardStyle.ELEGANT_LUXURY, CardStyle.GLASSMORPHISM, CardStyle.MODERN_GRADIENT].includes(style);
    const textColorClass = isDarkStyle ? 'text-white' : 'text-gray-800';
    const textShadowClass = isDarkStyle ? 'drop-shadow-md' : 'drop-shadow-sm'; // Add shadow for legibility

    // Position classes & Styles
    let posClass = '';
    let styleObj: React.CSSProperties = {
      opacity: opacity,
      transform: `scale(${scale})`,
    };

    if (position === 'custom') {
      // Use percentage based positioning
      styleObj.left = `${customPos.x}%`;
      styleObj.top = `${customPos.y}%`;
      styleObj.transformOrigin = 'center center';
    } else {
      // Use preset classes
      switch (position) {
        case 'top-left': 
          posClass = `top-6 left-6 flex-row`; 
          styleObj.transformOrigin = 'left center';
          break;
        case 'top-right': 
          posClass = `top-6 right-6 flex-row-reverse text-right`; 
          styleObj.transformOrigin = 'right center';
          break;
        case 'bottom-left': 
          posClass = `bottom-6 left-6 flex-row`; 
          styleObj.transformOrigin = 'left center';
          break;
        case 'bottom-right': 
          posClass = `bottom-6 right-6 flex-row-reverse text-right`; 
          styleObj.transformOrigin = 'right center';
          break;
        default: 
          posClass = `bottom-6 left-6 flex-row`;
          styleObj.transformOrigin = 'left center';
      }
    }

    // High Res scaling for Avatar/Text
    const avatarSize = isHighRes ? 'w-[50px] h-[50px]' : 'w-10 h-10';
    const fontSize = isHighRes ? 'text-xl' : 'text-sm';
    const gap = isHighRes ? 'gap-3' : 'gap-2';
    const strokeWidth = isHighRes ? 'border-2' : 'border-[1.5px]';

    return (
      <div 
        className={`absolute ${position === 'custom' ? '' : posClass} flex items-center ${gap} z-50 pointer-events-none transition-all duration-300`}
        style={styleObj}
      >
        {avatar && (
          <div className={`${avatarSize} rounded-full overflow-hidden ${strokeWidth} border-white shadow-md flex-shrink-0 bg-gray-200`}>
             <img src={avatar} alt="User" className="w-full h-full object-cover" />
          </div>
        )}
        {nickname && (
          <span className={`${fontSize} font-bold ${textColorClass} ${textShadowClass} max-w-[150px] truncate`}>
            {nickname}
          </span>
        )}
      </div>
    );
  };

  // --- Sub-components for different styling needs ---
  
  const renderKeyPointsList = (className: string, itemClass: string, icon?: React.ReactNode) => (
    <div className={className}>
       {content.keyPoints.map((point, i) => (
         <div key={i} className={itemClass}>
            {icon}
            <span>{point}</span>
         </div>
       ))}
    </div>
  );

  const renderSectionContent = (section: ContentSection, idx: number, titleClass: string, textClass: string, containerClass: string = "mb-6") => (
    <div key={idx} className={containerClass}>
       <h4 className={titleClass}>{section.title}</h4>
       <p className={textClass}>{section.content}</p>
    </div>
  );

  // Wrap the card content to include renderUserInfo() at the end of every card
  const Wrapper = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={className}>
      {children}
      {renderUserInfo()}
    </div>
  );

  switch (style) {
    case CardStyle.MINIMALIST:
      return (
        <Wrapper className={`${baseCardClass} bg-white border border-gray-200 ${s('p-6', 'p-12')}`}>
          <div className={`absolute ${s('-top-20 -right-20 w-64 h-64', '-top-40 -right-40 w-[600px] h-[600px]')} bg-gray-50 rounded-full z-0`}></div>
          
          <div className="relative z-10 flex flex-col flex-grow">
            {/* Header Area */}
            <div className={`flex items-center justify-between ${s('mb-6', 'mb-12')}`}>
              <span className={`${s('text-[10px]', 'text-2xl')} font-bold tracking-[0.2em] uppercase text-gray-400 border-b border-gray-200 pb-2`}>
                {showSingleSection ? content.title : content.category}
              </span>
              <div className={`flex items-center gap-2 text-gray-400`}>
                <Clock size={isHighRes ? 24 : 12} />
                <span className={s('text-[10px]', 'text-xl')}>{content.readingTime}</span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Cover Mode */}
              {showCoverElements && (
                <>
                  <h3 className={`${s('text-3xl', 'text-6xl')} font-serif font-medium text-gray-900 leading-tight`}>{content.title}</h3>
                  <div className="flex-1 flex flex-col justify-center">
                     <p className={`text-gray-600 leading-relaxed font-sans text-justify border-l-4 border-gray-900 pl-6 py-2 my-6 ${s('text-xl', 'text-2xl')}`}>
                       {content.summary}
                     </p>
                  </div>
                  
                  {content.keyPoints.length > 0 && (
                    <div className={`bg-gray-50 ${s('p-5', 'p-10')} rounded-3xl mt-auto`}>
                      <h4 className={`${s('text-[10px]', 'text-2xl')} font-bold uppercase text-gray-400 mb-6 flex items-center gap-2`}>
                        <List size={isHighRes ? 24 : 10} /> 核心亮点
                      </h4>
                      {renderKeyPointsList("space-y-6", `flex items-start gap-4 ${s('text-sm', 'text-3xl')} text-gray-700 font-medium leading-relaxed`, <span className={`mt-3 ${s('w-1 h-1', 'w-3 h-3')} bg-gray-900 rounded-full flex-shrink-0`} />)}
                    </div>
                  )}
                </>
              )}

              {/* Slide Mode */}
              {showSingleSection && currentSection && (
                 <div className={`flex flex-col justify-center h-full relative ${s('pb-10', 'pb-48')}`}>
                    {/* Giant Watermark Number */}
                    <span className="absolute top-0 -left-6 text-[250px] font-black text-gray-100 -z-10 leading-none select-none opacity-60">
                      {(sectionIndex + 1).toString().padStart(2, '0')}
                    </span>
                    
                    <div className={`${s('mb-8 mt-6', 'mb-12 mt-4')}`}>
                      <h2 className={`${s('text-3xl', 'text-5xl')} font-serif font-medium text-gray-900 mb-8 leading-tight`}>
                        {currentSection.title}
                      </h2>
                      <div className="w-24 h-2 bg-gray-900 mb-8"></div>
                    </div>
                    
                    <div className={`${s('text-lg', 'text-3xl')} text-gray-700 leading-[1.8] text-justify font-sans tracking-wide`}>
                       {currentSection.content}
                    </div>

                    <div className="mt-auto pt-12 flex justify-center">
                       <span className="text-gray-300 text-3xl">• • •</span>
                    </div>
                 </div>
              )}

              {/* Total Mode */}
              {showAllSections && content.sections.map((section, i) => (
                 renderSectionContent(section, i, "text-lg font-bold text-gray-800 mb-2 mt-4", "text-sm text-gray-600 leading-relaxed text-justify")
              ))}
            </div>

            <div className={`mt-8 pt-6 border-t border-gray-100 flex justify-between items-center relative ${s('text-xs', 'text-xl')}`}>
              <div className="font-bold text-gray-900">{content.authorOrSource}</div>
              <div className={`${s('text-2xl', 'text-5xl')} grayscale opacity-80`}>{content.emoji}</div>
              {renderPagination()}
            </div>
          </div>
        </Wrapper>
      );

    case CardStyle.MODERN_GRADIENT:
      return (
        <Wrapper className={`${baseCardClass} bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-2 text-white`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 z-0 pointer-events-none"></div>
          {/* Add some random glowing orbs for texture */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-400/20 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-400/20 rounded-full blur-[100px]"></div>
          </div>
          
          <div className={`flex-grow bg-black/20 backdrop-blur-md ${s('p-6', 'p-12')} flex flex-col justify-between border border-white/10 relative z-10 rounded-xl overflow-hidden`}>
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className={`flex justify-between items-start ${s('mb-6', 'mb-12')}`}>
                <span className={`px-4 py-1.5 bg-white/20 rounded-lg ${s('text-[10px]', 'text-xl')} font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-sm`}>
                  {showSingleSection ? content.title.substring(0, 10) + (content.title.length > 10 ? '...' : '') : content.category}
                </span>
                <span className={`${s('text-4xl', 'text-7xl')} drop-shadow-lg filter grayscale-[0.2]`}>{content.emoji}</span>
              </div>
              
              {/* Cover Mode */}
              {showCoverElements && (
                <>
                   <div className="flex-1 flex flex-col justify-center">
                     <h3 className={`${s('text-2xl', 'text-6xl')} font-bold mb-10 leading-tight drop-shadow-md`}>{content.title}</h3>
                     <div className={`bg-white/10 rounded-3xl ${s('p-5', 'p-10')} backdrop-blur-sm mb-8 border border-white/5 shadow-inner`}>
                       <p className={`text-white/95 ${s('text-sm', 'text-2xl')} font-medium leading-relaxed text-justify tracking-wide`}>{content.summary}</p>
                     </div>
                   </div>
                   
                   {content.keyPoints.length > 0 && (
                     <div className="space-y-6 mt-auto mb-6">
                       {renderKeyPointsList("", `flex gap-4 items-start group ${s('text-xs', 'text-2xl')} text-white/95 leading-relaxed font-medium`, 
                         <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0"><Check size={isHighRes ? 20 : 10} strokeWidth={3} /></div>
                       )}
                     </div>
                   )}
                </>
              )}

              {/* Slide Mode - Refined for Balance */}
              {showSingleSection && currentSection && (
                <div className="flex flex-col h-full relative">
                   {/* Giant Background Number */}
                   <div className="absolute top-[-20px] right-[-20px] opacity-10 font-black text-[200px] leading-none tracking-tighter select-none pointer-events-none">
                      {(sectionIndex + 1).toString().padStart(2, '0')}
                   </div>

                   <div className={`flex-1 flex flex-col justify-center relative z-10 ${s('pb-10', 'pb-48')}`}>
                       {/* Content Box */}
                       <div className={`bg-gradient-to-b from-white/15 to-white/5 ${s('p-8', 'p-14')} rounded-[2.5rem] border border-white/20 backdrop-blur-xl shadow-2xl`}>
                          <div className="flex items-center gap-4 mb-8">
                             <span className={`flex items-center justify-center ${s('w-8 h-8', 'w-16 h-16')} rounded-full bg-white/20 text-white font-bold ${s('text-sm', 'text-2xl')}`}>
                                {sectionIndex + 1}
                             </span>
                             <h2 className={`${s('text-2xl', 'text-4xl')} font-bold text-white leading-tight`}>
                               {currentSection.title}
                             </h2>
                          </div>
                          
                          <div className={`w-full h-px bg-gradient-to-r from-white/50 to-transparent mb-8`}></div>

                          <p className={`${s('text-lg', 'text-3xl')} text-white/95 leading-[1.8] font-medium text-justify tracking-wide drop-shadow-sm`}>
                             {currentSection.content}
                          </p>
                       </div>
                   </div>
                </div>
              )}

              {/* Total Mode */}
              {showAllSections && (
                <div className="mt-4 space-y-6">
                  {content.sections.map((section, i) => (
                    renderSectionContent(section, i, "text-lg font-bold text-white mb-2", "text-sm text-white/80 leading-relaxed font-light", "bg-black/10 p-4 rounded-lg")
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`mt-12 pt-6 border-t border-white/10 flex justify-between items-center ${s('text-[10px]', 'text-xl')} font-medium opacity-80 relative z-20`}>
               <span>{content.authorOrSource}</span>
               <span>{content.readingTime}</span>
               {renderPagination("text-white/90 font-bold bg-white/20")}
            </div>
          </div>
        </Wrapper>
      );
    
    case CardStyle.CYBERPUNK:
      return (
        <Wrapper className={`${baseCardClass} bg-[#09090b] p-2 font-mono`}>
           {/* ... existing cyberpunk code ... */}
           <div className="absolute inset-0 border-2 border-cyan-500/50 z-20 pointer-events-none clip-path-slant"></div>
           <div className="absolute inset-0 w-full h-full z-0" 
                style={{ 
                  backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, .05) 25%, rgba(6, 182, 212, .05) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .05) 75%, rgba(6, 182, 212, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(6, 182, 212, .05) 25%, rgba(6, 182, 212, .05) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .05) 75%, rgba(6, 182, 212, .05) 76%, transparent 77%, transparent)',
                  backgroundSize: '40px 40px'
                }}>
           </div>
           
           <div className={`relative z-10 flex flex-col flex-grow ${s('p-5', 'p-10')} bg-black/40 backdrop-blur-[1px]`}>
             <div className={`flex justify-between items-center border-b border-cyan-900/60 pb-4 ${s('mb-6', 'mb-12')}`}>
               <div className="flex items-center gap-3">
                 <span className="w-3 h-3 bg-pink-500 animate-pulse shadow-[0_0_10px_#ec4899]"></span>
                 <span className={`text-cyan-400 ${s('text-[10px]', 'text-xl')} tracking-widest uppercase`}>System_Ready</span>
               </div>
               <span className={`text-pink-500 ${s('text-[10px]', 'text-xl')} font-bold bg-pink-500/10 px-4 py-1 rounded`}>
                 {showSingleSection ? `NODE_0${sectionIndex + 1}` : content.category}
               </span>
             </div>

             {showCoverElements && (
               <>
                 <div className="flex-1 flex flex-col justify-center">
                   <h3 className={`${s('text-xl', 'text-6xl')} text-white font-bold mb-10 uppercase tracking-wide leading-tight drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]`}>
                     <span className="text-cyan-300 mr-4">_&gt;</span>
                     {content.title}
                   </h3>
                   <div className="relative mb-12 group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-pink-500 rounded opacity-30 group-hover:opacity-50 transition duration-500 blur-sm"></div>
                     <div className={`relative bg-gray-900/95 ${s('p-5', 'p-10')} border border-cyan-500/50`}>
                       <p className={`text-cyan-50 ${s('text-xs', 'text-2xl')} leading-relaxed text-justify font-light tracking-wide`}>
                         {content.summary}
                       </p>
                     </div>
                   </div>
                 </div>

                 {content.keyPoints.length > 0 && (
                   <div className="space-y-4 mb-8 mt-auto">
                     <div className="flex items-center gap-2 mb-4">
                        <Hash size={isHighRes ? 24 : 12} className="text-pink-500" />
                        <span className={`text-cyan-600 ${s('text-[10px]', 'text-xl')} font-bold uppercase tracking-widest`}>Critical_Data</span>
                     </div>
                     {renderKeyPointsList("", `flex items-start gap-3 pl-4 border-l-2 border-cyan-800 hover:border-cyan-400 transition-colors ${s('text-xs', 'text-2xl')} text-gray-300 leading-relaxed`, 
                       <span className={`text-cyan-500 mt-1 flex-shrink-0`}>{`>>`}</span>
                     )}
                   </div>
                 )}
               </>
             )}

             {showSingleSection && currentSection && (
                <div className={`flex-grow flex flex-col justify-center relative ${s('pb-10', 'pb-48')}`}>
                   {/* Tech Background Decor */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-dashed border-cyan-500/10 z-0 pointer-events-none rounded-lg"></div>
                   
                   <div className="mb-10 z-10">
                      <span className={`text-pink-500 ${s('text-xs', 'text-2xl')} uppercase tracking-[0.3em] mb-4 block animate-pulse`}>Initializing_Section...</span>
                      <h2 className={`${s('text-3xl', 'text-5xl')} text-cyan-400 font-bold uppercase border-b-2 border-dashed border-cyan-500/50 pb-6 inline-block`}>{currentSection.title}</h2>
                   </div>
                   
                   <div className={`text-gray-200 ${s('text-lg', 'text-3xl')} leading-[1.8] font-light border-l-4 border-pink-500/50 pl-8 py-6 bg-gradient-to-r from-cyan-900/20 to-transparent z-10`}>
                      {currentSection.content}
                   </div>
                   
                   <div className="mt-12 flex gap-2 opacity-30">
                      {[...Array(5)].map((_,i) => <div key={i} className="h-2 w-8 bg-cyan-500"></div>)}
                   </div>
                </div>
             )}

             {showAllSections && (
               <div className="mt-6 space-y-8 border-t border-dashed border-gray-800 pt-6">
                 {content.sections.map((section, i) => (
                   renderSectionContent(section, i, "text-base text-pink-500 font-bold mb-2 uppercase", "text-xs text-gray-400 leading-relaxed pl-2 border-l border-cyan-900")
                 ))}
               </div>
             )}

             <div className={`mt-auto pt-8 flex justify-between items-center ${s('text-[9px]', 'text-lg')} text-gray-500 font-mono uppercase relative`}>
                <span className="flex items-center gap-2"><span className="text-pink-500">SRC:</span> {content.authorOrSource}</span>
                <span className="bg-cyan-950/50 px-3 py-1 border border-cyan-900 rounded text-cyan-400">{content.readingTime}</span>
                {renderPagination("text-cyan-500 bg-cyan-950 border border-cyan-500")}
             </div>
           </div>
        </Wrapper>
      );

    case CardStyle.NEO_BRUTALISM:
      return (
        <Wrapper className={`${baseCardClass} bg-[#FFDEE9] bg-gradient-to-b from-[#f093fb] to-[#f5576c] border-[6px] border-black ${s('p-5', 'p-10')}`}>
           {/* ... Neo Brutalism Code ... */}
           <div className={`absolute ${s('top-[100px] -right-[20px]', 'top-[200px] -right-[40px]')} bg-black text-white ${s('text-[10px]', 'text-2xl')} font-black px-8 py-2 transform rotate-45 z-20 border-2 border-white`}>Featured</div>
          
          <div className="relative z-10 flex flex-col flex-grow">
            <div className={`flex justify-between items-start ${s('mb-6', 'mb-12')}`}>
               <div className={`inline-block bg-white border-[4px] border-black px-4 py-2 font-black ${s('text-xs', 'text-2xl')} uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
                  {showSingleSection ? `PART ${sectionIndex + 1}` : content.category}
               </div>
               <div className={`${s('text-4xl', 'text-8xl')} filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] transform hover:rotate-12 transition-transform duration-300`}>{content.emoji}</div>
            </div>
            
            {showCoverElements && (
              <>
                 <div className="flex-1 flex flex-col justify-center">
                   <h3 className={`${s('text-2xl', 'text-5xl')} font-black text-black mb-8 uppercase leading-none tracking-tight bg-white inline-block ${s('px-3 py-2', 'px-8 py-6')} border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1`}>
                     {content.title}
                   </h3>
                   <div className={`bg-white border-[4px] border-black ${s('p-5', 'p-10')} mb-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative`}>
                     <div className="absolute -top-4 -left-4 w-8 h-8 bg-black rounded-full border-[4px] border-white"></div>
                     <p className={`font-bold ${s('text-xs', 'text-2xl')} leading-relaxed text-justify mt-2`}>{content.summary}</p>
                   </div>
                 </div>
                 
                 {content.keyPoints.length > 0 && (
                   <div className="space-y-4 mb-8 mt-auto">
                      {renderKeyPointsList("", `flex items-start gap-4 bg-[#FEFF9C] border-[3px] border-black ${s('p-3', 'p-6')} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-bold ${s('text-sm', 'text-2xl')}`, <div className="w-4 h-4 bg-black flex-shrink-0 mt-1.5"></div>)}
                   </div>
                 )}
              </>
            )}

            {showSingleSection && currentSection && (
               <div className={`flex flex-col justify-center h-full ${s('pb-10', 'pb-48')}`}>
                  {/* Decor Shape */}
                  <div className="absolute top-1/4 -left-10 w-32 h-32 bg-[#FEFF9C] rounded-full border-[4px] border-black z-0"></div>
                  
                  <div className={`relative z-10 bg-white border-[4px] border-black ${s('p-8', 'p-12')} shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform rotate-1`}>
                     <div className="absolute -top-8 right-8 bg-black text-white px-4 py-2 font-black text-2xl border-[4px] border-white rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                       #{sectionIndex + 1}
                     </div>
                     
                     <h2 className={`${s('text-3xl', 'text-6xl')} font-black bg-[#FEFF9C] inline-block px-6 py-2 border-[3px] border-black mb-10 transform -rotate-2`}>{currentSection.title}</h2>
                     <p className={`font-bold ${s('text-lg', 'text-3xl')} leading-[1.6] text-justify`}>
                        {currentSection.content}
                     </p>
                  </div>
               </div>
            )}

            {showAllSections && (
              <div className="space-y-6 mt-6">
                 {content.sections.map((section, i) => (
                   <div key={i} className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <h4 className="font-black text-lg mb-2 bg-black text-white inline-block px-2">{section.title}</h4>
                      <p className="text-xs font-bold leading-relaxed">{section.content}</p>
                   </div>
                 ))}
              </div>
            )}
            
            <div className={`mt-auto flex justify-between items-end font-black ${s('text-[10px]', 'text-xl')} uppercase relative pt-8`}>
              <span className="bg-black text-white px-4 py-2 transform -skew-x-12">{content.authorOrSource}</span>
              <span className="underline decoration-4 underline-offset-4">{content.readingTime}</span>
              {renderPagination("text-black font-black bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]")}
            </div>
          </div>
        </Wrapper>
      );

    case CardStyle.ELEGANT_LUXURY:
      return (
        <Wrapper className={`${baseCardClass} bg-[#0a0a0a] text-[#f0f0f0] ${s('p-6', 'p-14')} border border-white/10`}>
           {/* ... Luxury Code ... */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
          <div className="absolute inset-4 border border-[#C5A059]/40 pointer-events-none z-20"></div>
          <div className="absolute inset-5 border border-[#C5A059]/20 pointer-events-none z-20"></div>
          
          <div className="relative z-10 flex flex-col flex-grow">
            <div className="text-center mb-12 pt-4">
               <span className={`text-[#C5A059] ${s('text-[9px]', 'text-lg')} uppercase tracking-[0.4em] font-serif border-b border-[#C5A059]/30 pb-4 inline-block`}>
                 {showSingleSection ? `Chapter ${sectionIndex + 1}` : content.category}
               </span>
            </div>

            {showCoverElements && (
              <>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className={`${s('text-2xl', 'text-6xl')} font-serif text-center text-white mb-8 italic leading-tight px-4`}>
                    {content.title}
                  </h3>
                  <div className="flex justify-center mb-10">
                     <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>
                  </div>
                  <p className={`text-center text-[#e0e0e0] ${s('text-xs', 'text-2xl')} font-light leading-loose text-justify tracking-wide mb-12 px-4`}>
                    {content.summary}
                  </p>
                </div>
                
                {content.keyPoints.length > 0 && (
                  <div className="bg-[#1a1a1a]/50 p-8 border border-[#C5A059]/10 mb-10 mx-4 backdrop-blur-sm">
                    {renderKeyPointsList("space-y-6", `flex flex-col items-center text-center gap-3 ${s('text-sm', 'text-2xl')} font-serif text-[#d4d4d4]`, <span className="text-[#C5A059] text-sm font-serif">•</span>)}
                  </div>
                )}
              </>
            )}

            {showSingleSection && currentSection && (
               <div className={`flex flex-col items-center justify-center flex-grow px-8 relative ${s('pb-10', 'pb-56')}`}>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-10 text-[#C5A059]">
                     <Star size={200} strokeWidth={0.5} />
                  </div>

                  <div className="w-12 h-12 border border-[#C5A059] rotate-45 mb-12 flex items-center justify-center mt-10">
                     <span className="text-[#C5A059] text-xl -rotate-45 font-serif italic">{sectionIndex + 1}</span>
                  </div>
                  <h2 className={`${s('text-3xl', 'text-5xl')} font-serif text-[#C5A059] mb-12 text-center italic max-w-3xl leading-tight`}>{currentSection.title}</h2>
                  <p className={`${s('text-lg', 'text-3xl')} text-[#e0e0e0] leading-[1.9] font-light text-justify font-serif tracking-wide drop-shadow-md`}>
                     {currentSection.content}
                  </p>
                  <div className="mt-12 w-full flex justify-center">
                     <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent"></div>
                  </div>
               </div>
            )}

            {showAllSections && (
               <div className="mt-8 space-y-8 px-2">
                 {content.sections.map((section, i) => (
                    <div key={i} className="text-center">
                       <h4 className="text-[#C5A059] font-serif text-lg mb-3 italic">— {section.title} —</h4>
                       <p className="text-xs text-[#cccccc] font-serif tracking-wide leading-relaxed text-justify">{section.content}</p>
                    </div>
                 ))}
               </div>
            )}

            <div className={`mt-auto flex justify-between items-end ${s('text-[9px]', 'text-lg')} text-[#C5A059]/70 font-serif uppercase tracking-widest px-4 pb-2 relative pt-10`}>
              <span>{content.authorOrSource}</span>
              <span>{content.readingTime} READ</span>
              {renderPagination("text-[#C5A059]")}
            </div>
          </div>
        </Wrapper>
      );

    case CardStyle.NATURE_ORGANIC:
      return (
        <Wrapper className={`${baseCardClass} bg-[#f5f5f0] ${s('p-6', 'p-12')} text-[#2d342d] border-[12px] border-[#e8e8e0]`}>
           {/* ... Organic Code ... */}
           <div className="absolute -right-20 top-20 w-96 h-96 bg-[#d4e6d4] rounded-full blur-3xl opacity-60 mix-blend-multiply pointer-events-none"></div>
          <div className="absolute -left-20 bottom-10 w-96 h-96 bg-[#e6e0d0] rounded-full blur-3xl opacity-60 mix-blend-multiply pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col flex-grow">
            <div className={`flex items-center justify-between ${s('mb-6', 'mb-12')}`}>
              <div className="flex items-center gap-3 bg-white/60 px-5 py-2 rounded-full shadow-sm backdrop-blur-sm">
                <span className={`${s('text-lg', 'text-3xl')}`}>{content.emoji}</span>
                <span className="h-6 w-px bg-gray-300"></span>
                <span className={`${s('text-[10px]', 'text-lg')} font-bold tracking-wide text-[#5a6e5a] uppercase`}>{content.category}</span>
              </div>
            </div>

            {showCoverElements && (
              <>
                 <div className="flex-1 flex flex-col justify-center">
                   {/* Reduced high-res font size from 5xl to 4xl for title to fit better */}
                   <h3 className={`${s('text-2xl', 'text-4xl')} font-bold text-[#1a2e1a] mb-10 leading-tight font-serif tracking-tight`}>
                     {content.title}
                   </h3>
                   <div className={`bg-white/50 ${s('p-5', 'p-12')} rounded-3xl backdrop-blur-[2px] mb-8 border border-white/60 shadow-sm`}>
                     {/* Reduced high-res font size from 2xl to xl for summary */}
                     <p className={`text-[#3d4f3d] ${s('text-sm', 'text-xl')} leading-relaxed text-justify font-medium`}>{content.summary}</p>
                   </div>
                 </div>
                 
                 {content.keyPoints.length > 0 && (
                   <div className="flex flex-col gap-4 mb-8 mt-auto">
                      <div className="flex items-center gap-2 mb-2 pl-2">
                        <Feather size={isHighRes ? 24 : 12} className="text-[#6b8e6b]" />
                        <span className={`${s('text-xs', 'text-xl')} font-bold text-[#6b8e6b] uppercase tracking-wider`}>Key Insights</span>
                      </div>
                      {/* Reduced key points font size to text-xl */}
                      {renderKeyPointsList("space-y-4", `flex items-start gap-4 ${s('text-sm', 'text-xl')} font-medium text-[#2d342d] bg-white/70 ${s('p-3', 'p-6')} rounded-2xl border border-white/40 shadow-sm`, <div className="w-2 h-2 rounded-full bg-[#6b8e6b] mt-2.5 flex-shrink-0"></div>)}
                   </div>
                 )}
              </>
            )}

            {showSingleSection && currentSection && (
               <div className={`flex flex-col justify-center h-full ${s('pb-10', 'pb-48')}`}>
                  <div className={`bg-white/60 ${s('p-8', 'p-14')} rounded-[3rem] shadow-lg border border-[#fff] backdrop-blur-md`}>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-[#6b8e6b] text-white flex items-center justify-center font-serif text-2xl shadow-inner">
                           {sectionIndex + 1}
                        </div>
                        <div className="h-px flex-1 bg-[#6b8e6b]/30"></div>
                     </div>
                     
                     <h2 className={`${s('text-3xl', 'text-5xl')} font-serif font-bold text-[#2d342d] mb-10`}>
                        {currentSection.title}
                     </h2>
                     <p className={`${s('text-lg', 'text-3xl')} text-[#3d4f3d] leading-[1.8] font-medium text-justify`}>
                        {currentSection.content}
                     </p>
                  </div>
               </div>
            )}

            {showAllSections && (
              <div className="space-y-6 mt-4">
                 {content.sections.map((section, i) => (
                    renderSectionContent(section, i, "text-lg font-bold text-[#2d342d] mb-2 font-serif", "text-sm text-[#3d4f3d] leading-relaxed", "bg-white/40 p-4 rounded-xl")
                 ))}
              </div>
            )}

             <div className={`mt-auto pt-6 text-center ${s('text-[10px]', 'text-xl')} text-[#7a8e7a] font-medium flex justify-center items-center gap-3 relative`}>
                <span>{content.authorOrSource}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7a8e7a]"></span>
                <span>{content.readingTime}</span>
                {renderPagination("text-[#7a8e7a]")}
             </div>
          </div>
        </Wrapper>
      );

    case CardStyle.GLASSMORPHISM:
      return (
        <Wrapper className={`${baseCardClass} p-0 rounded-none bg-gray-900`}>
           {/* ... Glass Code ... */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#4facfe] to-[#00f2fe]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[40%] bg-[#fa709a] rounded-full blur-[100px] opacity-70 mix-blend-overlay"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[40%] bg-[#fee140] rounded-full blur-[100px] opacity-60 mix-blend-overlay"></div>

          <div className={`relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 m-4 ${s('p-6', 'p-12')} rounded-[2rem] flex flex-col shadow-2xl flex-grow`}>
             <div className={`flex justify-between items-center ${s('mb-6', 'mb-12')}`}>
               <span className={`text-white ${s('text-[9px]', 'text-lg')} font-bold px-4 py-1.5 bg-white/10 rounded-full uppercase tracking-widest border border-white/10 shadow-inner`}>
                 {content.category}
               </span>
               <div className="bg-white/20 p-2 rounded-full backdrop-blur-md shadow-sm">
                 <Share2 size={isHighRes ? 20 : 14} className="text-white" />
               </div>
             </div>

             {showCoverElements && (
               <>
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Reduced high-res font size from 5xl to 4xl */}
                    <h3 className={`text-white font-bold ${s('text-2xl', 'text-4xl')} mb-10 drop-shadow-md leading-tight tracking-tight`}>{content.title}</h3>
                    <div className={`bg-gradient-to-b from-white/10 to-white/5 rounded-2xl ${s('p-6', 'p-12')} mb-8 border border-white/10 shadow-inner`}>
                       {/* Reduced high-res font size from 2xl to xl */}
                       <p className={`text-white ${s('text-xs', 'text-xl')} font-medium leading-relaxed text-justify`}>{content.summary}</p>
                    </div>
                  </div>
                  
                  {content.keyPoints.length > 0 && (
                    <div className="mb-10 mt-auto">
                      <h4 className={`text-white/70 ${s('text-[10px]', 'text-xl')} uppercase font-bold mb-4 flex items-center gap-2 pl-2`}>
                        <div className="w-6 h-[2px] bg-white/50"></div> HIGHLIGHTS
                      </h4>
                      {/* Reduced key points high-res font size to xl */}
                      {renderKeyPointsList("space-y-4", `flex items-start gap-4 bg-black/5 ${s('p-4', 'p-6')} rounded-xl border border-white/5 hover:bg-white/5 transition-colors ${s('text-xs', 'text-xl')} text-white/90 leading-relaxed font-light`, <div className="w-2 h-2 bg-white rounded-full mt-2 shadow-[0_0_8px_rgba(255,255,255,0.8)] flex-shrink-0"></div>)}
                    </div>
                  )}
               </>
             )}

             {showSingleSection && currentSection && (
                <div className={`flex-grow flex flex-col justify-center relative ${s('pb-10', 'pb-48')}`}>
                   {/* Frosted Big Number */}
                   <div className="absolute -right-4 top-20 text-[180px] font-bold text-white/5 select-none leading-none z-0">
                      {sectionIndex + 1}
                   </div>

                   <div className={`bg-white/10 ${s('p-8', 'p-14')} rounded-[2.5rem] border border-white/20 shadow-inner relative z-10`}>
                      <h2 className={`${s('text-3xl', 'text-5xl')} text-white font-bold mb-10 drop-shadow-md`}>{currentSection.title}</h2>
                      <p className={`${s('text-lg', 'text-3xl')} text-white/90 leading-[1.8] font-medium text-justify tracking-wide`}>
                         {currentSection.content}
                      </p>
                   </div>
                </div>
             )}

             {showAllSections && (
                <div className="mt-6 space-y-6">
                   {content.sections.map((section, i) => (
                      renderSectionContent(section, i, "text-lg text-white font-bold mb-2", "text-sm text-white/80 leading-relaxed", "bg-black/10 rounded-xl p-4 border border-white/5")
                   ))}
                </div>
             )}

             <div className={`mt-auto pt-8 border-t border-white/10 relative`}>
               <div className={`flex items-center justify-between text-white/70 ${s('text-[9px]', 'text-lg')} font-medium uppercase tracking-wide`}>
                 <span className="flex items-center gap-2"><Clock size={isHighRes ? 20 : 12} /> {content.readingTime}</span>
                 {renderPagination("text-white/80")}
                 <span>{content.authorOrSource}</span>
               </div>
             </div>
          </div>
        </Wrapper>
      );

    case CardStyle.NEWSPAPER:
      return (
        <Wrapper className={`${baseCardClass} bg-[#F0EAD6] text-[#2c2c2c] ${s('p-6', 'p-12')} font-serif`}>
           {/* ... Newspaper Code ... */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-[#2c2c2c] z-20"></div>
          
          <div className="relative z-10 flex flex-col flex-grow">
            <div className={`border-b-4 border-double border-[#2c2c2c] pb-4 text-center ${s('mb-6', 'mb-12')}`}>
               <div className={`uppercase tracking-widest ${s('text-xs', 'text-xl')} font-bold mb-2`}>The Daily Knowledge</div>
               <div className={`flex justify-between items-center border-t border-b border-[#2c2c2c] py-1 mt-2 ${s('text-[10px]', 'text-lg')}`}>
                  <span>VOL. {content.category.length}</span>
                  <span>{new Date().toLocaleDateString()}</span>
                  <span>PRICE: FREE</span>
               </div>
            </div>

            {showCoverElements && (
              <>
                 <div className="flex-1 flex flex-col justify-center">
                   <h3 className={`${s('text-3xl', 'text-6xl')} font-black text-[#1a1a1a] mb-6 leading-none text-center uppercase tracking-tighter`}>{content.title}</h3>
                   <div className="flex justify-center mb-6"><div className="w-16 h-1 bg-[#2c2c2c]"></div></div>
                   <div className={`columns-1 gap-6 text-justify ${s('text-sm', 'text-xl')} leading-relaxed font-serif border-l-2 border-r-2 border-[#2c2c2c]/20 px-6 py-4 mx-4 mb-8 bg-[#fffbf0]`}>
                      <span className={`${s('text-4xl', 'text-6xl')} float-left mr-2 mt-[-10px] font-black`}>{content.summary.charAt(0)}</span>
                      {content.summary.substring(1)}
                   </div>
                 </div>
                 
                 {content.keyPoints.length > 0 && (
                   <div className="border-t-2 border-[#2c2c2c] pt-4 mb-8 mt-auto">
                      <h4 className={`font-bold uppercase ${s('text-xs', 'text-xl')} mb-3 bg-[#2c2c2c] text-[#F0EAD6] inline-block px-2`}>Top Stories</h4>
                      {renderKeyPointsList("grid grid-cols-1 gap-3", `flex items-center gap-3 ${s('text-xs', 'text-xl')} font-bold border-b border-[#2c2c2c]/20 pb-2`, <div className="w-2 h-2 bg-[#2c2c2c] rotate-45 flex-shrink-0"></div>)}
                   </div>
                 )}
              </>
            )}

            {showSingleSection && currentSection && (
               <div className={`flex flex-col justify-center h-full ${s('pb-10', 'pb-48')}`}>
                  <div className={`border-4 border-[#2c2c2c] ${s('p-6', 'p-10')} bg-white relative shadow-[8px_8px_0px_#2c2c2c]`}>
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F0EAD6] px-4 font-bold uppercase border-l-2 border-r-2 border-[#2c2c2c]">
                        Page {sectionIndex + 1}
                     </div>
                     
                     <h2 className={`${s('text-3xl', 'text-5xl')} font-black text-center mb-8 border-b-2 border-[#2c2c2c] pb-4`}>{currentSection.title}</h2>
                     <p className={`${s('text-lg', 'text-3xl')} leading-[1.8] text-justify font-serif`}>
                        {currentSection.content}
                     </p>
                  </div>
               </div>
            )}

            {showAllSections && (
              <div className="space-y-6 mt-4 columns-1">
                 {content.sections.map((section, i) => (
                    renderSectionContent(section, i, "text-lg font-bold mb-1 border-b border-black inline-block", "text-sm leading-relaxed", "mb-4 break-inside-avoid")
                 ))}
              </div>
            )}

            <div className={`mt-auto pt-6 border-t-4 border-double border-[#2c2c2c] flex justify-between items-center ${s('text-[10px]', 'text-xl')} font-bold uppercase relative`}>
               <span>{content.authorOrSource}</span>
               {renderPagination("text-[#2c2c2c] bg-[#F0EAD6] border border-[#2c2c2c]")}
               <span>{content.readingTime} READ</span>
            </div>
          </div>
        </Wrapper>
      );

    default:
      return null;
  }
};

export default CardRenderer;
