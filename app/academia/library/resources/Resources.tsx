"use client";
import React, { useState, useMemo } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa';
import { BsFileImage } from 'react-icons/bs';
import { FaChevronRight } from 'react-icons/fa';
import type { Folders, Folder, Children } from '@/types/Folders';
import Fuse from 'fuse.js';

interface ResourcesProps {
  folders: Folders;
  children?: React.ReactNode; 
}

export default function Resources({ folders }: ResourcesProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const fuse = new Fuse(folders, {
    keys: ["name"],
    threshold: 0.4,
  });

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;


    const searchResults = fuse.search(searchQuery);

    return searchResults.map((result) => result.item)

  }, [searchQuery])

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (rawUrl: string, url: string) => {
    const decodedUrl = decodeURIComponent(rawUrl);
    window.open(`https://docs.google.com/gview?url=https://class-pro.vercel.app/academia/library/render?id=${decodedUrl}`, "_blank");
  };

  const renderItem = (item: Folder | Children, level: number = 0) => {
    const isFolder = item.type === 'dir';
    if (isFolder && (!item.children || item.children.length === 0)) {
      return null;
    }
    const isExpanded = expandedFolders.has(item.path);

    return (
      <div key={item.path} style={{ marginLeft: `${Math.min(level, 1) * 24}px` }} className={`relative ${isFolder && isExpanded ? 'before:absolute before:w-[1px] before:h-[calc(100%-20px)] before:bg-light-accent/20 dark:before:bg-dark-accent/20 before:left-[12px] before:top-[28px]' : ''}`}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-light-accent/5 dark:hover:bg-dark-accent/5 transition-colors duration-150 ${isFolder && isExpanded ? 'bg-light-accent/10 dark:bg-dark-accent/10' : ''}`}
          onClick={() => isFolder ? toggleFolder(item.path) : handleFileClick(item.urls.rawUrl, item.urls.url)}
        >
          <div className="flex items-center gap-2">
            {isFolder && (
              <FaChevronRight
                className={`text-light-accent dark:text-dark-accent transition-transform duration-200 ${isExpanded ? 'transform rotate-90' : ''}`}
                size={10}
              />
            )}
            {isFolder ? (
              isExpanded ? (
                <FaFolderOpen className="text-light-accent dark:text-dark-accent text-sm" />
              ) : (
                <FaFolder className="text-light-accent dark:text-dark-accent text-sm" />
              )
            ) : (
              (() => {
                const ext = item.name.split('.').pop()?.toLowerCase();
                const IconComponent = (() => {
                  switch (ext) {
                    case 'pdf': return FaFilePdf;
                    case 'doc':
                    case 'docx': return FaFileWord;
                    case 'xls':
                    case 'xlsx': return FaFileExcel;
                    case 'ppt':
                    case 'pptx': return FaFilePowerpoint;
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                    case 'bmp':
                    case 'webp': return BsFileImage;
                    default: return FaFile;
                  }
                })();
                return <IconComponent className="text-light-color/80 dark:text-dark-color/80 text-sm" />;
              })()
            )}
          </div>
          <span className="capitalize text-light-color/90 dark:text-dark-color/90 text-base">{item.name}</span>
        </div>
        {isFolder && isExpanded && item.children && (
          <div className="mt-1">
            {item.children.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main
      className="relative p-2"
      style={{
        fontFamily: "'Bricolage Grotesque'",
      }}
    >
      <div className="flex flex-col md:flex-row justify-between mb-6 px-2 gap-5 items-center">
        <div
          id="title"
          className="title transition duration-200 flex flex-col gap-1 dark:text-dark-color items-center md:items-start justify-start text-light-color"
        >
          <h1 className="font-semibold text-4xl">Resources.</h1>

          <p className="dark:text-dark-color text-light-color transition duration-200 opacity-50 text-md font-medium">
            A dumpster fire of available files from the web.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search for resources"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2 px-4 rounded-xl focus:outline-hidden bg-light-input dark:bg-dark-input max-w-80 text-light-color dark:text-dark-color"
        />
      </div>

      <div className="space-y-2 px-3">
        {filteredFolders.map((folder) => renderItem(folder))}
      </div>
    </main>
  );
}
