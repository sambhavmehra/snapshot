import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUploader({ onUpload, isUploading }) {
  const [isHovered, setIsHovered] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovered(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile && !isUploading) {
      onUpload(selectedFile);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 overflow-hidden bg-white/50 backdrop-blur-sm w-full h-[350px]
        ${isHovered ? 'border-primary-500 bg-primary-50/50 shadow-lg' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'}`}
      onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className={`absolute inset-0 w-full h-full opacity-0 z-10 ${preview ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} 
      />
      
      <AnimatePresence mode="wait">
      {preview ? (
        <motion.div 
          key="preview"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 w-full h-full z-20 flex flex-col p-4"
        >
            <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-slate-100/50 flex items-center justify-center border border-slate-200">
              <img src={preview} alt="Upload preview" className={`max-w-full max-h-[85%] object-contain rounded drop-shadow-md transition-all duration-500 ${isUploading ? 'blur-sm opacity-60 scale-95' : ''}`} />
              
              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                   <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-full flex items-center shadow-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full border-[3px] border-primary-600 border-t-transparent animate-spin mr-3"></span>
                      <span className="font-bold text-slate-800">Analyzing Image...</span>
                   </div>
                </div>
              )}
            </div>

            {!isUploading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-between px-2 gap-4"
              >
                <button 
                  onClick={() => { setPreview(null); setSelectedFile(null); }}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAnalyzeClick}
                  className="flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 transition-all shadow-md shadow-primary-500/20 active:scale-95 group"
                >
                  <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                  Analyze Image
                </button>
              </motion.div>
            )}
        </motion.div>
      ) : (
        <motion.div 
          key="upload-prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center pointer-events-none z-0"
        >
            <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3 group-hover:rotate-6 transition-transform">
              <UploadCloud size={40} className="text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Drag & drop an image here</h3>
            <p className="text-slate-500 mb-6 text-center max-w-sm font-medium">Capture notes, diagrams, or real-world objects to start your learning session.</p>
            <div className="flex items-center gap-2 text-white font-bold bg-slate-900 px-6 py-3 rounded-full hover:bg-slate-800 transition-colors shadow-sm">
              <ImageIcon size={18} />
              <span>Browse Files</span>
            </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
