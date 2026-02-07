import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function FreeImages() {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<'unsplash' | 'pexels' | 'both'>('both');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'squarish' | 'all'>('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const { data: unsplashImages, isLoading: unsplashLoading, refetch: refetchUnsplash } = trpc.freeImages.searchUnsplash.useQuery(
    {
      query: query || 'technology',
      perPage: 12,
      orientation: orientation === 'all' ? undefined : orientation as 'landscape' | 'portrait' | 'squarish',
    },
    { enabled: platform === 'unsplash' || platform === 'both' }
  );

  const { data: pexelsImages, isLoading: pexelsLoading, refetch: refetchPexels } = trpc.freeImages.searchPexels.useQuery(
    {
      query: query || 'technology',
      perPage: 12,
      orientation: orientation === 'all' ? undefined : orientation as 'landscape' | 'portrait',
    },
    { enabled: platform === 'pexels' || platform === 'both' }
  );

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (platform === 'unsplash' || platform === 'both') {
      refetchUnsplash();
    }
    if (platform === 'pexels' || platform === 'both') {
      refetchPexels();
    }

    toast.success(`Searching for "${query}"...`);
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const isLoading = unsplashLoading || pexelsLoading;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Free Stock Images</h1>
        <p className="text-muted-foreground">
          Search millions of free high-quality photos from Unsplash and Pexels
        </p>
      </div>

      {/* Search Controls */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search for images (e.g., 'technology', 'nature', 'business')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both (Unsplash + Pexels)</SelectItem>
                  <SelectItem value="unsplash">Unsplash Only</SelectItem>
                  <SelectItem value="pexels">Pexels Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Orientation</label>
              <Select value={orientation} onValueChange={(v) => setOrientation(v as typeof orientation)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orientations</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="squarish">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedImages.length} images selected</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImages([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Results ({(unsplashImages?.images?.length || 0) + (pexelsImages?.images?.length || 0)})
          </TabsTrigger>
          {(platform === 'unsplash' || platform === 'both') && (
            <TabsTrigger value="unsplash">
              Unsplash ({unsplashImages?.images?.length || 0})
            </TabsTrigger>
          )}
          {(platform === 'pexels' || platform === 'both') && (
            <TabsTrigger value="pexels">
              Pexels ({pexelsImages?.images?.length || 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unsplashImages?.images?.map((img: any) => (
                <ImageCard
                  key={img.id}
                  id={img.id}
                  url={img.url}
                  photographer={img.photographer.name}
                  photographerUrl={img.photographer.profileUrl}
                  platform="Unsplash"
                  attribution={img.attributionHtml}
                  isSelected={selectedImages.includes(img.id)}
                  onToggleSelect={() => toggleImageSelection(img.id)}
                  onDownload={() => handleDownload(img.downloadUrl, `unsplash-${img.id}.jpg`)}
                />
              ))}
              {pexelsImages?.images?.map((img: any) => (
                <ImageCard
                  key={img.id}
                  id={String(img.id)}
                  url={img.url}
                  photographer={img.photographer}
                  photographerUrl={img.photographerUrl}
                  platform="Pexels"
                  attribution={img.attributionHtml}
                  isSelected={selectedImages.includes(String(img.id))}
                  onToggleSelect={() => toggleImageSelection(String(img.id))}
                  onDownload={() => handleDownload(img.originalUrl, `pexels-${img.id}.jpg`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unsplash" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unsplashImages?.images?.map((img: any) => (
              <ImageCard
                key={img.id}
                id={img.id}
                url={img.url}
                photographer={img.photographer.name}
                photographerUrl={img.photographer.profileUrl}
                platform="Unsplash"
                attribution={img.attributionHtml}
                isSelected={selectedImages.includes(img.id)}
                onToggleSelect={() => toggleImageSelection(img.id)}
                onDownload={() => handleDownload(img.downloadUrl, `unsplash-${img.id}.jpg`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pexels" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pexelsImages?.images?.map((img: any) => (
              <ImageCard
                key={img.id}
                id={String(img.id)}
                url={img.url}
                photographer={img.photographer}
                photographerUrl={img.photographerUrl}
                platform="Pexels"
                attribution={img.attributionHtml}
                isSelected={selectedImages.includes(String(img.id))}
                onToggleSelect={() => toggleImageSelection(String(img.id))}
                onDownload={() => handleDownload(img.originalUrl, `pexels-${img.id}.jpg`)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {!isLoading && (unsplashImages?.images?.length === 0 && pexelsImages?.images?.length === 0) && (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No images found</h3>
          <p className="text-muted-foreground">
            Try a different search query or adjust your filters
          </p>
        </Card>
      )}
    </div>
  );
}

interface ImageCardProps {
  id: string;
  url: string;
  photographer: string;
  photographerUrl: string;
  platform: string;
  attribution: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDownload: () => void;
}

function ImageCard({
  id,
  url,
  photographer,
  photographerUrl,
  platform,
  attribution,
  isSelected,
  onToggleSelect,
  onDownload,
}: ImageCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onToggleSelect}
    >
      <div className="aspect-[4/3] relative">
        <img
          src={url}
          alt={`Photo by ${photographer}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              window.open(photographerUrl, '_blank');
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary-foreground"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate">Photo by {photographer}</p>
          <Badge variant="outline" className="text-xs">
            {platform}
          </Badge>
        </div>
        <div
          className="text-xs text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: attribution }}
        />
      </div>
    </Card>
  );
}
