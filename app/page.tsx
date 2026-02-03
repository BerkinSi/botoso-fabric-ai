"use client";

import { useState } from "react";
import { Loader2, Sparkles, Download } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  const [couchImage, setCouchImage] = useState<string | null>(null);
  const [fabricImage, setFabricImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = couchImage && fabricImage && !isLoading;

  const handleGenerate = async () => {
    if (!couchImage || !fabricImage) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couchImage,
          fabricImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "fabric-ai-result.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="px-4 py-6 md:py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Fabric AI Generator
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Upload a couch and a fabric texture to see the magic
        </p>
      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <ImageUploader
          label="Base Couch"
          description="Upload an image of your couch (structural reference)"
          image={couchImage}
          onImageSelect={setCouchImage}
        />
        <ImageUploader
          label="Fabric Texture"
          description="Upload a fabric texture (style reference)"
          image={fabricImage}
          onImageSelect={setFabricImage}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-base
          flex items-center justify-center gap-2
          transition-all duration-200
          ${
            canGenerate
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Result Section */}
      {generatedImage && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Result</h2>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
            <img
              src={generatedImage}
              alt="Generated result"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Loading Placeholder */}
      {isLoading && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Result</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-100 h-64 md:h-80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Creating your design...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This may take up to 60 seconds
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
