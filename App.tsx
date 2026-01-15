import React, { useState } from 'react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BrainrotState, BrainrotEntry, BrainrotConcept, Rarity } from './types';
import { Sparkles, Skull, RefreshCw, Grid, Trash2, Download, Box, Layers, Star } from 'lucide-react';

// Configuration for Rarity Tiers
const RARITY_CONFIG: Record<Rarity, { color: string; border: string; bg: string; description: string; complexity: string }> = {
  Common: {
    color: "text-neutral-400",
    border: "border-neutral-600",
    bg: "bg-neutral-800",
    description: "Basic, everyday objects or simple creatures. Low detail.",
    complexity: "Simple geometry, clean lines, basic textures, familiar objects with faces."
  },
  Rare: {
    color: "text-blue-400",
    border: "border-blue-500",
    bg: "bg-blue-900/50",
    description: "Uncommon, slight mutations or accessories.",
    complexity: "Moderate detail, unique accessories, vibrant colors, expressive features."
  },
  Epic: {
    color: "text-purple-400",
    border: "border-purple-500",
    bg: "bg-purple-900/50",
    description: "Impressive, glowing parts, complex lore.",
    complexity: "High detail, glowing elements, particle effects, complex patterned textures."
  },
  Legendary: {
    color: "text-amber-400",
    border: "border-amber-500",
    bg: "bg-amber-900/50",
    description: "Unique, powerful, aura effects, extremely detailed.",
    complexity: "Very high complexity, floating parts, golden accents, divine or demonic aura, intricate armor or skin."
  },
  Mythic: {
    color: "text-rose-500",
    border: "border-rose-600",
    bg: "bg-rose-900/50",
    description: "Reality-breaking, glitchy, eldritch, abstract.",
    complexity: "Insane complexity, glitch effects, non-euclidean geometry, multiple heads or limbs, cosmic horror elements, hyper-realistic textures."
  }
};

// Sub-component for individual cards
const BrainrotCard: React.FC<{
  entry: BrainrotEntry;
  onGenerate3D: (entry: BrainrotEntry) => void;
  onDownload: (url: string, name: string) => void;
}> = ({ entry, onGenerate3D, onDownload }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const rarityStyle = RARITY_CONFIG[entry.rarity];

  // Determine what to display based on view mode and data availability
  const is3DMode = viewMode === '3d';
  const has3DModel = !!entry.modelSheetUrl;
  const currentImageUrl = is3DMode && has3DModel ? entry.modelSheetUrl : entry.imageUrl;
  
  // Handlers
  const handleDownload = () => {
    // If in 3D mode but no model, don't download
    if (is3DMode && !has3DModel) return;
    const suffix = is3DMode ? '-uefn-ref-sheet' : '';
    onDownload(currentImageUrl!, entry.name + suffix);
  };

  const handleGenerate3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode('3d');
    if (!has3DModel && !entry.isModelLoading) {
      onGenerate3D(entry);
    }
  };

  return (
    <div className={`group relative bg-neutral-900/80 backdrop-blur-sm border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col ${rarityStyle.border} border-opacity-30 hover:border-opacity-100`}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-950 group/image">
        
        {/* Main Content Render */}
        {is3DMode && !has3DModel ? (
          // 3D Loading / Empty State
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 bg-neutral-900/50 gap-4 p-6 text-center">
            {entry.isModelLoading ? (
              <>
                <RefreshCw className="w-12 h-12 animate-spin text-purple-500" />
                <p className="text-sm font-mono animate-pulse">Generando Blueprint 3D para UEFN...</p>
              </>
            ) : (
              <>
                <Box className="w-12 h-12 opacity-20" />
                <p className="text-sm">Vista de referencia para modelado 3D.</p>
                <button 
                  onClick={() => onGenerate3D(entry)}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Generar Sheet
                </button>
              </>
            )}
          </div>
        ) : currentImageUrl ? (
          // Image Display
          <>
            <img 
              src={currentImageUrl} 
              alt={entry.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            {/* Download Overlay */}
            <div className="absolute inset-0 z-20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <button 
                onClick={handleDownload}
                className="bg-white/90 hover:bg-white text-black font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-all transform hover:scale-105 shadow-xl cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Descargar {is3DMode ? 'Blueprint' : 'Imagen'}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <Skull className="w-12 h-12 opacity-20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        
        {/* Rarity Badge */}
        <div className={`absolute top-4 right-4 ${rarityStyle.bg} backdrop-blur-md px-3 py-1 rounded-full border ${rarityStyle.border} text-xs font-mono font-bold ${rarityStyle.color} z-10 pointer-events-none flex items-center gap-1 uppercase tracking-wider shadow-lg`}>
          <Star className="w-3 h-3 fill-current" />
          {entry.rarity}
        </div>

        {/* View Mode Toggles */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); setViewMode('2d'); }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${viewMode === '2d' ? 'bg-white text-black scale-110 shadow-lg' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}
            title="Vista Artística"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button 
            onClick={handleGenerate3D}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${viewMode === '3d' ? 'bg-purple-500 text-white scale-110 shadow-lg' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}
            title="Vista 3D / UEFN"
          >
            <Box className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="absolute -top-10 left-6 pointer-events-none">
          <h2 className="text-3xl font-black font-comic uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 drop-shadow-lg">
            {entry.name}
          </h2>
        </div>
        
        <div className="mt-2 space-y-4">
          <div className={`flex items-start gap-2 ${rarityStyle.color}`}>
            <Layers className="w-4 h-4 mt-1 flex-shrink-0" />
            <p className="text-neutral-300 text-sm leading-relaxed font-medium">
              {entry.lore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('Common');
  const [state, setState] = useState<BrainrotState>({
    entries: [],
    isLoading: false,
    error: null,
  });

  const updateEntry = (id: string, updates: Partial<BrainrotEntry>) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const generateBrainrotBatch = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const rarityInfo = RARITY_CONFIG[selectedRarity];

      // 1. Generate 3 Text Concepts at once
      const textModel = 'gemini-3-flash-preview';
      
      const schema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the brainrot character/meme. Catchy, absurd, original.",
            },
            lore: {
              type: Type.STRING,
              description: "Short, funny, nonsensical description. Use Gen Z slang (Spanish/Spanglish).",
            },
            visualPrompt: {
              type: Type.STRING,
              description: "Detailed visual description for image generation (English).",
            },
          },
          required: ["name", "lore", "visualPrompt"],
        },
      };

      const systemInstruction = `You are a creative engine for "Brainrot" memes (viral, absurd, gen z humor).
      User wants 3 NEW concepts with rarity: ${selectedRarity}.
      
      Rarity definition: ${rarityInfo.description}
      Visual Complexity Guide: ${rarityInfo.complexity}
      
      Generate names and lore in Spanish/Spanglish. Visual prompts in English.`;

      const textResponse = await ai.models.generateContent({
        model: textModel,
        contents: "Generate 3 concepts.",
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 1.4, // High chaos
        },
      });

      const concepts: BrainrotConcept[] = JSON.parse(textResponse.text || "[]");
      
      if (!concepts || concepts.length === 0) {
        throw new Error("Failed to generate concepts.");
      }

      // 2. Generate Images for all 3 concepts in parallel
      const newEntries: BrainrotEntry[] = await Promise.all(concepts.map(async (concept) => {
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
              {
                text: `Rarity: ${selectedRarity}. A high quality, 3d render, surreal meme art style. Visuals: ${concept.visualPrompt}. Complexity level: ${rarityInfo.complexity}`,
              }
            ],
          });

          let base64Image = "";
          if (imageResponse.candidates?.[0]?.content?.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          return {
            ...concept,
            rarity: selectedRarity,
            id: crypto.randomUUID(),
            imageUrl: base64Image,
            timestamp: Date.now(),
          };
        } catch (e) {
          console.error("Error generating image for one item", e);
          return {
            ...concept,
            rarity: selectedRarity,
            id: crypto.randomUUID(),
            imageUrl: "",
            timestamp: Date.now(),
          };
        }
      }));

      setState(prev => ({
        entries: [...newEntries, ...prev.entries],
        isLoading: false,
        error: null,
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Algo explotó en la fábrica de memes. Intenta de nuevo.",
      }));
    }
  };

  const generateModelSheet = async (entry: BrainrotEntry) => {
    updateEntry(entry.id, { isModelLoading: true });
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const rarityInfo = RARITY_CONFIG[entry.rarity];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
                { text: `Create a professional 3D character reference sheet (T-Pose) for a video game asset. Include Front View, Side View, and Back View. Character: ${entry.name}. Description: ${entry.visualPrompt}. Style: Fortnite UEFN art style, high fidelity, neutral background, flat lighting for modeling reference, orthographic projection. Complexity: ${rarityInfo.complexity}` }
            ]
        });
        
        let base64Image = "";
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (!base64Image) throw new Error("Failed to generate model sheet");
        updateEntry(entry.id, { modelSheetUrl: base64Image, isModelLoading: false });

    } catch (e) {
        console.error("Error generating model sheet", e);
        updateEntry(entry.id, { isModelLoading: false });
        alert("No se pudo generar la referencia 3D. Intenta de nuevo.");
    }
  }

  const clearPokedex = () => {
    if (confirm("¿Estás seguro de borrar toda tu colección de brainrot?")) {
      setState(prev => ({ ...prev, entries: [] }));
    }
  };

  const downloadImage = (imageUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-4 md:p-8 font-sans overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center gap-10">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 bg-neutral-800/50 px-4 py-2 rounded-full border border-neutral-700 backdrop-blur-sm mb-2">
            <Grid className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-purple-200 tracking-widest uppercase">Pokedex v1.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic font-comic uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Brainrot <span className="rainbow-text">Pokedex</span>
          </h1>
          <p className="text-neutral-400 max-w-md mx-auto">
            Selecciona la rareza y genera assets para UEFN de los memes más curseados.
          </p>
        </header>

        {/* Action Area */}
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
          
          {/* Rarity Selector */}
          <div className="w-full grid grid-cols-5 gap-1 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800">
            {(Object.keys(RARITY_CONFIG) as Rarity[]).map((r) => (
              <button
                key={r}
                onClick={() => !state.isLoading && setSelectedRarity(r)}
                disabled={state.isLoading}
                className={`
                  relative flex flex-col items-center justify-center py-2 rounded-lg transition-all duration-200
                  ${selectedRarity === r ? 'bg-neutral-800 shadow-md transform scale-105 z-10' : 'hover:bg-neutral-800/50 text-neutral-500'}
                  ${selectedRarity === r ? RARITY_CONFIG[r].color : ''}
                `}
                title={RARITY_CONFIG[r].description}
              >
                <Star className={`w-4 h-4 mb-1 ${selectedRarity === r ? 'fill-current' : ''}`} />
                <span className="text-[10px] uppercase font-bold tracking-tighter sm:tracking-normal">{r}</span>
                {selectedRarity === r && (
                   <div className={`absolute inset-0 border ${RARITY_CONFIG[r].border} rounded-lg opacity-50 pointer-events-none`}></div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={state.isLoading ? undefined : generateBrainrotBatch}
            disabled={state.isLoading}
            className={`
              w-full py-6 px-8 rounded-2xl
              bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
              font-black text-2xl uppercase tracking-wider font-comic
              shadow-[0_0_40px_rgba(124,58,237,0.4)]
              border-2 border-white/20 hover:border-white/60
              transform transition-all duration-200
              flex items-center justify-center gap-3
              ${state.isLoading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)]'}
            `}
          >
            {state.isLoading ? (
              <>
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span>Cocinando {selectedRarity}...</span>
              </>
            ) : (
              <>
                <Skull className="w-8 h-8 animate-bounce" />
                <span>Generar {selectedRarity} (x3)</span>
              </>
            )}
          </button>
          
          {state.error && (
            <div className="w-full bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-center text-sm font-bold">
              {state.error}
            </div>
          )}
        </div>

        {/* Pokedex Stats/Controls */}
        {state.entries.length > 0 && (
          <div className="w-full flex justify-between items-end border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                Colección <span className="bg-neutral-800 px-2 py-0.5 rounded-md text-sm text-neutral-400">{state.entries.length}</span>
              </h3>
            </div>
            <button 
              onClick={clearPokedex}
              className="text-neutral-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Borrar Todo
            </button>
          </div>
        )}

        {/* Pokedex Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          
          {state.isLoading && (
             // Skeleton Loaders
             <>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`bg-neutral-800/40 rounded-3xl p-4 h-[500px] border animate-pulse flex flex-col gap-4 ${RARITY_CONFIG[selectedRarity].border} border-dashed opacity-50`}>
                  <div className="w-full aspect-square bg-neutral-800 rounded-2xl"></div>
                  <div className="h-8 bg-neutral-800 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-neutral-800 rounded w-full"></div>
                  <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
                </div>
              ))}
             </>
          )}

          {state.entries.map((entry) => (
            <BrainrotCard 
              key={entry.id} 
              entry={entry} 
              onGenerate3D={generateModelSheet}
              onDownload={downloadImage}
            />
          ))}

          {!state.isLoading && state.entries.length === 0 && (
            <div className="col-span-full py-20 text-center text-neutral-600 flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center mb-2">
                <Skull className="w-10 h-10 opacity-30" />
              </div>
              <p className="text-xl font-medium">Tu Pokedex está vacía.</p>
              <p className="text-sm">Selecciona una rareza y dale al botón.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;