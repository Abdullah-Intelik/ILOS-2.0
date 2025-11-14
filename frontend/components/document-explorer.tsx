"use client";

import React, { useState, useEffect } from 'react';
import { Folder, File, Download, ChevronRight, ChevronDown, Home, ArrowUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
}

interface DocumentExplorerProps {
  losId?: string;
  applicationType?: string;
  onFileSelect?: (file: FileItem) => void;
}

const DocumentExplorer: React.FC<DocumentExplorerProps> = ({ losId, applicationType, onFileSelect }) => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Inline preview state
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewMime, setPreviewMime] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState<boolean>(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // Cleanup blob URLs on change/unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Map display loan type to server folder name (Backend V2.0 compatible)
  const mapLoanTypeToSlug = (loanTypeLabel: string): string => {
    const raw = String(loanTypeLabel || '').trim()
    const lower = raw.toLowerCase()
    
    // Backend V2.0 product types
    if (lower === 'personal_loan' || lower === 'personal loan') return 'cashplus'
    if (lower === 'auto_loan' || lower === 'auto loan') return 'AutoLoan'
    if (lower === 'islamic_finance') return 'ameendrive'
    if (lower === 'sme_loan') return 'smeasaan'
    if (lower === 'credit_card') return 'creditcard'
    if (lower === 'instant_loan') return 'cashplus'
    
    // Keyword-based mapping to be resilient to casing and variations
    if (lower.includes('cash') && lower.includes('plus')) return 'cashplus'
    if (lower.includes('auto')) return 'AutoLoan'
    if (lower.includes('sme') && (lower.includes('asaan') || lower === 'smeasaan')) return 'smeasaan'
    if (lower.includes('commercial') && (lower.includes('vehicle') || lower.includes('sme'))) return 'commercialVehicle'
    if (lower.includes('ameendrive') || lower.includes('ameen drive')) return 'ameendrive'
    if (lower.includes('credit') && lower.includes('card')) return 'creditcard'
    
    // Fallbacks for exact known labels
    const map: Record<string, string> = {
      'autoloan': 'AutoLoan',
      'smeasaan': 'smeasaan',
      'commercialvehicle': 'commercialVehicle',
      'cashplus': 'cashplus',
      'ameendrive': 'ameendrive',
      'creditcard': 'creditcard',
    }
    
    console.log(`🗂️ Mapping loan type: "${loanTypeLabel}" → "${map[lower] || 'cashplus'}"`)
    
    return map[lower] || 'cashplus' // Default to cashplus instead of temp
  }

  // Load files for the provided path. If LOS/app type are provided and path is root, prefer filtered API (old behavior);
  // if navigating into subfolders (e.g., eavmu_docs), use explorer HTML.
  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      // If a LOS context is provided and we're at root, jump to the LOS folder path
      let effectivePath = path
      if (losId && applicationType && (path === '/' || path === '')) {
        const numericLosId = String(losId).replace('LOS-', '').replace('los-', '')
        const folderSlug = mapLoanTypeToSlug(applicationType)
        effectivePath = `/${folderSlug}/los-${numericLosId}`
        // Keep UI breadcrumbs in sync
        setCurrentPath(effectivePath)
      }

      // Backend V2.0: when at LOS root, use new Document Server's list-files API
      if (losId && applicationType && /\/los-\d+$/.test(effectivePath)) {
        const numericLosId = String(losId).replace('LOS-', '').replace('los-', '')
        const folderSlug = mapLoanTypeToSlug(applicationType)
        const apiUrl = `http://localhost:8086/list-files?loan_type=${folderSlug}&los_id=${numericLosId}`
        console.log(`📂 Fetching files from Document Server: ${apiUrl}`)
        const res = await fetch(apiUrl)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.files) && data.files.length > 0) {
            const fileItems: FileItem[] = data.files.map((doc: any) => ({
              name: doc.name,
              type: 'file' as const,
              path: doc.url, // Full URL from Document Server
              size: doc.size || 0
            }))
            setFiles(fileItems)
            console.log(`✅ Loaded ${fileItems.length} files from Document Server`)
            return
          }
        }
        // Fallback to explorer if API returned nothing
        console.log(`⚠️ No files found via list-files API, falling back to explorer`)
      }

      // Explorer listing (for subfolders or fallback)
      const response = await fetch(`http://localhost:8086/explorer${encodeURI(effectivePath)}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Treat missing folder as empty, no errors/toasts
          setFiles([])
          setLoading(false)
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const fileItems: FileItem[] = [];
      const rows = doc.querySelectorAll('table tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const nameCell = cells[0];
          const typeCell = cells[1];
          const actionCell = cells[2];
          const link = nameCell.querySelector('a');
          const icon = nameCell.querySelector('.icon');
          const name = link ? link.textContent?.trim() : nameCell.textContent?.trim();
          const type = typeCell.textContent?.trim();
          if (name && type) {
            const isFolder = type === 'Folder' || icon?.textContent?.includes('📁');
            const isFile = type === 'File' || icon?.textContent?.includes('📄');
            if (isFolder || isFile) {
              let itemPath = effectivePath;
              if (isFolder) {
                itemPath = link ? link.getAttribute('href')?.replace('/explorer', '') || effectivePath : effectivePath;
              } else {
                const actionLinks = actionCell.querySelectorAll('a');
                const viewLink = actionLinks?.[0] as HTMLAnchorElement | null;
                if (viewLink && viewLink.getAttribute('href')) {
                  itemPath = viewLink.getAttribute('href')!.replace('/explorer', '');
                }
              }
              const decodedOnce = itemPath.includes('%') ? decodeURIComponent(itemPath) : itemPath
              const encodedPath = decodedOnce.split('/').map(seg => encodeURIComponent(seg)).join('/')
              fileItems.push({
                name: name,
                type: isFolder ? 'folder' : 'file',
                path: encodedPath,
                size: isFile ? 0 : undefined
              });
            }
          }
        }
      });
      setFiles(fileItems)
    } catch (error: any) {
      // Gracefully swallow 404s already handled above. For other errors, show a soft message once.
      const message = String(error?.message || '')
      if (!message.includes('HTTP 404')) {
        console.warn('Document Explorer: load failed:', error)
        toast({
          title: "Could not load documents",
          description: "The folder may be empty or the server is unavailable.",
        })
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, losId, applicationType]);

  const handleFolderClick = (folder: FileItem) => {
    // Normalize folder path: strip leading /explorer if present
    const normalized = folder.path.startsWith('/explorer/')
      ? folder.path.replace('/explorer', '')
      : folder.path
    const newPath = normalized;
    setCurrentPath(newPath);
    
    // Toggle expanded state
    const newExpanded = new Set(expandedFolders);
    const key = newPath;
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file)
    handlePreview(file)
    if (onFileSelect) onFileSelect(file)
  };

  const handleDownload = async (file: FileItem) => {
    try {
      let downloadUrl;
      
      if (file.path.startsWith('/explorer/')) {
        // Use server-provided pre-encoded path as-is (legacy behavior)
        downloadUrl = `http://localhost:8086${file.path}`
      } else {
        const normalizedPathRaw = file.path.replace('/explorer', '')
        const normalizedPath = normalizedPathRaw.includes('%') ? decodeURIComponent(normalizedPathRaw) : normalizedPathRaw
        downloadUrl = `http://localhost:8086/explorer${encodeURI(normalizedPath)}`;
      }
      
      console.log('Downloading file:', downloadUrl);
      
      // Create a direct download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      link.target = '_blank';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `Downloading ${file.name}...`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = async (file: FileItem) => {
    try {
      // Check file type first
      const fileName = file.name.toLowerCase();
      const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm');
      const isImageFile = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                         fileName.endsWith('.png') || fileName.endsWith('.gif') || 
                         fileName.endsWith('.bmp') || fileName.endsWith('.webp');
      const isPdfFile = fileName.endsWith('.pdf');
      const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || 
                        fileName.endsWith('.json') || fileName.endsWith('.xml');
      
      if (!isHtmlFile && !isImageFile && !isPdfFile && !isTextFile) {
        toast({
          title: "Preview not available",
          description: `This file type (${file.name.split('.').pop()}) cannot be previewed. Please download it instead.`,
          variant: "destructive",
        });
        return;
      }

      let fileUrl;
      
      if (file.path.startsWith('/explorer/')) {
        // Legacy behavior: trust server path and fetch directly
        fileUrl = `http://localhost:8086${file.path}`
      } else {
        const normalizedPathRaw = file.path.replace('/explorer', '')
        const normalizedPath = normalizedPathRaw.includes('%') ? decodeURIComponent(normalizedPathRaw) : normalizedPathRaw
        fileUrl = `http://localhost:8086/explorer${encodeURI(normalizedPath)}`;
      }
      
      console.log('Fetching file for preview:', fileUrl);
      
      // Try to fetch the file content first
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get the file content
      const fileContent = await response.blob();
      
      // Create a blob URL for the file
      const blobUrl = URL.createObjectURL(fileContent);
      
      // Open the blob URL in a new tab
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to view files.",
          variant: "destructive",
        });
        return;
      }
      
      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      toast({
        title: "Opening preview",
        description: `Opening ${file.name} in a new tab...`,
      });
    } catch (error) {
      console.error('Error opening file preview:', error);
      
      // Fallback: try opening directly
      try {
        let fallbackUrl;
        
        if (file.path.startsWith('/explorer/')) {
          fallbackUrl = `http://localhost:8086${file.path}`
        } else {
          const normalizedPathRaw2 = file.path.replace('/explorer', '')
          const normalizedPath2 = normalizedPathRaw2.includes('%') ? decodeURIComponent(normalizedPathRaw2) : normalizedPathRaw2
          fallbackUrl = `http://localhost:8086/explorer${encodeURI(normalizedPath2)}`;
        }
        
        window.open(fallbackUrl, '_blank');
        
        toast({
          title: "Opening file",
          description: `Opening ${file.name} in a new tab...`,
        });
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast({
          title: "Error opening preview",
          description: "Could not open the file preview. Please try downloading it instead.",
          variant: "destructive",
        });
      }
    }
  };

  // Build a reliable viewer URL from a FileItem
  const buildViewerUrl = (file: FileItem): string => {
    // If path is already a full URL (from Document Server's /list-files API), use it directly
    if (file.path.startsWith('http://') || file.path.startsWith('https://')) {
      return file.path
    }
    // Legacy: paths from /explorer endpoint
    if (file.path.startsWith('/explorer/')) {
      return `http://localhost:8086${file.path}`
    }
    const normalizedPathRaw = file.path.replace('/explorer', '')
    const normalizedPath = normalizedPathRaw.includes('%') ? decodeURIComponent(normalizedPathRaw) : normalizedPathRaw
    return `http://localhost:8086/explorer${encodeURI(normalizedPath)}`
  }

  // Inline preview in right-side panel
  const handlePreview = async (file: FileItem) => {
    try {
      setPreviewError(null)
      setPreviewLoading(true)
      setSelectedFile(file)

      // Determine if previewable by extension
      const fileName = file.name.toLowerCase();
      const isHtmlFile = fileName.endsWith('.html') || fileName.endsWith('.htm');
      const isImageFile = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                         fileName.endsWith('.png') || fileName.endsWith('.gif') || 
                         fileName.endsWith('.bmp') || fileName.endsWith('.webp');
      const isPdfFile = fileName.endsWith('.pdf');
      const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || 
                        fileName.endsWith('.json') || fileName.endsWith('.xml');

      if (!isHtmlFile && !isImageFile && !isPdfFile && !isTextFile) {
        setPreviewError('Preview not available for this file type. Please download instead.')
        setPreviewLoading(false)
        return
      }

      const fileUrl = buildViewerUrl(file)
      const response = await fetch(fileUrl, { method: 'GET', headers: { 'Accept': '*/*' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      setPreviewUrl(blobUrl)
      setPreviewMime(blob.type || null)
    } catch (err: any) {
      console.error('Inline preview error:', err)
      setPreviewError(err?.message || 'Could not open preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const navigateToParent = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const newPath = '/' + pathParts.slice(0, -1).join('/');
      setCurrentPath(newPath);
    }
  };

  const navigateToRoot = () => {
    setCurrentPath('/');
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  const restrictNavigation = Boolean(losId && applicationType)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Explorer</h3>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          {!restrictNavigation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToRoot}
              className="p-1 h-auto"
            >
              <Home className="h-4 w-4" />
            </Button>
          )}
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {restrictNavigation ? (
                <span className="p-1 h-auto text-gray-700">{crumb}</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPath = '/' + breadcrumbs.slice(0, index + 1).join('/');
                    setCurrentPath(newPath);
                  }}
                  className="p-1 h-auto text-blue-600 hover:text-blue-800"
                >
                  {crumb}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="mb-3">
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Back button disabled in restricted mode */}
        {!restrictNavigation && currentPath !== '/' && (
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToParent}
            className="mb-3"
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Back to Parent
          </Button>
        )}
      </div>

      {/* Two-column layout: list + preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[65vh]">
        {/* File List */}
        <div className="border rounded-lg overflow-hidden md:col-span-1 h-full">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading files...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No files match your search' : 'This folder is empty'}
            </div>
          ) : (
            <div className="divide-y overflow-auto h-full">
              {filteredFiles.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${selectedFile?.name === file.name && selectedFile?.path === file.path ? 'bg-gray-50' : ''}`}
                  onClick={() => file.type === 'folder' ? handleFolderClick(file) : handleFileClick(file)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {file.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-blue-500" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-sm font-medium truncate" title={file.name}>{file.name}</span>
                    {file.type === 'folder' && (
                      <Badge variant="secondary" className="text-xs">Folder</Badge>
                    )}
                  </div>
                  {file.type === 'file' && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                        className="p-1 h-auto"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handlePreview(file); }}
                        className="p-1 h-auto"
                        title="Preview file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="border rounded-lg p-3 md:col-span-2 h-full overflow-hidden">
          {!selectedFile ? (
            <div className="h-full flex items-center justify-center text-gray-500">Select a file to preview</div>
          ) : previewLoading ? (
            <div className="h-full flex items-center justify-center text-gray-500">Loading preview…</div>
          ) : previewError ? (
            <div className="text-sm text-red-600">{previewError}</div>
          ) : previewUrl ? (
            <div className="h-full flex flex-col">
              {/* Render by mime */}
              <div className="flex-1 overflow-auto">
                {previewMime?.includes('pdf') ? (
                  <iframe src={previewUrl} className="w-full h-full" title={selectedFile.name} />
                ) : previewMime?.startsWith('image/') ? (
                  <img src={previewUrl} alt={selectedFile.name} className="w-full h-full object-contain" />
                ) : (
                  <iframe src={previewUrl} className="w-full h-full" title={selectedFile.name} />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 text-xs text-gray-500">
        {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>
    </div>
  );
};

export default DocumentExplorer; 